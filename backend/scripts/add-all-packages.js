import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

// All packages from your catalog
const packages = [
  // Bedding Category
  {
    name: "Basic Bedding Package",
    price: 89.99,
    category: "Bedding",
    description: "template",
    rating: 0.0
  },
  {
    name: "Standard Bedding Package", 
    price: 129.99,
    category: "Bedding",
    description: "template",
    rating: 0.0
  },
  {
    name: "Sleep Country Complete Bedding Package",
    price: 179.99,
    category: "Bedding", 
    description: "template",
    rating: 0.0
  },
  {
    name: "Deluxe Bedding Package",
    price: 219.99,
    category: "Bedding",
    description: "template",
    rating: 0.0
  },

  // Living Category
  {
    name: "Bathroom Essentials",
    price: 79.99,
    category: "Living",
    description: "template",
    rating: 0.0
  },
  {
    name: "Laundry Essentials",
    price: 64.99,
    category: "Living",
    description: "template",
    rating: 0.0
  },
  {
    name: "Tech Essentials",
    price: 45.99,
    category: "Living",
    description: "template",
    rating: 0.0
  },
  {
    name: "Organization Essentials",
    price: 89.99,
    category: "Living",
    description: "template",
    rating: 0.0
  },
  {
    name: "Cleaning Essentials",
    price: 39.99,
    category: "Living",
    description: "template",
    rating: 0.0
  },
  {
    name: "Decoration",
    price: 59.99,
    category: "Living",
    description: "template",
    rating: 0.0
  },
  {
    name: "Desk Essentials",
    price: 74.99,
    category: "Living",
    description: "template",
    rating: 0.0
  },
  {
    name: "Door Decor",
    price: 29.99,
    category: "Living",
    description: "template",
    rating: 0.0
  },

  // Caring Category
  {
    name: "Birthday Care",
    price: 34.99,
    category: "Caring",
    description: "template",
    rating: 0.0
  },
  {
    name: "Exam and Midterm",
    price: 39.99,
    category: "Caring",
    description: "template",
    rating: 0.0
  },
  {
    name: "Thinking of You",
    price: 29.99,
    category: "Caring",
    description: "template",
    rating: 0.0
  },
  {
    name: "Build Your Own",
    price: 0.00,
    category: "Caring",
    description: "template",
    rating: 0.0
  },
  {
    name: "Feel Better Soon",
    price: 32.99,
    category: "Caring",
    description: "template",
    rating: 0.0
  },
  {
    name: "New Semester",
    price: 49.99,
    category: "Caring",
    description: "template",
    rating: 0.0
  },
  {
    name: "Sleep Well",
    price: 44.99,
    category: "Caring",
    description: "template",
    rating: 0.0
  }
];

async function addAllPackages() {
  const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PWD,
    port: process.env.PG_PORT,
  });

  try {
    console.log('Adding all packages to database...');
    
    let addedCount = 0;
    
    for (const pkg of packages) {
      const result = await pool.query(
        'INSERT INTO packages (name, price, category, description, rating) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [pkg.name, pkg.price, pkg.category, pkg.description, pkg.rating]
      );
      
      addedCount++;
      console.log(`Added: ${pkg.name} (${pkg.category}) - $${pkg.price}`);
    }
    
    console.log(`\nSuccessfully added ${addedCount} packages!`);
    
    //show summary by category
    const categoryResult = await pool.query(
      'SELECT category, COUNT(*) as count FROM packages GROUP BY category ORDER BY category'
    );
    
    console.log('\nPackages by category:');
    categoryResult.rows.forEach(row => {
      console.log(`   ${row.category}: ${row.count} packages`);
    });
    
  } catch (error) {
    console.error('Failed to add packages:', error.message);
  } finally {
    await pool.end();
  }
}

addAllPackages(); 