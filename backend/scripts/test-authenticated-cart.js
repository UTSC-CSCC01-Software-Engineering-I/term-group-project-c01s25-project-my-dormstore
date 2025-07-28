import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

async function testAuthenticatedCart() {
  const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PWD,
    port: process.env.PG_PORT,
  });

  try {
    console.log('🧪 Testing Authenticated Cart with Package...\n');
    
    // First, let's check if we have a test user
    const userResult = await pool.query(`
      SELECT id, email FROM users LIMIT 1
    `);
    
    if (userResult.rows.length === 0) {
      console.log('❌ No users found. Please create a user first.');
      return;
    }
    
    const testUser = userResult.rows[0];
    console.log(`👤 Using test user: ${testUser.email} (ID: ${testUser.id})`);
    
    // Clear any existing cart items for this user
    await pool.query(`DELETE FROM cart_items WHERE user_id = $1`, [testUser.id]);
    console.log('🧹 Cleared existing cart items');
    
    // Add our test package to the user's cart
    await pool.query(`
      INSERT INTO cart_items (user_id, package_id, quantity, item_type)
      VALUES ($1, $2, $3, 'package')
    `, [testUser.id, 39, 1]);
    
    console.log('✅ Added test package to user cart');
    
    // Check the cart contents
    const cartResult = await pool.query(`
      SELECT ci.*, p.name as package_name, p.price as package_price
      FROM cart_items ci
      LEFT JOIN packages p ON ci.package_id = p.id
      WHERE ci.user_id = $1
    `, [testUser.id]);
    
    console.log('\n📋 Cart contents:');
    cartResult.rows.forEach(item => {
      console.log(`   - ${item.package_name}: ${item.quantity} x $${item.package_price} (${item.item_type})`);
    });
    
    // Test the cart API endpoint
    console.log('\n🛒 Testing cart API endpoint...');
    
    // We need to create a JWT token for the test user
    const jwt = await import('jsonwebtoken');
    const token = jwt.default.sign({ userId: testUser.id }, 'secret-key');
    
    const cartResponse = await fetch('http://localhost:5001/cart', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (cartResponse.ok) {
      const cartData = await cartResponse.json();
      console.log('✅ Cart API response:');
      console.log(`   Cart items: ${cartData.cartItems.length}`);
      cartData.cartItems.forEach(item => {
        console.log(`   - Item type: ${item.item_type}, Package ID: ${item.package_id}, Quantity: ${item.quantity}`);
      });
    } else {
      console.log('❌ Failed to get cart via API');
    }
    
    // Test adding a product to the same cart
    console.log('\n🛒 Adding a product to the same cart...');
    
    await pool.query(`
      INSERT INTO cart_items (user_id, product_id, quantity, item_type)
      VALUES ($1, $2, $3, 'product')
    `, [testUser.id, 25, 2]); // Extension Cord, quantity 2
    
    console.log('✅ Added product to user cart');
    
    // Check updated cart contents
    const updatedCartResult = await pool.query(`
      SELECT ci.*, 
             p.name as product_name, p.price as product_price,
             pk.name as package_name, pk.price as package_price
      FROM cart_items ci
      LEFT JOIN products p ON ci.product_id = p.id
      LEFT JOIN packages pk ON ci.package_id = pk.id
      WHERE ci.user_id = $1
    `, [testUser.id]);
    
    console.log('\n📋 Updated cart contents:');
    updatedCartResult.rows.forEach(item => {
      if (item.item_type === 'package') {
        console.log(`   - Package: ${item.package_name}: ${item.quantity} x $${item.package_price}`);
      } else {
        console.log(`   - Product: ${item.product_name}: ${item.quantity} x $${item.product_price}`);
      }
    });
    
    // Test the unified cart API again
    const updatedCartResponse = await fetch('http://localhost:5001/cart', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (updatedCartResponse.ok) {
      const updatedCartData = await updatedCartResponse.json();
      console.log('\n✅ Updated cart API response:');
      console.log(`   Total cart items: ${updatedCartData.cartItems.length}`);
      updatedCartData.cartItems.forEach(item => {
        console.log(`   - Type: ${item.item_type}, ID: ${item.product_id || item.package_id}, Qty: ${item.quantity}`);
      });
    }
    
    console.log('\n🎉 Unified cart test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

testAuthenticatedCart(); 