import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

async function checkProducts() {
  const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PWD,
    port: process.env.PG_PORT,
  });

  try {
    console.log('Checking products in database...');
    
    const result = await pool.query('SELECT name, category FROM products LIMIT 10');
    
    console.log('\nProducts with categories:');
    result.rows.forEach(row => {
      console.log(`   - ${row.name}: ${row.category || 'NULL'}`);
    });
    
    const categoryResult = await pool.query('SELECT category, COUNT(*) as count FROM products GROUP BY category ORDER BY category');
    
    console.log('\nProducts by category:');
    categoryResult.rows.forEach(row => {
      console.log(`   ${row.category || 'NULL'}: ${row.count} products`);
    });
    
  } catch (error) {
    console.error('Error checking products:', error.message);
  } finally {
    await pool.end();
  }
}

checkProducts(); 