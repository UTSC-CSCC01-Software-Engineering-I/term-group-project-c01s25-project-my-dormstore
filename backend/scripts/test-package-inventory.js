import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

async function testPackageInventory() {
  const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PWD,
    port: process.env.PG_PORT,
  });

  try {
    console.log('Testing package inventory management...');
    
    // Get a package with its related products
    const packageResult = await pool.query(`
      SELECT p.id, p.name, p.inventory as package_inventory,
             pi.product_id, pi.quantity as required_quantity,
             prod.name as product_name, prod.inventory as product_inventory
      FROM packages p
      LEFT JOIN package_items pi ON p.id = pi.package_id
      LEFT JOIN products prod ON pi.product_id = prod.id
      WHERE p.id = 5
    `);
    
    if (packageResult.rows.length === 0) {
      console.log('No packages found');
      return;
    }
    
    const packageData = packageResult.rows[0];
    console.log(`\n📦 Package: "${packageData.name}" (ID: ${packageData.id})`);
    console.log(`   - Current package inventory: ${packageData.package_inventory}`);
    
    if (packageData.product_id) {
      console.log(`\n🔗 Related products:`);
      packageResult.rows.forEach(row => {
        if (row.product_id) {
          console.log(`   - ${row.product_name} (ID: ${row.product_id})`);
          console.log(`     Required quantity: ${row.required_quantity}`);
          console.log(`     Available inventory: ${row.product_inventory}`);
          console.log(`     Max packages possible: ${Math.floor(row.product_inventory / row.required_quantity)}`);
        }
      });
    } else {
      console.log(`\n📦 This package has no sub-products (standalone package)`);
    }
    
    // Test inventory reduction
    console.log('\n🧪 Testing inventory reduction...');
    
    // Simulate reducing product inventory
    const testProductId = packageData.product_id;
    if (testProductId) {
      const initialProductInventory = await pool.query(
        'SELECT inventory FROM products WHERE id = $1',
        [testProductId]
      );
      
      const initialPackageInventory = await pool.query(
        'SELECT inventory FROM packages WHERE id = $1',
        [packageData.id]
      );
      
      console.log(`\nInitial state:`);
      console.log(`   - Product inventory: ${initialProductInventory.rows[0].inventory}`);
      console.log(`   - Package inventory: ${initialPackageInventory.rows[0].inventory}`);
      
      // Reduce product inventory (this should trigger package inventory update)
      await pool.query(
        'UPDATE products SET inventory = inventory - 5 WHERE id = $1',
        [testProductId]
      );
      
      // Check final inventory
      const finalProductInventory = await pool.query(
        'SELECT inventory FROM products WHERE id = $1',
        [testProductId]
      );
      
      const finalPackageInventory = await pool.query(
        'SELECT inventory FROM packages WHERE id = $1',
        [packageData.id]
      );
      
      console.log(`\nAfter reducing product inventory by 5:`);
      console.log(`   - Product inventory: ${finalProductInventory.rows[0].inventory}`);
      console.log(`   - Package inventory: ${finalPackageInventory.rows[0].inventory}`);
      
      console.log('\n✅ Package inventory management test completed!');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await pool.end();
  }
}

testPackageInventory(); 