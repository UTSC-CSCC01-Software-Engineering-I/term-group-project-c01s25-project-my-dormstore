import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

// All the real products from your catalog
const realProducts = [
  // Bathroom Category
  {
    name: "Shower Caddy",
    price: 16.99,
    category: "Bathroom",
    description: "A sturdy and convenient shower caddy that keeps your bathroom items clean, dry, and ready to go.",
    rating: 0.0
  },
  {
    name: "Folding Storage Baskets",
    price: 11.99,
    category: "Bathroom",
    description: "Keep your dorm organized with these durable, foldable baskets. Made of premium plastic, these baskets are perfect to keep all of your items organized, including clothes, books and more. Their built-in handles make transportation seamless. These baskets are versatile and easy to clean. ",
    rating: 0.0
  },
  {
    name: "Mirror",
    price: 9.99,
    category: "Bathroom",
    description: "This 2-way mirror is perfect for your vanity/desk. Its portable design on the stand makes it durable and versatile.",
    rating: 0.0
  },
  {
    name: "Towel Set",
    price: 49.99,
    category: "Bathroom",
    description: "A soft, quick-drying 8 piece towel set built for everyday dorm life. Includes four wash cloths, two hand towels, two bath towels.",
    rating: 0.0
  },

  // Tech Category
  {
    name: "Extension Cord",
    price: 21.99,
    category: "Tech",
    description: "This 4.5m extension cord is equipped with 3 outlets and is a dorm necessity. It is designed for small spaces.",
    rating: 0.0
  },
  {
    name: "Power Strip",
    price: 10.99,
    category: "Tech",
    description: "This 3 outlet 0.5M power strip is ideal for everyday use.",
    rating: 0.0
  },
  {
    name: "Grounded Outlets",
    price: 9.99,
    category: "Tech",
    description: "Turn 2 outlets into 6 with the grounded outlets necessity. This durable adapter can power all your electronics.",
    rating: 0.0
  },

  // Storage Category
  {
    name: "Hangers",
    price: 7.99,
    category: "Storage",
    description: "A 4-pack of sleek, durable hangers to help keep your dorm closet organized. These space efficient hangers are made to last. Their sleek design is for maximizing your closet space, keeping things tidy.",
    rating: 0.0
  },
  {
    name: "Closet Drawer Organizer",
    price: 9.99,
    category: "Storage",
    description: "Made of nylon mesh and oxford cloth, these durable, strong organizers are transparent and washable. Their visibility makes clothes easy to find and ensures clothes stay clean and protected. ",
    rating: 0.0
  },
  {
    name: "Storage Bins",
    price: 19.99,
    category: "Storage",
    description: "Lightweight, foldable storage bins to keep your dorm space neat without taking up room! Stay organized with these collapsible storage bins. The bins can be easily folded down when not in use, ensuring that they don't take up unnecessary space. Perfect for keeping your dorm neat and clutter-free.",
    rating: 0.0
  },
  {
    name: "Linen Storage Basket",
    price: 24.99,
    category: "Storage",
    description: "These linen storage baskets are the perfect solution for organizing your dorm. Crafted from durable linen material, these baskets are designed to help you store and organize your items without compromising style. They holding clothes, textbooks, pillows, and more! Crafted from high-quality linen, they are both durable and versatile.",
    rating: 0.0
  },
  {
    name: "Non-Slip Bedside Caddy",
    price: 35.99,
    category: "Storage",
    description: "This multipurpose caddy fits and organizes all your necessities. Stylish and practical, this is a must-have for every dorm. It's designed to maximize space while providing a sophisticated and organized look. ",
      rating: 0.0
  },

  // Laundry Category
  {
    name: "Mesh Laundry Hamper",
    price: 10.99,
    category: "Laundry",
    description: "This durable laundry hamper is made of a high-quality mesh fabric, allowing it to be both long-lasting, sturdy and breathable. Its collapsible, pop-up design means it can be easily stored when not in use, making it both convenient and space-saving. Simply twist the lightweight frame to fold the hamper flat for easy storage. It is portable, with handles to comfortably carry it, and easy to clean. This foldable, breathable mesh hamper keeps your dorm laundry routine simple and stress-free!",
    rating: 0.0
  },
  {
    name: "Tide Pods (16 PK)",
    price: 19.99,
    category: "Laundry",
    description: "Tide PODS® Coldwater Clean™ 3-in-1 Liquid Laundry Detergent Pacs cleans and freshens clothes in one step. Each laundry pac contains super concentrated detergent, extra odour fighters, and extra stain removers. Dissolves completely in any water conditions. Tide PODS® clean, fight stains, and freshen—no measuring required. ",
    rating: 0.0
  },
  {
    name: "Tide Simply All In One Liquid Laundry Detergent",
    price: 9.99,
    category: "Laundry",
    description: "Tide Simply All-In-One liquid laundry detergent that tackles 99% of the most common stains and odours. This All-in-one detergent tackles stains, odours, has a fresh scent & works in coldwater. It is now more concentrated to provide more stain removal and freshness and less water. ",
    rating: 0.0
  },
  {
    name: "Delicates Laundry Washing Bag",
    price: 11.99,
    category: "Laundry",
    description: "This durable bag protects delicate items like bras and underwear during washing. Made with a breathable mesh material, it ensures complete cleaning of all items inside. The bag is also fixed with an anti-rust zipper protector to ensure bag stays closed while in the wash. ",
    rating: 0.0
  },
  {
    name: "Tide Pods (9 PK)",
    price: 7.99,
    category: "Laundry",
    description: "Tide PODS® Coldwater Clean™ 3-in-1 Liquid Laundry Detergent Pacs cleans and freshens clothes in one step. Each laundry pac contains super concentrated detergent, extra odour fighters, and extra stain removers. Dissolves completely in any water conditions. ",
    rating: 0.0
  },
  {
    name: "Laundry Bag",
    price: 25.00,
    category: "Laundry",
    description: "This waterproof laundry bag is made from 100% vinyl, meaning it is durable and fluid resistant. It has a draw string closure and a strong handle to make transportation easy. ",
    rating: 0.0
  },
  {
    name: "Heavy Duty Laundry Washing Bag",
    price: 11.99,
    category: "Laundry",
    description: "This durable bag protects larger items in the wash. Made with high quality polyester fibre, it ensures complete cleaning of all items inside. The bag is also fixed with an anti-rust zipper protector to ensure bag stays closed while in the wash. This multipurpose bag is suitable for all clothing items. ",
    rating: 0.0
  },

  // Desk Category
  {
    name: "String Lights",
    price: 19.99,
    category: "Desk",
    description: "These warm white starry LED string lights are a dorm necessity! USB powered means they can be used anywhere and that you never need to worry about batteries. The light string is made of durable wire. These starry string lights that add instant warmth and personality to your dorm.",
    rating: 0.0
  },
  {
    name: "Magnetic White Board",
    price: 18.99,
    category: "Desk",
    description: "This silver-framed magnetic whiteboard is designed to enhance your dorm room and keep you organized! The board erases cleanly and easily. With its convenient size and premium magnetic surface, the board is ideal for displaying reminders, important notes and fun doodles. This board also comes with 2 surface magnets and a dry-erase marker. ",
    rating: 0.0
  },
  {
    name: "Clip String Lights",
    price: 19.00,
    category: "Desk",
    description: "These lights are necessary to brighten any space. With 5M of LED lights with 30 clips for pictures and memories, these lights are great for your wall or shelf. This product offers a powerful lighting solution, delivering 5 meters of bright LED illumination perfect for creating ambience and showcasing treasured photos and mementos.",
    rating: 0.0
  },
  {
    name: "LED Tea Lights",
    price: 3.99,
    category: "Desk",
    description: "These LED tea lights have a lifelike candle glow and are perfect for your dorm. Since most schools do not allow students to bring candles into their dorm, you don't want to forget to bring this perfect substitute! Each LED tea light lasts up to 48 hours and requires no open flame, making it a safe and convenient alternative to traditional candles.",
      rating: 0.0
  },
  {
    name: "Desk Accessories",
    price: 11.99,
    category: "Desk",
    description: "These desk accessory containers are perfect for organizing school supplies, including pens and pencils. They are featured in the permanent design collection at the Museum of Modern Art, New York. They are designed and manufactured in Northern California. ",
    rating: 0.0
  },

  // Decor Category
  {
    name: "Decoration Essentials",
    price: 29.99,
    category: "Decor",
    description: "Elevate your dorm with our Decoration Essentials package. This cozy, stylish dorm décor bundle with string lights and a no-maintenance faux plant will personalize your space with ease and style. Transform your room into the perfect, unique reflection of you. This package includes exactly what you need to transform your dorm into your home!",
    rating: 0.0
  },
  {
    name: "Cozy Rug",
    price: 34.99,
    category: "Decor",
    description: "This fluffy rug will transform your dorm into a cozy space. Below the soft top layer is a high density sponge that adds extra cushion and anti-slip features. Coming in a variety of colours, this versatile piece is a staple in every dorm!",
    rating: 0.0
  },
  {
    name: "Glass Candle Holders",
    price: 9.99,
    category: "Decor",
    description: "Perfect to illuminate candles, these glass candle holders will create a soft atmosphere in your dorm room. Their heat-resistant design provides safety and convenience, while their hand-crafted design ensures a unique touch for your dorm",
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