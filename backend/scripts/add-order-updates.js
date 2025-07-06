import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Pool } = pg;
const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PWD,
  port: process.env.PG_PORT,
});

async function addOrderUpdates() {
  try {
    await pool.query(`
      INSERT INTO order_updates (order_name, email, update_text) VALUES
      ('Alice', 'alice@example.com', 'Order placed successfully.'),
      ('Bob', 'bob@example.com', 'Order shipped. Expected delivery in 2 days.')
    `);

    console.log('Order updates added successfully');
  } catch (err) {
    console.error('Error adding order updates:', err);
  } finally {
    await pool.end();
  }
}

addOrderUpdates();
