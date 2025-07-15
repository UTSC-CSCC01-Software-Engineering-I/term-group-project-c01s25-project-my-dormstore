import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

async function clearPackages() {
  const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PWD,
    port: process.env.PG_PORT,
  });

  try {
    console.log('Clearing packages and package items from database...');
    
    // First, clear package_items (due to foreign key constraints)
    const packageItemsResult = await pool.query('DELETE FROM package_items');
    console.log(`Cleared ${packageItemsResult.rowCount} package items`);
    
    // Then, clear packages
    const packagesResult = await pool.query('DELETE FROM packages');
    console.log(`Cleared ${packagesResult.rowCount} packages`);
    
    // Reset the sequence counters to start fresh
    await pool.query('ALTER SEQUENCE packages_id_seq RESTART WITH 1');
    await pool.query('ALTER SEQUENCE package_items_id_seq RESTART WITH 1');
    console.log('Reset ID sequences');
    
    console.log('\nSuccessfully cleared all packages and package items!');
    console.log('You can now run the add-all-packages script to add fresh data.');
    
  } catch (error) {
    console.error('Failed to clear packages:', error.message);
  } finally {
    await pool.end();
  }
}

clearPackages(); 