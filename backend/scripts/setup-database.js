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
    if (!fs.existsSync(schemaPath)) {
      console.error(`❌ schema.sql not found at: ${schemaPath}`);
      process.exit(1);
    }
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // execute the SQL
    await pool.query(schema);
    
    console.log('Database setup completed successfully!');
    
    // verify by querying the tables
    const tables = ['products', 'users', 'cart_items', 'orders', 'order_items', 'order_updates'];
    
    for (const table of tables) {
      try {
        const result = await pool.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`   - ${table}: ${result.rows[0].count} records`);
      } catch (err) {
        console.log(`   - ${table}: Error checking table`);
      }
    }
    
    // show products if any exist
    const productsResult = await pool.query('SELECT * FROM products LIMIT 3');
    if (productsResult.rows.length > 0) {
      console.log('\nSample products:');
      productsResult.rows.forEach(product => {
        console.log(`   - ${product.name}: $${product.price}`);
      });
    }
    
  } catch (error) {
    console.error('Database setup failed:', error.message);
  } finally {
    await pool.end();
  }
}

setupDatabase(); 