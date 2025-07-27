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
    description: "Make your move-in day stress-free with our Basic Bedding Package. This all-in-one set provides everything you need to create a cozy and comfortable bed right from day one. Designed for convenience, it includes a full sheet set and two pillows, ensuring you’re set up for a great night's sleep as you settle into your new space.",
    rating: 0.0,
    image_url: "https://drive.google.com/thumbnail?id=15TvY0Z_8DEvwS0CDT36LtWXtFGecEjgk",
    size: "Twin, Twin XL, Double, Double XL, Queen",
    color: "White, Blue, Gray"
  },
  {
    name: "Standard Bedding Package", 
    price: 129.99,
    category: "Bedding",
    description: "Make your dorm feel like home with our Standard Bedding Package—the ultimate all-in-one solution for comfort and convenience. This complete set ensures you have everything you need to turn your space into a cozy retreat. With a full sheet set, a plush comforter set, and supportive pillows, you’ll be move-in ready in no time.",
    rating: 0.0,
    image_url: "https://drive.google.com/thumbnail?id=1u7kcVrm_Sl6G5yJsO3kJxkXzIuIWgp06",
    size: "Twin, Twin XL, Double, Double XL, Queen"
  },
  {
    name: "Sleep Country Complete Bedding Package",
    price: 179.99,
    category: "Bedding", 
    description: "We’ve teamed up with Sleep Country Canada—the trusted name in sleep—to create a premium, student-ready bedding bundle made for campus life. This exclusive collaboration combines Sleep Country’s sleep expertise with My Dorm Store’s residence experience and exclusive campus partnerships. With delivery straight to your dorm before you arrive, this curated package makes move-in easier and helps you feel settled, supported, and well-rested from day one",
    rating: 0.0,
    image_url: "https://drive.google.com/thumbnail?id=1UUanG5c1Pmi_v1-0UDo_Dq4ClEZyHKmo",
    size: "Twin, Twin XL, Double, Double XL, Queen",

  },
  {
    name: "Deluxe Bedding Package",
    price: 219.99,
    category: "Bedding",
    description: "Our most complete bedding bundle—everything you need for next-level dorm comfort. Upgrade your dorm experience with our Deluxe Dorm Bedding Package—the ultimate solution for comfort and convenience. This premium set includes everything you need for a cozy and restful sleep, making your dorm feel like home from the moment you move in. This all-inclusive package goes above and beyond, with premium bedding essentials like a full sheet set, plush comforter, supportive pillows, and both a mattress protector and topper for extra comfort and protection. ",
    rating: 0.0,
    image_url: "https://drive.google.com/thumbnail?id=1GUqV6OidDM0oOT1dZ6dKJ73UshpGhqAU",
    size: "Twin, Twin XL, Double, Double XL, Queen"
  },

  // Living Category
  {
    name: "Bathroom Essentials",
    price: 79.99,
    category: "Living",
    description: "Everything you need for your dorm bathroom—towels and shower caddy included.",
    rating: 0.0,
    image_url: "https://drive.google.com/thumbnail?id=14b_lD9YrYKiopMXqrawIj5-uGj1LJf4P"
  },
  {
    name: "Laundry Essentials",
    price: 64.99,
    category: "Living",
    description: "This package includes everything you will need for your clean and dirty laundry. Enjoy a hassle-free laundry experience in a student-friendly package!",
    rating: 0.0,
    image_url: "https://drive.google.com/thumbnail?id=1FfToOKP5E4oZmMeY9L0Xv7-9ilJ7TvmL"
  },
  {
    name: "Tech Essentials",
    price: 45.99,
    category: "Living",
    description: "This package includes all the tech accessories you'll need for your dorm. This compact, high-utility bundle of power accessories will keep all your dorm tech plugged in and running!",
    rating: 0.0,
    image_url: "https://drive.google.com/thumbnail?id=19Wq3IHcIdtCvgbAomEip2sX2jeW9iG6B"
  },
  {
    name: "Organization Essentials",
    price: 89.99,
    category: "Living",
    description: "Organize your new space with these must-have organization essentials! Enhance the cleanliness and functionality of your entryway apartment with our Organization Essentials package. This carefully curated set includes all the necessary items to keep your space tidy and efficiently organized. Say goodbye to clutter and hello to a well-managed living space.",
    rating: 0.0,
    image_url: "https://drive.google.com/thumbnail?id=11V1unP7qEnubnh2rvaKEHYgX-lCmKm6F"
  },
  {
    name: "Cleaning Essentials",
    price: 39.99,
    category: "Living",
    description: "Keep your apartment sparkling clean with our Cleaning Essentials package. This expertly curated package includes all the essential products you need to efficiently and effectively clean your living space. Save time and energy with our convenient and high-quality selection. Everything you need to keep your student apartment clean—in one convenient package.",
    rating: 0.0,
    image_url: "https://drive.google.com/thumbnail?id=1z9dNpb72TN18Bt-yW2zQfXr1F1q6-GOJ"
  },
  {
    name: "Decoration",
    price: 59.99,
    category: "Living",
    description: "Elevate your dorm with our Decoration Essentials package. This cozy, stylish dorm décor bundle with string lights and a no-maintenance faux plant will personalize your space with ease and style. Transform your room into the perfect, unique reflection of you. This package includes exactly what you need to transform your dorm into your home!",
    rating: 0.0,
    image_url: "https://drive.google.com/thumbnail?id=18KqYy2UDQdThL8qX_xcAU7g2b2kXGWDM"
  },
  {
    name: "Door Decor",
    price: 29.99,
    category: "Living",
    description: "Door Decor is the perfect way to add a personal touch to your dorm room. Our customizable items allow you to decorate your door to your liking, making it stand out and feel like home. With our wide range of options, you can easily personalize your door and make a statement on your floor.",
    rating: 0.0,
    image_url: "https://drive.google.com/thumbnail?id=1AfxnWyzWvv-XQyBGU3UNYiN6DzhB-vHI"
  },
  {
    name: "Household Essentials",
    price: 57.99,
    category: "Living",
    description: "This package includes all of the everyday, household items you cannot live without! Everything you need for a clean, functional student home—delivered in one essential bundle. We have anticipated everything you'll need, so you can arrive worry free and ready to live in your new space! Our comprehensive package includes all the necessary items for day-to-day living. You will have peace of mind knowing that you are well-equipped for your new home.",
    rating: 0.0,
    image_url: "https://drive.google.com/thumbnail?id=1QvsGck94U6Ub4GSjXAkkTk72_mmNrtzy"
  },
  {
    name: "Kitchen Essentials",
    price: 149.99,
    category: "Living",
    description: "Everything you need to stock a student kitchen—from cookware to cleanup—in one smart bundle. Upgrade your kitchen with our Kitchen Essentials package! Perfect for students moving into a new space, this package includes everything you need to get started. With high-quality kitchen tools and accessories, you'll be able to create delicious meals and elevate your cooking skills. Say goodbye to takeout and hello to home-cooked meals with ease.",
    rating: 0.0,
    image_url: "https://drive.google.com/thumbnail?id=16EXzNd4rCxuV6gDZNtxbr5JLl_QbNjNs"
  },

  // Caring Category
  {
    name: "Birthday Care",
    price: 34.99,
    category: "Caring",
    description: "This birthday care package is the perfect way to show someone you care on their special day. Packed with goodies and treats, our care package is sure to make their birthday extra special. Give the gift of happiness and celebration with our birthday care package.",
    rating: 0.0,
    image_url: "https://drive.google.com/thumbnail?id=1i6OuiF3g8q8vPNqcavFhimWHBa1qf8rJ"
  },
  {
    name: "Exam and Midterm",
    price: 39.99,
    category: "Caring",
    description: "Stay prepared and organized during exam and midterm season with this custom care kit. Boasting essential exam time supplies, this kit is perfect for those looking to stay focused and comfortable during an intense study session! Featuring a cozy, ultta-soft, flannel fleece velour bathrobe. This bathrobe features a shaw collar design with two front pockets, self-tie wrap, and is fluffy, cozy, and comfortable. Its enhanced microfiber material, giving it the perfect balance between weight and warmth",
    rating: 0.0,
    image_url: "https://drive.google.com/thumbnail?id=17PG28MYTy5CXO1YcWzF-brSYScXuDwfe"
  },
  {
    name: "Thinking of You",
    price: 29.99,
    category: "Caring",
    description: "This package is a perfect way to show someone you are thinking about them! ",
    rating: 0.0,
    image_url: "https://drive.google.com/thumbnail?id=1S-fmiIKlFCkaA1lG_iqsCU2Y7vBoHCAa"
  },
  {
    name: "Build Your Own",
    price: 0.00,
    category: "Caring",
    description: "Create a custom care package for your child in residence! University and college can be stressful, and these handpicked packages are the perfect way to send your love and well wishes! ",
    rating: 0.0,
    image_url: "https://drive.google.com/thumbnail?id=1JZQBtZuG3tfHSjYjIBK_8LducqHGXJjs"
  },
  {
    name: "Feel Better Soon",
    price: 32.99,
    category: "Caring",
    description: "This is the perfect way to show your loved one you care. With thoughtful items to make them feel better, this kit includes everything needed for a speedy recovery. From cozy socks to a plush pillow, the carefully curated items offer warmth, comfort, and much-needed rest.",
    rating: 0.0,
    image_url: "https://drive.google.com/thumbnail?id=1Y-gaJ06-7OIPj9ROXsCFhcCScz8Pgs2F"
  },
  {
    name: "New Semester",
    price: 49.99,
    category: "Caring",
    description: "Get ready for the new semester with our carefully curated college student care package! Packed with essential items to help you thrive, our care package will make sure you have everything you need for a successful semester. From essentials to self-care items, our care package has it all. Don't miss out on the benefits of starting your semester off right.",
    rating: 0.0,
    image_url: "https://drive.google.com/thumbnail?id=1tgMS2pczByZIIjMuSnoZILaaKQTUCIzQ"
  },
  {
    name: "Sleep Well",
    price: 44.99,
    category: "Caring",
    description: "Elevate your sleep with the Sleep Well Care Package. Featuring a luxurious satin pillow case and a plush pillow, this package ensures a comfortable and soothing night's rest. Wake up feeling rejuvenated with this premium care package.",
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