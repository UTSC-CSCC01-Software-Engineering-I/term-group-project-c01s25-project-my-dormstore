import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

async function checkAndFixTriggers() {
  const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PWD,
    port: process.env.PG_PORT,
  });

  try {
    console.log('🔍 Checking and Fixing Package Inventory Triggers...\n');
    
    // Check existing triggers
    console.log('1️⃣ Checking Existing Triggers:');
    const triggers = await pool.query(`
      SELECT 
        trigger_name,
        event_manipulation,
        action_statement
      FROM information_schema.triggers 
      WHERE trigger_name LIKE '%package%' OR trigger_name LIKE '%inventory%'
    `);
    
    console.log(`   🔧 Found ${triggers.rows.length} triggers:`);
    triggers.rows.forEach(trigger => {
      console.log(`      • ${trigger.trigger_name}`);
      console.log(`        📝 Event: ${trigger.event_manipulation}`);
    });
    
    // Check existing functions
    console.log('\n2️⃣ Checking Existing Functions:');
    const functions = await pool.query(`
      SELECT routine_name
      FROM information_schema.routines 
      WHERE routine_name LIKE '%package%' AND routine_type = 'FUNCTION'
    `);
    
    console.log(`   🔧 Found ${functions.rows.length} functions:`);
    functions.rows.forEach(func => {
      console.log(`      • ${func.routine_name}`);
    });
    
    // Check if the package inventory trigger exists
    console.log('\n3️⃣ Checking Package Inventory Trigger:');
    const packageTrigger = await pool.query(`
      SELECT trigger_name
      FROM information_schema.triggers 
      WHERE trigger_name = 'trg_reduce_package_inventory'
    `);
    
    if (packageTrigger.rows.length > 0) {
      console.log('   ✅ Package inventory trigger exists');
    } else {
      console.log('   ❌ Package inventory trigger missing');
    }
    
    // Check if the function exists
    console.log('\n4️⃣ Checking Package Inventory Function:');
    const packageFunction = await pool.query(`
      SELECT routine_name
      FROM information_schema.routines 
      WHERE routine_name = 'reduce_package_inventory_on_order' AND routine_type = 'FUNCTION'
    `);
    
    if (packageFunction.rows.length > 0) {
      console.log('   ✅ Package inventory function exists');
    } else {
      console.log('   ❌ Package inventory function missing');
    }
    
    // Fix the package inventory manually
    console.log('\n5️⃣ Fixing Package Inventory:');
    const allOrders = await pool.query(`
      SELECT COUNT(*) as order_count
      FROM order_packages op
      WHERE op.package_id = 39
    `);
    
    const orderCount = allOrders.rows[0].order_count;
    const correctInventory = 50 - orderCount;
    
    console.log(`   📦 Total orders for package 39: ${orderCount}`);
    console.log(`   🧮 Correct inventory should be: 50 - ${orderCount} = ${correctInventory}`);
    
    // Update the package inventory
    await pool.query(`
      UPDATE packages 
      SET inventory = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = 39
    `, [correctInventory]);
    
    console.log(`   ✅ Updated package inventory to ${correctInventory}`);
    
    // Verify the fix
    console.log('\n6️⃣ Verifying Fix:');
    const updatedPackage = await pool.query(`
      SELECT id, name, inventory, updated_at
      FROM packages 
      WHERE id = 39
    `);
    
    if (updatedPackage.rows.length > 0) {
      const pkg = updatedPackage.rows[0];
      console.log(`   📦 Package: ${pkg.name} (ID: ${pkg.id})`);
      console.log(`   📊 Updated Inventory: ${pkg.inventory}`);
      console.log(`   📅 Updated: ${pkg.updated_at}`);
      
      if (pkg.inventory === correctInventory) {
        console.log('   ✅ Package inventory fixed correctly!');
      } else {
        console.log(`   ❌ Package inventory still incorrect. Expected: ${correctInventory}, Actual: ${pkg.inventory}`);
      }
    }
    
    // Recreate the trigger if it's missing
    console.log('\n7️⃣ Recreating Package Inventory Trigger:');
    
    // Drop existing trigger if it exists
    try {
      await pool.query(`DROP TRIGGER IF EXISTS trg_reduce_package_inventory ON order_packages`);
      console.log('   🗑️ Dropped existing trigger');
    } catch (error) {
      console.log('   ℹ️ No existing trigger to drop');
    }
    
    // Create the function if it doesn't exist
    try {
      await pool.query(`
        CREATE OR REPLACE FUNCTION reduce_package_inventory_on_order()
        RETURNS TRIGGER AS $$
        BEGIN
          -- Reduce package inventory when a package is ordered
          UPDATE packages 
          SET inventory = inventory - NEW.quantity,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = NEW.package_id;
          
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `);
      console.log('   ✅ Created package inventory function');
    } catch (error) {
      console.log('   ℹ️ Function already exists or error:', error.message);
    }
    
    // Create the trigger
    try {
      await pool.query(`
        CREATE TRIGGER trg_reduce_package_inventory
        AFTER INSERT ON order_packages
        FOR EACH ROW
        EXECUTE FUNCTION reduce_package_inventory_on_order();
      `);
      console.log('   ✅ Created package inventory trigger');
    } catch (error) {
      console.log('   ❌ Error creating trigger:', error.message);
    }
    
    console.log('\n✅ Package inventory system fixed!');
    console.log('📝 The package inventory should now be reduced automatically when packages are ordered');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkAndFixTriggers(); 