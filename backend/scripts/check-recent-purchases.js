import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

async function checkRecentPurchases() {
  const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PWD,
    port: process.env.PG_PORT,
  });

  try {
    console.log('🔍 Checking recent purchases and inventory changes...\n');
    
    // Check recent orders
    console.log('📦 Recent Orders:');
    const ordersResult = await pool.query(`
      SELECT id, order_number, user_id, total, order_status, created_at
      FROM orders 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    if (ordersResult.rows.length === 0) {
      console.log('   No orders found in database');
    } else {
      ordersResult.rows.forEach(order => {
        console.log(`   - Order #${order.order_number}: $${order.total} (Status: ${order.order_status})`);
        console.log(`     Created: ${order.created_at}`);
        console.log(`     User ID: ${order.user_id}`);
        console.log('');
      });
    }
    
    // Check recent order items
    console.log('🛍️ Recent Order Items:');
    const orderItemsResult = await pool.query(`
      SELECT oi.order_id, oi.product_name, oi.quantity, oi.subtotal, o.order_number
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      ORDER BY oi.created_at DESC 
      LIMIT 10
    `);
    
    if (orderItemsResult.rows.length === 0) {
      console.log('   No order items found in database');
    } else {
      orderItemsResult.rows.forEach(item => {
        console.log(`   - ${item.product_name}: ${item.quantity} units ($${item.subtotal})`);
        console.log(`     Order: #${item.order_number}`);
        console.log('');
      });
    }
    
    // Check recent package orders
    console.log('📦 Recent Package Orders:');
    const packageOrdersResult = await pool.query(`
      SELECT op.order_id, op.package_id, op.quantity, p.name as package_name, o.order_number
      FROM order_packages op
      JOIN packages p ON op.package_id = p.id
      JOIN orders o ON op.order_id = o.id
      ORDER BY op.created_at DESC 
      LIMIT 5
    `);
    
    if (packageOrdersResult.rows.length === 0) {
      console.log('   No package orders found in database');
    } else {
      packageOrdersResult.rows.forEach(item => {
        console.log(`   - ${item.package_name}: ${item.quantity} units`);
        console.log(`     Order: #${item.order_number}`);
        console.log('');
      });
    }
    
    // Check products with reduced inventory
    console.log('📊 Products with Reduced Inventory:');
    const productsResult = await pool.query(`
      SELECT id, name, inventory, updated_at
      FROM products 
      WHERE inventory < 100
      ORDER BY updated_at DESC 
      LIMIT 10
    `);
    
    if (productsResult.rows.length === 0) {
      console.log('   No products with reduced inventory found');
    } else {
      productsResult.rows.forEach(product => {
        console.log(`   - ${product.name}: ${product.inventory} units remaining`);
        console.log(`     Last updated: ${product.updated_at}`);
        console.log('');
      });
    }
    
    // Check packages with reduced inventory
    console.log('📦 Packages with Reduced Inventory:');
    const packagesResult = await pool.query(`
      SELECT id, name, inventory, updated_at
      FROM packages 
      WHERE inventory < 100
      ORDER BY updated_at DESC 
      LIMIT 10
    `);
    
    if (packagesResult.rows.length === 0) {
      console.log('   No packages with reduced inventory found');
    } else {
      packagesResult.rows.forEach(pkg => {
        console.log(`   - ${pkg.name}: ${pkg.inventory} units remaining`);
        console.log(`     Last updated: ${pkg.updated_at}`);
        console.log('');
      });
    }
    
    // Check user balance changes
    console.log('💰 Recent User Balance Changes:');
    const balanceResult = await pool.query(`
      SELECT user_id, balance, total_spent, last_updated
      FROM user_balance 
      WHERE total_spent > 0
      ORDER BY last_updated DESC 
      LIMIT 5
    `);
    
    if (balanceResult.rows.length === 0) {
      console.log('   No user balance changes found');
    } else {
      balanceResult.rows.forEach(balance => {
        console.log(`   - User ID ${balance.user_id}: Balance $${balance.balance}, Total Spent $${balance.total_spent}`);
        console.log(`     Last updated: ${balance.last_updated}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkRecentPurchases(); 