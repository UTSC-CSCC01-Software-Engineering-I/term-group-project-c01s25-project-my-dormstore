import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

async function addPackagesTables() {
  const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PWD,
    port: process.env.PG_PORT,
  });

  try {
    console.log('Adding packages and package_items tables...');
    
    // Create packages table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS packages (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT,
        rating DECIMAL(2,1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    //Create package_items table (many-to-many relationship)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS package_items (
        id SERIAL PRIMARY KEY,
        package_id INTEGER NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        quantity INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(package_id, product_id)
      )
    `);

    //add indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_package_items_package_id ON package_items(package_id)
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_package_items_product_id ON package_items(product_id)
    `);
    
    console.log('Packages tables created successfully!');
    console.log('   - packages table: for package/bundle products');
    console.log('   - package_items table: for items included in each package');
    
  } catch (error) {
    console.error('Failed to create packages tables:', error.message);
  } finally {
    await pool.end();
  }
}

addPackagesTables(); 