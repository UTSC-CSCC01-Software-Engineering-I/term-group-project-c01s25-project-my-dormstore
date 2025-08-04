import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

async function addInventoryField() {
  const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      user: process.env.PG_USER,
      host: process.env.PG_HOST,
      database: process.env.PG_DATABASE,
      password: process.env.PG_PWD,
      port: process.env.PG_PORT,
    });

  try {
    console.log('Adding inventory field to products table...');
    
    // Add inventory column if it doesn't exist
    await pool.query(`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS inventory INTEGER DEFAULT 100
    `);
    
    console.log('Inventory field added successfully!');
    console.log('   - All existing products now have inventory = 100');
    console.log('   - New products will default to inventory = 100');
    
    // Show current product count
    const result = await pool.query('SELECT COUNT(*) FROM products');
    console.log(`   - Total products: ${result.rows[0].count}`);
    
  } catch (error) {
    console.error('Failed to add inventory field:', error.message);
  } finally {
    await pool.end();
  }
}

addInventoryField(); 