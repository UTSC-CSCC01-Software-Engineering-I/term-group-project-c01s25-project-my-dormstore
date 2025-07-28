import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

async function fixCartItemsConstraints() {
  const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PWD,
    port: process.env.PG_PORT,
  });

  try {
    console.log('Fixing cart_items table constraints...\n');
    
    // Make product_id nullable since packages don't have product_id
    await pool.query(`
      ALTER TABLE cart_items 
      ALTER COLUMN product_id DROP NOT NULL
    `);
    
    console.log('✅ Made product_id nullable');
    
    // Add a check constraint to ensure either product_id or package_id is set
    await pool.query(`
      ALTER TABLE cart_items 
      ADD CONSTRAINT check_product_or_package 
      CHECK ((product_id IS NOT NULL AND package_id IS NULL) OR (product_id IS NULL AND package_id IS NOT NULL))
    `);
    
    console.log('✅ Added check constraint for product_id or package_id');
    
    // Verify the changes
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'cart_items' AND column_name IN ('product_id', 'package_id')
      ORDER BY column_name
    `);
    
    console.log('\n📋 Updated cart_items constraints:');
    result.rows.forEach(row => {
      console.log(`   - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

fixCartItemsConstraints(); 