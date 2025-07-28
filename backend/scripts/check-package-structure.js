import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

async function checkPackageStructure() {
  const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PWD,
    port: process.env.PG_PORT,
  });

  try {
    console.log('Checking package structure...');
    
    const result = await pool.query(`
      SELECT p.id, p.name, COUNT(pi.product_id) as sub_products
      FROM packages p 
      LEFT JOIN package_items pi ON p.id = pi.package_id 
      GROUP BY p.id, p.name 
      ORDER BY p.id
    `);
    
    console.log('\n📦 Package Structure:');
    result.rows.forEach(row => {
      console.log(`   - ${row.name} (ID: ${row.id}): ${row.sub_products} sub-products`);
    });
    
    // Show packages with sub-products
    const packagesWithSubProducts = result.rows.filter(row => row.sub_products > 0);
    console.log(`\n🔗 Packages with sub-products: ${packagesWithSubProducts.length}`);
    
    if (packagesWithSubProducts.length > 0) {
      console.log('\n📋 Details of packages with sub-products:');
      for (const pkg of packagesWithSubProducts) {
        const details = await pool.query(`
          SELECT pi.quantity, p.name as product_name, p.inventory
          FROM package_items pi
          JOIN products p ON pi.product_id = p.id
          WHERE pi.package_id = $1
        `, [pkg.id]);
        
        console.log(`\n   ${pkg.name} (ID: ${pkg.id}):`);
        details.rows.forEach(item => {
          console.log(`     - ${item.product_name}: ${item.quantity} units (inventory: ${item.inventory})`);
        });
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkPackageStructure(); 