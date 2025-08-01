import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config(); // Load from .env

const pool = new Pool({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  password: process.env.PG_PWD,
  database: process.env.PG_DATABASE,
});

async function setupFunctions() {
  const sqlPath = path.join(process.cwd(), 'database', 'schema-functions.sql');

  try {
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    const client = await pool.connect();
    await client.query(sql);
    console.log("✅ Functions and triggers installed successfully.");
    client.release();
  } catch (error) {
    console.error("❌ Failed to install SQL functions:", error.message);
  } finally {
    await pool.end();
  }
}

setupFunctions();
