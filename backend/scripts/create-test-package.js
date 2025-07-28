import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

async function createTestPackage() {
  const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PWD,
    port: process.env.PG_PORT,
  });

  try {
    console.log('Creating test package with sub-products...');
    
    // Create a new package: "Study Essentials Package"
    const packageResult = await pool.query(`
      INSERT INTO packages (name, description, price, category, image_url, inventory)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `, [
      'Study Essentials Package',
      'Complete study setup with desk accessories, lighting, and tech essentials',
      89.99,
      'Living',
      '/images/desk.png',
      50
    ]);
    
    const packageId = packageResult.rows[0].id;
    console.log(`✅ Created package: Study Essentials Package (ID: ${packageId})`);
    
    // Add sub-products to the package
    const subProducts = [
      { product_id: 41, quantity: 1 }, // Magnetic White Board
      { product_id: 44, quantity: 1 }, // Desk Accessories
      { product_id: 40, quantity: 1 }, // String Lights
      { product_id: 26, quantity: 1 }, // Power Strip
      { product_id: 25, quantity: 1 }  // Extension Cord
    ];
    
    for (const subProduct of subProducts) {
      await pool.query(`
        INSERT INTO package_items (package_id, product_id, quantity)
        VALUES ($1, $2, $3)
      `, [packageId, subProduct.product_id, subProduct.quantity]);
    }
    
    console.log('✅ Added sub-products to package:');
    subProducts.forEach(sp => {
      console.log(`   - Product ID ${sp.product_id} (qty: ${sp.quantity})`);
    });
    
    // Check the package inventory calculation
    const inventoryResult = await pool.query(`
      SELECT inventory FROM packages WHERE id = $1
    `, [packageId]);
    
    console.log(`📦 Package inventory: ${inventoryResult.rows[0].inventory}`);
    
    // Show the complete package details
    const packageDetails = await pool.query(`
      SELECT p.*, 
             array_agg(pi.product_id || ':' || pi.quantity) as sub_products
      FROM packages p
      LEFT JOIN package_items pi ON p.id = pi.package_id
      WHERE p.id = $1
      GROUP BY p.id, p.name, p.description, p.price, p.category, p.image_url, p.inventory
    `, [packageId]);
    
    console.log('\n📋 Package Details:');
    console.log(`   Name: ${packageDetails.rows[0].name}`);
    console.log(`   Price: $${packageDetails.rows[0].price}`);
    console.log(`   Category: ${packageDetails.rows[0].category}`);
    console.log(`   Inventory: ${packageDetails.rows[0].inventory}`);
    console.log(`   Sub-products: ${packageDetails.rows[0].sub_products.join(', ')}`);
    
  } catch (error) {
    console.error('Failed to create test package:', error.message);
  } finally {
    await pool.end();
  }
}

createTestPackage(); 