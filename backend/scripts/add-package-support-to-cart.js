import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

async function addPackageSupportToCart() {
  const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PWD,
    port: process.env.PG_PORT,
  });

  try {
    console.log('Adding package support to cart_items table...');
    
    // Add item_type column to distinguish between products and packages
    await pool.query(`
      ALTER TABLE cart_items
      ADD COLUMN IF NOT EXISTS item_type VARCHAR(10) DEFAULT 'product'
    `);
    
    // Add package_id column for packages
    await pool.query(`
      ALTER TABLE cart_items
      ADD COLUMN IF NOT EXISTS package_id INTEGER REFERENCES packages(id) ON DELETE CASCADE
    `);
    
    console.log('✅ Package support added to cart_items table!');
    console.log('   - item_type column: distinguishes "product" vs "package"');
    console.log('   - package_id column: references packages table');
    console.log('   - product_id remains for products');
    console.log('   - Both can coexist in the same table');
    
  } catch (error) {
    console.error('Failed to add package support to cart:', error.message);
  } finally {
    await pool.end();
  }
}

addPackageSupportToCart(); 