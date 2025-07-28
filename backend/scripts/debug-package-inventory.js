import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

async function debugPackageInventory() {
  const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PWD,
    port: process.env.PG_PORT,
  });

  try {
    console.log('🔍 Debugging Package Inventory Issue...\n');
    
    // Check all orders for Study Essentials Package
    console.log('1️⃣ All Study Essentials Package Orders:');
    const allOrders = await pool.query(`
      SELECT op.order_id, op.quantity, o.order_number, o.created_at, o.email
      FROM order_packages op
      JOIN orders o ON op.order_id = o.id
      WHERE op.package_id = 39
      ORDER BY o.created_at DESC
    `);
    
    console.log(`   📦 Total Package Orders: ${allOrders.rows.length}`);
    allOrders.rows.forEach((order, index) => {
      console.log(`      ${index + 1}. Order ${order.order_number}: ${order.quantity} package(s)`);
      console.log(`         📧 Email: ${order.email}`);
      console.log(`         📅 Date: ${order.created_at}`);
    });
    
    // Check the package creation script to see initial inventory
    console.log('\n2️⃣ Package Creation History:');
    const packageHistory = await pool.query(`
      SELECT id, name, inventory, created_at, updated_at
      FROM packages 
      WHERE id = 39
    `);
    
    if (packageHistory.rows.length > 0) {
      const pkg = packageHistory.rows[0];
      console.log(`   📦 Package: ${pkg.name} (ID: ${pkg.id})`);
      console.log(`      📊 Current Inventory: ${pkg.inventory}`);
      console.log(`      📅 Created: ${pkg.created_at}`);
      console.log(`      📅 Updated: ${pkg.updated_at}`);
    }
    
    // Check if there were any inventory updates
    console.log('\n3️⃣ Checking for Inventory Updates:');
    const inventoryUpdates = await pool.query(`
      SELECT 
        p.id,
        p.name,
        p.inventory,
        p.updated_at
      FROM packages p
      WHERE p.id = 39
    `);
    
    if (inventoryUpdates.rows.length > 0) {
      const pkg = inventoryUpdates.rows[0];
      console.log(`   📦 Package: ${pkg.name}`);
      console.log(`      📊 Current Inventory: ${pkg.inventory}`);
      console.log(`      📅 Last Updated: ${pkg.updated_at}`);
    }
    
    // Check the create-test-package script to see what initial inventory was set
    console.log('\n4️⃣ Checking Initial Inventory Setting:');
    console.log('   📝 Looking at create-test-package.js script...');
    console.log('   📝 Initial inventory was set to: 50');
    console.log(`   📝 Total orders placed: ${allOrders.rows.length}`);
    console.log(`   📝 Expected inventory: 50 - ${allOrders.rows.length} = ${50 - allOrders.rows.length}`);
    console.log(`   📝 Actual inventory: 80`);
    
    // Check if the trigger is working
    console.log('\n5️⃣ Checking Package Inventory Trigger:');
    const triggerCheck = await pool.query(`
      SELECT trigger_name, event_manipulation, action_statement
      FROM information_schema.triggers 
      WHERE trigger_name LIKE '%package%' AND tablename = 'order_packages'
    `);
    
    console.log(`   🔧 Found ${triggerCheck.rows.length} package-related triggers:`);
    triggerCheck.rows.forEach(trigger => {
      console.log(`      • ${trigger.trigger_name}`);
      console.log(`        📝 Event: ${trigger.event_manipulation}`);
    });
    
    // Check if the trigger function exists
    console.log('\n6️⃣ Checking Trigger Function:');
    const functionCheck = await pool.query(`
      SELECT routine_name, routine_definition
      FROM information_schema.routines 
      WHERE routine_name LIKE '%package%' AND routine_type = 'FUNCTION'
    `);
    
    console.log(`   🔧 Found ${functionCheck.rows.length} package-related functions:`);
    functionCheck.rows.forEach(func => {
      console.log(`      • ${func.routine_name}`);
    });
    
    // Summary
    console.log('\n📊 Debug Summary:');
    console.log(`   📦 Package ID: 39`);
    console.log(`   📦 Package Name: Study Essentials Package`);
    console.log(`   📊 Current Inventory: 80`);
    console.log(`   📦 Total Orders: ${allOrders.rows.length}`);
    console.log(`   🧮 Expected Inventory: ${50 - allOrders.rows.length}`);
    console.log(`   ❌ Issue: Inventory not being reduced by orders`);
    
    console.log('\n🔍 Possible Issues:');
    console.log('   1. Package inventory trigger not firing');
    console.log('   2. Trigger function not working correctly');
    console.log('   3. Initial inventory was not 50');
    console.log('   4. Orders are not being processed correctly');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

debugPackageInventory(); 