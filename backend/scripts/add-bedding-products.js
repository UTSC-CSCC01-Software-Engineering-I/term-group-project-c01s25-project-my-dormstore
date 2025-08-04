import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

// Two bedding products with multiple sizes for testing cart warnings
const beddingProducts = [
  {
    name: "Sheet Set",
    price: 34.99,
    category: "Bedding",
    description: "Soft, breathable sheet set. Includes fitted sheet, flat sheet, and 2 pillowcases.",
    rating: 4.5,
    size: "Twin, Twin XL, Double, Double XL, Queen",
    color: "White, Blue, Gray, Pink, Green, Purple, Red",
    image_url: "https://drive.google.com/thumbnail?id=19q27TuMy6T_3R70x1sthbZdVD9unD4cV"
  },
  {
    name: "Mattress Protector",
    price: 64.99,
    category: "Bedding",
    description: "Warm and cozy comforter. Perfect for dorm rooms.",
    rating: 4.3,
    size: "Twin, Twin XL, Double",
    color: "White, Blue, Gray, Navy, Pink, Green",
    image_url: "https://drive.google.com/thumbnail?id=1Ax2TSEvNWVekRdxvS8WYFt3lZRbjwsuz"
  }, 
  {
    name: "Comforter",
    price: 64.99,
    category: "Bedding",
    description: "Warm and cozy comforter. Perfect for dorm rooms.",
    rating: 4.3,
    size: "Twin, Twin XL, Double",
    color: "White, Blue, Gray, Navy, Pink, Green",
    image_url: "https://drive.google.com/thumbnail?id=1HrjtTbNDsUEVemLKRGFeFpuoVSiCuMai"
  }
];

async function addBeddingProducts() {
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
    console.log('Adding bedding products to database...');
    
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const product of beddingProducts) {
      try {
        // Check if product already exists
        const existingResult = await pool.query(
          'SELECT id FROM products WHERE name = $1 AND category = $2',
          [product.name, product.category]
        );
        
        if (existingResult.rows.length > 0) {
          console.log(`Skipped (already exists): ${product.name}`);
          skippedCount++;
          continue;
        }
        
        // Insert new product
        await pool.query(
          'INSERT INTO products (name, price, category, description, rating, size, color, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
          [product.name, product.price, product.category, product.description, product.rating, product.size, product.color, product.image_url]
        );
        
        addedCount++;
        console.log(` Added: ${product.name} - $${product.price}`);
        console.log(`   Sizes: ${product.size}`);
        console.log(`   Colors: ${product.color}`);
      } catch (error) {
        console.error(`Error adding ${product.name}:`, error.message);
      }
    }
    
    console.log(`\nSummary:`);
    console.log(`   - Added: ${addedCount} new bedding products`);
    console.log(`   - Skipped: ${skippedCount} existing products`);
    
    // Show bedding products
    const beddingResult = await pool.query(
      'SELECT name, size, color FROM products WHERE category = $1 ORDER BY name',
      ['Bedding']
    );
    
    console.log('\nBedding products in database:');
    beddingResult.rows.forEach(row => {
      console.log(`   - ${row.name}`);
      console.log(`     Sizes: ${row.size || 'None'}`);
      console.log(`     Colors: ${row.color || 'None'}`);
    });
    
    // Show total bedding products
    const totalResult = await pool.query(
      'SELECT COUNT(*) as total FROM products WHERE category = $1',
      ['Bedding']
    );
    
    console.log(`\nTotal bedding products in database: ${totalResult.rows[0].total}`);
    
  } catch (error) {
    console.error('Failed to add bedding products:', error.message);
  } finally {
    await pool.end();
  }
}

// Run the function
addBeddingProducts(); 