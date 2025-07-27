import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

async function addPackageCart() {
  const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PWD,
    port: process.env.PG_PORT,
  });

  try {
    console.log('Adding package cart table...');
    
    // Create package_cart_items table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS package_cart_items (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        package_id INTEGER NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, package_id)
      )
    `);
    
    console.log('✅ package_cart_items table created successfully!');
    console.log('   - Supports adding packages to cart');
    console.log('   - Unique constraint prevents duplicate packages per user');
    console.log('   - Quantity tracking for package cart items');
    
  } catch (error) {
    console.error('Failed to create package cart table:', error.message);
  } finally {
    await pool.end();
  }
}

addPackageCart(); 