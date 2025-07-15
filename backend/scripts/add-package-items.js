import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

// Define which products should be included in each package
// Using only products that exist in your real products database
const packageCompositions = [
  // Bedding Category
  {
    packageName: "Basic Bedding Package",
    products: [
      { name: "Sheet Set", quantity: 1 },
      { name: "Premium Pillows", quantity: 2 },
    ]
  },
  {
    packageName: "Standard Bedding Package",
    products: [
      { name: "Sheet Set", quantity: 1 },
      { name: "Comforter", quantity: 1 },
      { name: "Premium Pillows", quantity: 2 },
    ]
  },
  {
    packageName: "Sleep Country Complete Bedding Package",
    products: []
  },
  {
    packageName: "Deluxe Bedding Package",
    products: [
        { name: "Sheet Set", quantity: 1 },
      { name: "Comforter", quantity: 1 },
      { name: "Premium Pillows", quantity: 2 },
      {name: "Mattress Protector", quantity: 1},
      {name: "Mattress Topper", quantity: 1},

          ]
    },
  
    // Living Category - commented out for testing
    
    {
    packageName: "Bathroom Essentials",
    products: [
        { name: "Towel Set", quantity: 1 },
        { name: "Shower Caddy", quantity: 1 },
    ]
  },
  {
    packageName: "Laundry Essentials",
    products: [ { name: "Hangers", quantity: 1 },
        { name: "Mesh Laundry Hamper", quantity: 1 },
        { name: "Washing Bag", quantity: 1 },
        { name: "Tide Detergent", quantity: 1 },
    ]
  },
  {
    packageName: "Tech Essentials",
    products: [
        { name: "Grounded Outlets", quantity: 1 },
        { name: "Extension Cord", quantity: 1 },
        { name: "Power Strip", quantity: 1 },
    ]
  },
  {
    packageName: "Organization Essentials",
    products: [
        { name: "Boot tray ", quantity: 1 },
        { name: "Storage shelf", quantity: 1 },
        { name: "Over the door vertical hooks", quantity: 1 },]
  },
  {
    packageName: "Cleaning Essentials",
    products: [
        { name: "Mr Clean Magic Eraser Foam", quantity: 1 },
        { name: "Mr Clean Multi-Surfaces Disinfectant Liquid", quantity: 1 },
        { name: "Cascade Platinum Plus Dishwasher Pods", quantity: 1 },
        { name: "Bounty Paper Towel Napkins", quantity: 1 },
        { name: "Cascade Platinum Plus Dishwasher Pods", quantity: 1 },
    ]
  },
  {
    packageName: "Decoration Essentials",
    products: [
        { name: "String Lights", quantity: 1 },
        { name: "Faux succulent plant", quantity: 1 },
    ]
  },
  {
    packageName: "Desk Lamp & Essentials",
    products: [
        { name: "Desk lamp", quantity: 1 },
        { name: "Desk Accessories", quantity: 1 },
    ]
  },
  {
    packageName: "Door Decor",
    products: [
        { name: "White board", quantity: 1 },
        { name: "Dry-Erase Marker", quantity: 1 },
        { name: "Magnets", quantity: 1 },   
    ]
  },

  // Caring Category
  {
    packageName: "Birthday Care Package",
    products: [
        { name: "Birthday cake", quantity: 1 },
        { name: "Birthday plates", quantity: 1 },
        { name: "Birthday napkins", quantity: 1 },
        { name: "Festive headbands", quantity: 1 },
        { name: "Personalized note", quantity: 1 },
    ]
  },
  {
    packageName: "Exam and Midterm Care Package",
    products: [
        { name: "Bathrobe (unisex)", quantity: 1 },
        { name: "Microwave Popcorn", quantity: 1 }, 
        { name: "Hot Chocolate or Tea", quantity: 1 },
        { name: "Personalized note", quantity: 1 },
    ]
  },
  {
    packageName: "Thinking of You Care Package",
    products: [
        { name: "Stuffed animal & mug or plush pillow", quantity: 1 },
        { name: "Microwave Popcorn", quantity: 1 }, 
        { name: "Hot Chocolate or Tea", quantity: 1 },
        { name: "Personalized note", quantity: 1 },
    ]
  },
  {
    packageName: "Build Your Own Care Package",
    products: []
  },
  {
    packageName: "Feel Better Soon Care Package",
    products: [
        { name: "Cozy blanket", quantity: 1 },
        { name: "Cozy socks", quantity: 1 }, 
        { name: "Cough drops", quantity: 1 },
        { name: "Recovery tea", quantity: 1 },
        { name: "Personalized note", quantity: 1 },
    ]
  },
  {
    packageName: "New Semester Care Package",
    products: [
        { name: "2 Plush pillows", quantity: 1 },
        { name: "Cozy pillowcases", quantity: 1 }, 
        { name: "Hot chocolate or tea", quantity: 1 },
        { name: "Tide detergent", quantity: 1 },
        { name: "Personalized note", quantity: 1 },
    ]
  },
  {
    packageName: "Sleep Well Care Package",
    products: [
        { name: "2 Plush pillows", quantity: 1 },
        { name: "2 Satin pillowcases", quantity: 1 }, 
    ]
  }
  
];

async function addPackageItems() {
  const pool = new Pool({
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