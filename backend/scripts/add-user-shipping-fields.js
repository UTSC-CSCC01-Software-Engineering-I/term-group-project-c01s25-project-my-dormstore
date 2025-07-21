import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

async function addShippingFields() {
  const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PWD,
    port: process.env.PG_PORT,
  });

  try {
    console.log('Adding shipping fields to users table...');
    
    // Add shipping fields to users table
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
      ADD COLUMN IF NOT EXISTS address TEXT,
      ADD COLUMN IF NOT EXISTS city VARCHAR(255),
      ADD COLUMN IF NOT EXISTS province VARCHAR(255),
      ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20)
    `);
    
    console.log('Shipping fields added successfully!');
    
    // Show current table structure
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('\nCurrent users table structure:');
    result.rows.forEach(row => {
      console.log(`   - ${row.column_name}: ${row.data_type}`);
    });
    
  } catch (error) {
    console.error('Failed to add shipping fields:', error.message);
  } finally {
    await pool.end();
  }
}

addShippingFields(); 