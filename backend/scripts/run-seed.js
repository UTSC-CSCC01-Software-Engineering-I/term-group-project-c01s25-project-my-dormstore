// scripts/run-seed.js
import fs from 'fs';
import path from 'path';
import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

async function runSeed() {
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

  try {
    console.log('Running seed.sql...');
    
    const seedPath = path.join(process.cwd(), 'database', 'seed.sql');
    if (!fs.existsSync(seedPath)) {
      console.error(`❌ seed.sql not found at: ${seedPath}`);
      process.exit(1);
    }
    const seedSql = fs.readFileSync(seedPath, 'utf8');

    await pool.query(seedSql);

    console.log('✅ Seed data inserted successfully!');
  } catch (err) {
    console.error('❌ Failed to run seed.sql:', err.message);
  } finally {
    await pool.end();
  }
}

runSeed();
