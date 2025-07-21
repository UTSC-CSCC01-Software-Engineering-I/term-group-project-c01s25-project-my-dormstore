import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

async function checkDatabaseContents() {
  const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PWD,
    port: process.env.PG_PORT,
  });

  try {
    console.log('Checking database contents...\n');
    
    // Check products
    console.log('PRODUCTS:');
    const productsResult = await pool.query('SELECT id, name, category, price FROM products ORDER BY category, name');
    if (productsResult.rows.length === 0) {
      console.log('   No products found in database');
    } else {
      const productsByCategory = {};
      productsResult.rows.forEach(product => {
        const category = product.category || 'Uncategorized';
        if (!productsByCategory[category]) {
          productsByCategory[category] = [];
        }
        productsByCategory[category].push(product);
      });
      
      Object.keys(productsByCategory).forEach(category => {
        console.log(`\n   ${category}:`);
        productsByCategory[category].forEach(product => {
          console.log(`     - ${product.name} ($${product.price}) [ID: ${product.id}]`);
        });
      });
    }
    
    // Check packages
    console.log('\n\nPACKAGES:');
    const packagesResult = await pool.query('SELECT id, name, category, price FROM packages ORDER BY category, name');
    if (packagesResult.rows.length === 0) {
      console.log('   No packages found in database');
    } else {
      const packagesByCategory = {};
      packagesResult.rows.forEach(pkg => {
        const category = pkg.category || 'Uncategorized';
        if (!packagesByCategory[category]) {
          packagesByCategory[category] = [];
        }
        packagesByCategory[category].push(pkg);
      });
      
      Object.keys(packagesByCategory).forEach(category => {
        console.log(`\n   ${category}:`);
        packagesByCategory[category].forEach(pkg => {
          console.log(`     - ${pkg.name} ($${pkg.price}) [ID: ${pkg.id}]`);
        });
      });
    }
    
    // Check package items (relationships)
    console.log('\n\nPACKAGE ITEMS (Relationships):');
    const packageItemsResult = await pool.query(`
      SELECT p.name as package_name, pr.name as product_name, pi.quantity
      FROM package_items pi
      JOIN packages p ON pi.package_id = p.id
      JOIN products pr ON pi.product_id = pr.id
      ORDER BY p.name, pr.name
    `);
    
    if (packageItemsResult.rows.length === 0) {
      console.log('   No package items found - packages have no products assigned');
    } else {
      const packageItems = {};
      packageItemsResult.rows.forEach(item => {
        if (!packageItems[item.package_name]) {
          packageItems[item.package_name] = [];
        }
        packageItems[item.package_name].push({
          product: item.product_name,
          quantity: item.quantity
        });
      });
      
      Object.keys(packageItems).forEach(packageName => {
        console.log(`\n   ${packageName}:`);
        packageItems[packageName].forEach(item => {
          console.log(`     - ${item.product} (qty: ${item.quantity})`);
        });
      });
    }
    
    // Summary stats
    console.log('\n\n📊 SUMMARY:');
    console.log(`   Total Products: ${productsResult.rows.length}`);
    console.log(`   Total Packages: ${packagesResult.rows.length}`);
    console.log(`   Total Package Items: ${packageItemsResult.rows.length}`);
    
  } catch (error) {
    console.error('Error checking database:', error.message);
  } finally {
    await pool.end();
  }
}

checkDatabaseContents(); 