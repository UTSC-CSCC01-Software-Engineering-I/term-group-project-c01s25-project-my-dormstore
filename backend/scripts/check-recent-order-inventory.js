import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

async function checkRecentOrderInventory() {
  const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PWD,
    port: process.env.PG_PORT,
  });

  try {
    console.log('🔍 Checking Recent Order and Inventory Changes...\n');
    
    // 1. Check the most recent orders
    console.log('1️⃣ Most Recent Orders:');
    const recentOrders = await pool.query(`
      SELECT id, order_number, email, first_name, last_name, total, order_status, created_at
      FROM orders 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    console.log(`   📊 Found ${recentOrders.rows.length} recent orders:`);
    recentOrders.rows.forEach((order, index) => {
      console.log(`      ${index + 1}. Order ${order.order_number}: ${order.first_name} ${order.last_name} - $${order.total} (${order.created_at})`);
    });
    
    // 2. Check Study Essentials Package inventory
    console.log('\n2️⃣ Study Essentials Package Inventory:');
    const packageInventory = await pool.query(`
      SELECT id, name, inventory, price, category
      FROM packages 
      WHERE id = 39 OR name LIKE '%Study Essentials%'
    `);
    
    if (packageInventory.rows.length > 0) {
      packageInventory.rows.forEach(pkg => {
        console.log(`   📦 Package: ${pkg.name} (ID: ${pkg.id})`);
        console.log(`      💰 Price: $${pkg.price}`);
        console.log(`      📊 Inventory: ${pkg.inventory}`);
        console.log(`      🏷️ Category: ${pkg.category}`);
      });
    } else {
      console.log('   ❌ Study Essentials Package not found');
    }
    
    // 3. Check package items (sub-products)
    console.log('\n3️⃣ Package Sub-Products Inventory:');
    const packageItems = await pool.query(`
      SELECT pi.package_id, pi.product_id, p.name, p.inventory, p.price
      FROM package_items pi
      JOIN products p ON pi.product_id = p.id
      WHERE pi.package_id = 39
    `);
    
    console.log(`   📋 Found ${packageItems.rows.length} sub-products in Study Essentials Package:`);
    packageItems.rows.forEach(item => {
      console.log(`      • ${item.name} (ID: ${item.product_id})`);
      console.log(`        💰 Price: $${item.price}`);
      console.log(`        📊 Inventory: ${item.inventory}`);
    });
    
    // 4. Check recent order_packages entries
    console.log('\n4️⃣ Recent Package Orders:');
    const recentPackageOrders = await pool.query(`
      SELECT op.id, op.order_id, op.package_id, op.quantity, o.order_number, o.created_at
      FROM order_packages op
      JOIN orders o ON op.order_id = o.id
      WHERE op.package_id = 39
      ORDER BY o.created_at DESC
      LIMIT 5
    `);
    
    console.log(`   📦 Found ${recentPackageOrders.rows.length} recent Study Essentials Package orders:`);
    recentPackageOrders.rows.forEach(order => {
      console.log(`      • Order ${order.order_number}: ${order.quantity} package(s) ordered on ${order.created_at}`);
    });
    
    // 5. Check recent order_items for the sub-products
    console.log('\n5️⃣ Recent Product Orders (Sub-Products):');
    const recentProductOrders = await pool.query(`
      SELECT oi.id, oi.order_id, oi.product_id, oi.quantity, oi.product_name, o.order_number, o.created_at
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE oi.product_id IN (
        SELECT product_id FROM package_items WHERE package_id = 39
      )
      ORDER BY o.created_at DESC
      LIMIT 10
    `);
    
    console.log(`   📋 Found ${recentProductOrders.rows.length} recent sub-product orders:`);
    recentProductOrders.rows.forEach(item => {
      console.log(`      • Order ${item.order_number}: ${item.quantity}x ${item.product_name} (ID: ${item.product_id}) on ${item.created_at}`);
    });
    
    // 6. Check inventory changes for sub-products
    console.log('\n6️⃣ Sub-Product Inventory Changes:');
    const subProductIds = packageItems.rows.map(item => item.product_id);
    if (subProductIds.length > 0) {
      const subProductInventory = await pool.query(`
        SELECT id, name, inventory, price
        FROM products 
        WHERE id = ANY($1)
        ORDER BY id
      `, [subProductIds]);
      
      subProductInventory.rows.forEach(product => {
        console.log(`      • ${product.name} (ID: ${product.id})`);
        console.log(`        💰 Price: $${product.price}`);
        console.log(`        📊 Current Inventory: ${product.inventory}`);
      });
    }
    
    // 7. Check if any inventory triggers were fired
    console.log('\n7️⃣ Checking for Inventory Trigger Activity:');
    const triggerActivity = await pool.query(`
      SELECT 
        schemaname,
        tablename,
        trigger_name,
        event_manipulation,
        action_statement
      FROM information_schema.triggers 
      WHERE trigger_name LIKE '%package%' OR trigger_name LIKE '%inventory%'
    `);
    
    console.log(`   🔧 Found ${triggerActivity.rows.length} inventory-related triggers:`);
    triggerActivity.rows.forEach(trigger => {
      console.log(`      • ${trigger.trigger_name} on ${trigger.tablename}`);
      console.log(`        📝 Event: ${trigger.event_manipulation}`);
    });
    
    // 8. Summary
    console.log('\n📊 Inventory Change Summary:');
    const mostRecentOrder = recentOrders.rows[0];
    if (mostRecentOrder) {
      console.log(`   🎯 Most Recent Order: ${mostRecentOrder.order_number}`);
      console.log(`   👤 Customer: ${mostRecentOrder.first_name} ${mostRecentOrder.last_name}`);
      console.log(`   💰 Total: $${mostRecentOrder.total}`);
      console.log(`   📅 Date: ${mostRecentOrder.created_at}`);
    }
    
    const packageInfo = packageInventory.rows[0];
    if (packageInfo) {
      console.log(`   📦 Study Essentials Package Inventory: ${packageInfo.inventory}`);
      console.log(`   📋 Sub-Products: ${packageItems.rows.length} items`);
    }
    
    console.log('\n✅ Database check completed!');
    console.log('📝 The inventory should have been reduced by 1 for the Study Essentials Package');
    console.log('📝 Sub-product inventories should remain unchanged (package inventory is managed separately)');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkRecentOrderInventory(); 