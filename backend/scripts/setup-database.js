import fs from 'fs';
import path from 'path';
import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

async function setupDatabase() {
  const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PWD,
    port: process.env.PG_PORT,
  });

  try {
    console.log('🔧 Setting up database...');

    const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      console.error(` schema.sql not found at: ${schemaPath}`);
      process.exit(1);
    }

    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split the SQL file into statements based on semicolon, preserving FUNCTION blocks
    const statements = schema
      .split(/;\s*(?=CREATE|INSERT|ALTER|UPDATE|DELETE|DROP|--|$)/gi)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const [i, statement] of statements.entries()) {
      try {
        await pool.query(statement);
        console.log(` Executed statement ${i + 1}`);
      } catch (err) {
        console.error(` Error in statement ${i + 1}:\n${statement}\n↳ ${err.message}`);
      }
    }

    console.log('\n Database setup completed!');
  } catch (err) {
    console.error('Database setup failed:', err.message);
  } finally {
    await pool.end();
  }
}

setupDatabase();
