import pg from 'pg';
import 'dotenv/config';
import { packageCompositions } from './package-compositions.js';

const { Pool } = pg;

async function addPackageItems() {
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
    console.log('Adding package items to database...');
    
    let totalItemsAdded = 0;
    let packagesProcessed = 0;
    
    for (const composition of packageCompositions) {
      console.log(`\nProcessing package: ${composition.packageName}`);
      
      // Find the package ID
      const packageResult = await pool.query(
        'SELECT id FROM packages WHERE name = $1',
        [composition.packageName]
      );
      
      if (packageResult.rows.length === 0) {
        console.log(` Package "${composition.packageName}" not found in database`);
        continue;
      }
      
      const packageId = packageResult.rows[0].id;
      let itemsAddedForPackage = 0;
      
      for (const productInfo of composition.products) {
        // Find the product ID
        const productResult = await pool.query(
          'SELECT id FROM products WHERE name = $1',
          [productInfo.name]
        );
        
        if (productResult.rows.length === 0) {
          console.log(`Product "${productInfo.name}" not found in database`);
          continue;
        }
        
        const productId = productResult.rows[0].id;
        
        // Insert into package_items (handle duplicates gracefully)
        try {
          await pool.query(
            'INSERT INTO package_items (package_id, product_id, quantity) VALUES ($1, $2, $3)',
            [packageId, productId, productInfo.quantity]
          );
          
          console.log(`Added: ${productInfo.name} (qty: ${productInfo.quantity})`);
          itemsAddedForPackage++;
          totalItemsAdded++;
        } catch (error) {
          if (error.code === '23505') { // Unique constraint violation
            console.log(`Product "${productInfo.name}" already exists in package`);
          } else {
            console.error(`Error adding "${productInfo.name}":`, error.message);
          }
        }
      }
      
      console.log(`Package complete: ${itemsAddedForPackage} items added`);
      packagesProcessed++;
    }
    
    console.log(`\nSuccessfully processed ${packagesProcessed} packages!`);
    console.log(`Total package items added: ${totalItemsAdded}`);
    
    // Show summary of packages and their item counts
    const summaryResult = await pool.query(`
      SELECT p.name, p.category, COUNT(pi.id) as item_count
      FROM packages p
      LEFT JOIN package_items pi ON p.id = pi.package_id
      GROUP BY p.id, p.name, p.category
      ORDER BY p.category, p.name
    `);
    
    console.log('\nPackage Summary:');
    summaryResult.rows.forEach(row => {
      console.log(`${row.name} (${row.category}): ${row.item_count} items`);
    });
    
  } catch (error) {
    console.error('Failed to add package items:', error.message);
  } finally {
    await pool.end();
  }
}

addPackageItems(); 