import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

async function addBillingAddressFields() {
  const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PWD,
    port: process.env.PG_PORT,
  });

  try {
    console.log('Adding billing address fields to orders table...');
    
    // Add billing address fields to orders table
    await pool.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS billing_first_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS billing_last_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS billing_address TEXT,
      ADD COLUMN IF NOT EXISTS billing_city VARCHAR(255),
      ADD COLUMN IF NOT EXISTS billing_province VARCHAR(255),
      ADD COLUMN IF NOT EXISTS billing_postal_code VARCHAR(20)
    `);
    
    console.log('Billing address fields added successfully!');
    
    // Show current table structure
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'orders' 
      ORDER BY ordinal_position
    `);
    
    console.log('\nCurrent orders table structure:');
    result.rows.forEach(row => {
      console.log(`   - ${row.column_name}: ${row.data_type}`);
    });
    
  } catch (error) {
    console.error('Failed to add billing address fields:', error.message);
  } finally {
    await pool.end();
  }
}

addBillingAddressFields(); 