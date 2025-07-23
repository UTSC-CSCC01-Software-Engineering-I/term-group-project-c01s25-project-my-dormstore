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
    rating: 0.0,
    image_url: "https://drive.google.com/thumbnail?id=15TvY0Z_8DEvwS0CDT36LtWXtFGecEjgk",
    size: "Twin, Twin XL, Double, Double XL, Queen",
    color: "White, Blue, Gray"
  },
  {
    name: "Standard Bedding Package", 
    price: 129.99,
    category: "Bedding",
    description: "template",
    rating: 0.0,
    image_url: "https://drive.google.com/thumbnail?id=1u7kcVrm_Sl6G5yJsO3kJxkXzIuIWgp06",
    size: "Twin, Twin XL, Double, Double XL, Queen"
  },
  {
    name: "Sleep Country Complete Bedding Package",
    price: 179.99,
    category: "Bedding", 
    description: "template",
    rating: 0.0,
    image_url: "https://drive.google.com/thumbnail?id=1UUanG5c1Pmi_v1-0UDo_Dq4ClEZyHKmo",
    size: "Twin, Twin XL, Double, Double XL, Queen",

  },
  {
    name: "Deluxe Bedding Package",
    price: 219.99,
    category: "Bedding",
    description: "template",
    rating: 0.0,
    image_url: "https://drive.google.com/thumbnail?id=1GUqV6OidDM0oOT1dZ6dKJ73UshpGhqAU",
    size: "Twin, Twin XL, Double, Double XL, Queen"
  },

  // Living Category
  {
    name: "Bathroom Essentials",
    price: 79.99,
    category: "Living",
    description: "template",
    rating: 0.0,
    image_url: "https://drive.google.com/thumbnail?id=14b_lD9YrYKiopMXqrawIj5-uGj1LJf4P"
  },
  {
    name: "Laundry Essentials",
    price: 64.99,
    category: "Living",
    description: "template",
    rating: 0.0,
    image_url: "https://drive.google.com/thumbnail?id=1FfToOKP5E4oZmMeY9L0Xv7-9ilJ7TvmL"
  },
  {
    name: "Tech Essentials",
    price: 45.99,
    category: "Living",
    description: "template",
    rating: 0.0,
    image_url: "https://drive.google.com/thumbnail?id=19Wq3IHcIdtCvgbAomEip2sX2jeW9iG6B"
  },
  {
    name: "Organization Essentials",
    price: 89.99,
    category: "Living",
    description: "template",
    rating: 0.0,
    image_url: "https://drive.google.com/thumbnail?id=11V1unP7qEnubnh2rvaKEHYgX-lCmKm6F"
  },
  {
    name: "Cleaning Essentials",
    price: 39.99,
    category: "Living",
    description: "template",
    rating: 0.0,
    image_url: "https://drive.google.com/thumbnail?id=1z9dNpb72TN18Bt-yW2zQfXr1F1q6-GOJ"
  },
  {
    name: "Decoration",
    price: 59.99,
    category: "Living",
    description: "template",
    rating: 0.0,
    image_url: "https://drive.google.com/thumbnail?id=18KqYy2UDQdThL8qX_xcAU7g2b2kXGWDM"
  },
  {
    name: "Door Decor",
    price: 29.99,
    category: "Living",
    description: "template",
    rating: 0.0,
    image_url: "https://drive.google.com/thumbnail?id=1AfxnWyzWvv-XQyBGU3UNYiN6DzhB-vHI"
  },
  {
    name: "Household Essentials",
    price: 57.99,
    category: "Living",
    description: "template",
    rating: 0.0,
    image_url: "https://drive.google.com/thumbnail?id=1QvsGck94U6Ub4GSjXAkkTk72_mmNrtzy"
  },
  {
    name: "Kitchen Essentials",
    price: 149.99,
    category: "Living",
    description: "template",
    rating: 0.0,
    image_url: "https://drive.google.com/thumbnail?id=16EXzNd4rCxuV6gDZNtxbr5JLl_QbNjNs"
  },

  // Caring Category
  {
    name: "Birthday Care",
    price: 34.99,
    category: "Caring",
    description: "template",
    rating: 0.0,
    image_url: "https://drive.google.com/thumbnail?id=1i6OuiF3g8q8vPNqcavFhimWHBa1qf8rJ"
  },
  {
    name: "Exam and Midterm",
    price: 39.99,
    category: "Caring",
    description: "template",
    rating: 0.0,
    image_url: "https://drive.google.com/thumbnail?id=17PG28MYTy5CXO1YcWzF-brSYScXuDwfe"
  },
  {
    name: "Thinking of You",
    price: 29.99,
    category: "Caring",
    description: "template",
    rating: 0.0,
    image_url: "https://drive.google.com/thumbnail?id=1S-fmiIKlFCkaA1lG_iqsCU2Y7vBoHCAa"
  },
  {
    name: "Build Your Own",
    price: 0.00,
    category: "Caring",
    description: "template",
    rating: 0.0,
    image_url: "https://drive.google.com/thumbnail?id=1JZQBtZuG3tfHSjYjIBK_8LducqHGXJjs"
  },
  {
    name: "Feel Better Soon",
    price: 32.99,
    category: "Caring",
    description: "template",
    rating: 0.0,
    image_url: "https://drive.google.com/thumbnail?id=1Y-gaJ06-7OIPj9ROXsCFhcCScz8Pgs2F"
  },
  {
    name: "New Semester",
    price: 49.99,
    category: "Caring",
    description: "template",
    rating: 0.0,
    image_url: "https://drive.google.com/thumbnail?id=1tgMS2pczByZIIjMuSnoZILaaKQTUCIzQ"
  },
  {
    name: "Sleep Well",
    price: 44.99,
    category: "Caring",
    description: "template",
    rating: 0.0,
    image_url: "https://drive.google.com/thumbnail?id=1QcbF1b3K4c5vk4cavuXf9HpEaMt_1Q4C"
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
        'INSERT INTO packages (name, price, category, description, rating, image_url, size, color) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
        [pkg.name, pkg.price, pkg.category, pkg.description, pkg.rating, pkg.image_url, pkg.size || '', pkg.color || '']
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