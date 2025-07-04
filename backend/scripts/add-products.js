import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

// All the real products from your catalog
const realProducts = [
  // Bathroom Category
  {
    name: "Shower Caddy",
    price: 24.99,
    category: "Bathroom",
    description: "template",
    rating: 0.0
  },
  {
    name: "Folding Storage Baskets",
    price: 19.99,
    category: "Bathroom",
    description: "template",
    rating: 0.0
  },
  {
    name: "Mirror",
    price: 15.99,
    category: "Bathroom",
    description: "template",
    rating: 0.0
  },
  {
    name: "Towel Set",
    price: 29.99,
    category: "Bathroom",
    description: "template",
    rating: 0.0
  },

  // Tech Category
  {
    name: "Extension Cord",
    price: 12.99,
    category: "Tech",
    description: "template",
    rating: 0.0
  },
  {
    name: "Power Strip",
    price: 18.99,
    category: "Tech",
    description: "template",
    rating: 0.0
  },
  {
    name: "Grounded Outlets",
    price: 8.99,
    category: "Tech",
    description: "template",
    rating: 0.0
  },

  // Storage Category
  {
    name: "Hangers",
    price: 9.99,
    category: "Storage",
    description: "template",
    rating: 0.0
  },
  {
    name: "Closet Drawer Organizer",
    price: 22.99,
    category: "Storage",
    description: "template",
    rating: 0.0
  },
  {
    name: "Storage Bins",
    price: 16.99,
    category: "Storage",
    description: "template",
    rating: 0.0
  },
  {
    name: "Linen Storage Basket",
    price: 21.99,
    category: "Storage",
    description: "template",
    rating: 0.0
  },
  {
    name: "Non-Slip Bedside Caddy",
    price: 14.99,
    category: "Storage",
    description: "template",
      rating: 0.0
  },

  // Laundry Category
  {
    name: "Mesh Laundry Hamper",
    price: 17.99,
    category: "Laundry",
    description: "template",
    rating: 0.0
  },
  {
    name: "Tide Pods (16 PK)",
    price: 8.99,
    category: "Laundry",
    description: "template",
    rating: 0.0
  },
  {
    name: "Tide Simply All In One Liquid Laundry Detergent",
    price: 6.99,
    category: "Laundry",
    description: "template",
    rating: 0.0
  },
  {
    name: "Delicates Laundry Washing Bag",
    price: 11.99,
    category: "Laundry",
    description: "template",
    rating: 0.0
  },
  {
    name: "Tide Pods (9 PK)",
    price: 5.99,
    category: "Laundry",
    description: "template",
    rating: 0.0
  },
  {
    name: "Laundry Bag",
    price: 13.99,
    category: "Laundry",
    description: "template",
    rating: 0.0
  },
  {
    name: "Heavy Duty Laundry Washing Bag",
    price: 15.99,
    category: "Laundry",
    description: "template",
    rating: 0.0
  },

  // Desk Category
  {
    name: "String Lights",
    price: 12.99,
    category: "Desk",
    description: "template",
    rating: 0.0
  },
  {
    name: "Magnetic White Board",
    price: 19.99,
    category: "Desk",
    description: "template",
    rating: 0.0
  },
  {
    name: "Clip String Lights",
    price: 14.99,
    category: "Desk",
    description: "template",
    rating: 0.0
  },
  {
    name: "LED Tea Lights",
    price: 8.99,
    category: "Desk",
    description: "template",
      rating: 0.0
  },
  {
    name: "Desk Accessories",
    price: 24.99,
    category: "Desk",
    description: "template",
    rating: 0.0
  },

  // Decor Category
  {
    name: "Decoration Essentials",
    price: 18.99,
    category: "Decor",
    description: "template",
    rating: 0.0
  },
  {
    name: "Cozy Rug",
    price: 32.99,
    category: "Decor",
    description: "template",
    rating: 0.0
  },
  {
    name: "Glass Candle Holders",
    price: 16.99,
    category: "Decor",
    description: "template",
    rating: 0.0
  }
];

async function addRealProducts() {
  const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PWD,
    port: process.env.PG_PORT,
  });

  try {
    console.log('Adding real products to database...');
    
    let addedCount = 0;
    
    for (const product of realProducts) {
      const result = await pool.query(
        'INSERT INTO products (name, price, category, description, rating) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [product.name, product.price, product.category, product.description, product.rating]
      );
      
      addedCount++;
      console.log(`Added: ${product.name} (${product.category}) - $${product.price}`);
    }
    
    console.log(`\nSuccessfully added ${addedCount} products!`);
    
    // Show summary by category
    const categoryResult = await pool.query(
      'SELECT category, COUNT(*) as count FROM products GROUP BY category ORDER BY category'
    );
    
    console.log('\nProducts by category:');
    categoryResult.rows.forEach(row => {
      console.log(`   ${row.category}: ${row.count} products`);
    });
    
  } catch (error) {
    console.error('Failed to add products:', error.message);
  } finally {
    await pool.end();
  }
}

addRealProducts(); 