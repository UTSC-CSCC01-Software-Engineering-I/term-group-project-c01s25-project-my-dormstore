import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config(); // Load from .env

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
