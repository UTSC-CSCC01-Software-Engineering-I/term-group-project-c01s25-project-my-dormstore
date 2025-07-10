import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

const sampleProducts = [
  {
    name: "Basic Bedding Package",
    price: 89.99,
    description: "Complete bedding set including sheets, comforter, and pillow",
    rating: 4.5
  },
  {
    name: "Laundry Essentials",
    price: 44.99,
    description: "Laundry basket, detergent, and fabric softener",
    rating: 4.2
  },
  {
    name: "Kitchen Starter Kit",
    price: 99.95,
    description: "Basic kitchen essentials for dorm cooking",
    rating: 4.7
  },
  {
    name: "Tech Essentials",
    price: 45.99,
    description: "Extension cords, power strips, and USB cables",
    rating: 4.3
  },
  {
    name: "Cleaning Supplies",
    price: 39.99,
    description: "All-purpose cleaner, paper towels, and trash bags",
    rating: 4.1
  }
];

async function addSampleProducts() {
  const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PWD,
    port: process.env.PG_PORT,
  });

  try {
    console.log('Adding sample products to database...');
    
    let addedCount = 0;
    
    for (const product of sampleProducts) {
      const result = await pool.query(
        'INSERT INTO products (name, price, description, rating) VALUES ($1, $2, $3, $4) RETURNING id',
        [product.name, product.price, product.description, product.rating]
      );
      
      addedCount++;
      console.log(`Added: ${product.name} - $${product.price}`);
    }
    
    console.log(`\nSuccessfully added ${addedCount} sample products!`);
    
    // Show all products
    const allProducts = await pool.query('SELECT * FROM products ORDER BY name');
    console.log('\nAll products in database:');
    allProducts.rows.forEach(product => {
      console.log(`   - ${product.name}: $${product.price}`);
    });
    
  } catch (error) {
    console.error('Failed to add sample products:', error.message);
  } finally {
    await pool.end();
  }
}

addSampleProducts(); 