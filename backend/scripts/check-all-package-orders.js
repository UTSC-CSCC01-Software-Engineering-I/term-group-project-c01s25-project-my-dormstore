import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

async function checkAllPackageOrders() {
  const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PWD,
    port: process.env.PG_PORT,
  });

  try {
    console.log('🔍 Checking All Study Essentials Package Orders...\n');
    
    // Get ALL orders for Study Essentials Package
    console.log('1️⃣ All Study Essentials Package Orders:');
    const allOrders = await pool.query(`
      SELECT op.order_id, op.quantity, o.order_number, o.created_at, o.email, o.first_name, o.last_name
      FROM order_packages op
      JOIN orders o ON op.order_id = o.id
      WHERE op.package_id = 39
      ORDER BY o.created_at DESC
    `);
    
    console.log(`   📦 Total Orders Found: ${allOrders.rows.length}`);
    console.log(`   📊 Total Quantity Ordered: ${allOrders.rows.reduce((sum, order) => sum + order.quantity, 0)}`);
    
    console.log('\n   📋 Order Details:');
    allOrders.rows.forEach((order, index) => {
      console.log(`      ${index + 1}. Order ${order.order_number}`);
      console.log(`         👤 Customer: ${order.first_name} ${order.last_name}`);
      console.log(`         📧 Email: ${order.email}`);
      console.log(`         📦 Quantity: ${order.quantity} package(s)`);
      console.log(`         📅 Date: ${order.created_at}`);
      console.log('');
    });
    
    // Check your specific order
    console.log('2️⃣ Your Recent Order:');
    const yourOrder = await pool.query(`
      SELECT op.order_id, op.quantity, o.order_number, o.created_at, o.email, o.first_name, o.last_name
      FROM order_packages op
      JOIN orders o ON op.order_id = o.id
      WHERE op.package_id = 39 AND o.email = 'test-fix@example.com'
      ORDER BY o.created_at DESC
      LIMIT 1
    `);
    
    if (yourOrder.rows.length > 0) {
      const order = yourOrder.rows[0];
      console.log(`   📦 Order Number: ${order.order_number}`);
      console.log(`   👤 Customer: ${order.first_name} ${order.last_name}`);
      console.log(`   📧 Email: ${order.email}`);
      console.log(`   📦 Quantity: ${order.quantity} package(s)`);
      console.log(`   📅 Date: ${order.created_at}`);
    } else {
      console.log('   ❌ Your order not found');
    }
    
    // Check inventory calculation
    console.log('\n3️⃣ Inventory Calculation:');
    const totalQuantity = allOrders.rows.reduce((sum, order) => sum + order.quantity, 0);
    const initialInventory = 50;
    const expectedInventory = initialInventory - totalQuantity;
    
    console.log(`   📊 Initial Inventory: ${initialInventory}`);
    console.log(`   📦 Total Orders: ${allOrders.rows.length}`);
    console.log(`   📦 Total Quantity Ordered: ${totalQuantity}`);
    console.log(`   🧮 Expected Inventory: ${initialInventory} - ${totalQuantity} = ${expectedInventory}`);
    
    // Check current inventory
    const currentInventory = await pool.query(`
      SELECT inventory FROM packages WHERE id = 39
    `);
    
    const actualInventory = currentInventory.rows[0]?.inventory || 0;
    console.log(`   📊 Actual Inventory: ${actualInventory}`);
    
    if (actualInventory === expectedInventory) {
      console.log('   ✅ Inventory calculation is correct!');
    } else {
      console.log(`   ❌ Inventory mismatch! Expected: ${expectedInventory}, Actual: ${actualInventory}`);
    }
    
    // Check if there were any test orders
    console.log('\n4️⃣ Test Orders Analysis:');
    const testOrders = allOrders.rows.filter(order => 
      order.email.includes('test') || 
      order.email.includes('guest') || 
      order.email.includes('example')
    );
    
    console.log(`   🧪 Test Orders: ${testOrders.length}`);
    testOrders.forEach((order, index) => {
      console.log(`      ${index + 1}. ${order.email} - ${order.quantity} package(s)`);
    });
    
    const realOrders = allOrders.rows.filter(order => 
      !order.email.includes('test') && 
      !order.email.includes('guest') && 
      !order.email.includes('example')
    );
    
    console.log(`   👤 Real Orders: ${realOrders.length}`);
    realOrders.forEach((order, index) => {
      console.log(`      ${index + 1}. ${order.email} - ${order.quantity} package(s)`);
    });
    
    // Summary
    console.log('\n📊 Summary:');
    console.log(`   📦 Total Package Orders: ${allOrders.rows.length}`);
    console.log(`   📦 Total Quantity: ${totalQuantity}`);
    console.log(`   🧪 Test Orders: ${testOrders.length}`);
    console.log(`   👤 Real Orders: ${realOrders.length}`);
    console.log(`   📊 Current Inventory: ${actualInventory}`);
    console.log(`   🧮 Expected Inventory: ${expectedInventory}`);
    
    if (actualInventory === expectedInventory) {
      console.log('\n✅ The inventory calculation is correct!');
      console.log('📝 The inventory dropped from 50 to 42 because there were 8 total orders (including test orders)');
      console.log('📝 Each order reduced the inventory by 1, so: 50 - 8 = 42');
    } else {
      console.log('\n❌ There is an inventory calculation issue!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkAllPackageOrders(); 