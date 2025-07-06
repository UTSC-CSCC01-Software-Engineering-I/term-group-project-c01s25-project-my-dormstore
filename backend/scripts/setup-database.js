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
    console.log('Setting up database...');
    
    // read the schema file
    const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // execute the SQL
    await pool.query(schema);
    
    console.log('Database setup completed successfully!');
    
    // verify by querying the products
    const result = await pool.query('SELECT * FROM products');
    console.log(` Found ${result.rows.length} products in database`);
    result.rows.forEach(product => {
      console.log(`   - ${product.name}: $${product.price}`);
    });
    
  } catch (error) {
    console.error(' Database setup failed:', error.message);
  } finally {
    await pool.end();
  }
}

setupDatabase(); 