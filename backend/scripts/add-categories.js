import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

async function addCategories() {
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
    console.log('Adding category column to products table...');
    
    // Add category column if it doesn't exist
    await pool.query(`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'General'
    `);
    
    console.log('Category column added!');
    
  } catch (error) {
    console.error('Failed to add category column:', error.message);
  } finally {
    await pool.end();
  }
}

addCategories(); 