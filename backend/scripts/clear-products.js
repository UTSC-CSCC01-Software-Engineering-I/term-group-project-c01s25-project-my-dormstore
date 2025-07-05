import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

async function clearProducts() {
  const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PWD,
    port: process.env.PG_PORT,
  });

  try {
    console.log('Clearing existing products...');
    
    const result = await pool.query('DELETE FROM products RETURNING *');
    
    console.log(`Deleted ${result.rows.length} products`);
    result.rows.forEach(product => {
      console.log(`   - Removed: ${product.name}`);
    });
    
  } catch (error) {
    console.error('Failed to clear products:', error.message);
  } finally {
    await pool.end();
  }
}

clearProducts(); 