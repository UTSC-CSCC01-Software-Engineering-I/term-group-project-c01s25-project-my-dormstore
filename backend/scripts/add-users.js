import pg from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();
const { Pool } = pg;
const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PWD,
  port: process.env.PG_PORT,
});

async function addUsers() {
  try {
    const password1 = await bcrypt.hash('test123', 10);
    const password2 = await bcrypt.hash('hello456', 10);

    await pool.query(`
      INSERT INTO users (email, password, dorm, first_name, last_name, school) VALUES
      ('test1@example.com', $1, 'Dorm A', 'Test', 'User1', 'Test University'),
      ('test2@example.com', $2, 'Dorm B', 'Jane', 'Doe', 'Sample College')
    `, [password1, password2]);

    console.log('Users added successfully');
  } catch (err) {
    console.error('Error adding users:', err);
  } finally {
    await pool.end();
  }
}

addUsers();
