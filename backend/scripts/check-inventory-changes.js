import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

async function checkInventoryChanges() {
  const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PWD,
    port: process.env.PG_PORT,
  });

  try {
    console.log('🔍 Checking Inventory Changes for Study Essentials Package...\n');
    
    // Check Study Essentials Package inventory
    console.log('1️⃣ Study Essentials Package Current State:');
    const packageResult = await pool.query(`
      SELECT id, name, inventory, price, category
      FROM packages 
      WHERE id = 39
    `);
    
    if (packageResult.rows.length > 0) {
      const pkg = packageResult.rows[0];
      console.log(`   📦 Package: ${pkg.name} (ID: ${pkg.id})`);
      console.log(`      💰 Price: $${pkg.price}`);
      console.log(`      📊 Current Inventory: ${pkg.inventory}`);
      console.log(`      🏷️ Category: ${pkg.category}`);
    }
    
    // Check sub-products inventory
    console.log('\n2️⃣ Sub-Products Current Inventory:');
    const subProducts = await pool.query(`
      SELECT pi.product_id, p.name, p.inventory, p.price
      FROM package_items pi
      JOIN products p ON pi.product_id = p.id
      WHERE pi.package_id = 39
      ORDER BY p.id
    `);
    
    console.log(`   📋 Sub-Products in Study Essentials Package:`);
    subProducts.rows.forEach(product => {
      console.log(`      • ${product.name} (ID: ${product.product_id})`);
      console.log(`        💰 Price: $${product.price}`);
      console.log(`        📊 Current Inventory: ${product.inventory}`);
    });
    
    // Check recent orders for this package
    console.log('\n3️⃣ Recent Study Essentials Package Orders:');
    const recentOrders = await pool.query(`
      SELECT op.order_id, op.quantity, o.order_number, o.created_at, o.email
      FROM order_packages op
      JOIN orders o ON op.order_id = o.id
      WHERE op.package_id = 39
      ORDER BY o.created_at DESC
      LIMIT 3
    `);
    
    console.log(`   📦 Recent Package Orders:`);
    recentOrders.rows.forEach(order => {
      console.log(`      • Order ${order.order_number}: ${order.quantity} package(s)`);
      console.log(`        📧 Email: ${order.email}`);
      console.log(`        📅 Date: ${order.created_at}`);
    });
    
    // Check if sub-products were also ordered individually
    console.log('\n4️⃣ Individual Sub-Product Orders:');
    const individualOrders = await pool.query(`
      SELECT oi.order_id, oi.product_id, oi.quantity, oi.product_name, o.order_number, o.created_at
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE oi.product_id IN (
        SELECT product_id FROM package_items WHERE package_id = 39
      )
      ORDER BY o.created_at DESC
      LIMIT 5
    `);
    
    console.log(`   📋 Individual Product Orders:`);
    individualOrders.rows.forEach(item => {
      console.log(`      • Order ${item.order_number}: ${item.quantity}x ${item.product_name} (ID: ${item.product_id})`);
      console.log(`        📅 Date: ${item.created_at}`);
    });
    
    // Summary
    console.log('\n📊 Inventory Analysis Summary:');
    const pkg = packageResult.rows[0];
    if (pkg) {
      console.log(`   📦 Study Essentials Package Inventory: ${pkg.inventory}`);
      console.log(`   📋 Sub-Products Count: ${subProducts.rows.length}`);
      console.log(`   📦 Recent Package Orders: ${recentOrders.rows.length}`);
      console.log(`   📋 Individual Product Orders: ${individualOrders.rows.length}`);
      
      // Expected inventory calculation
      const expectedInventory = 50 - recentOrders.rows.length; // Started with 50, reduced by number of orders
      console.log(`   🧮 Expected Package Inventory: ${expectedInventory} (started with 50, reduced by ${recentOrders.rows.length} orders)`);
      
      if (pkg.inventory === expectedInventory) {
        console.log(`   ✅ Package inventory is correct!`);
      } else {
        console.log(`   ❌ Package inventory mismatch! Expected: ${expectedInventory}, Actual: ${pkg.inventory}`);
      }
    }
    
    console.log('\n✅ Inventory check completed!');
    console.log('📝 The Study Essentials Package inventory should have been reduced by the number of orders placed');
    console.log('📝 Sub-product inventories remain unchanged when packages are ordered (package inventory is managed separately)');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkInventoryChanges(); 