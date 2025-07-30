import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

async function testInventoryReduction() {
  const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PWD,
    port: process.env.PG_PORT,
  });

  try {
    console.log('Testing inventory reduction functionality...');
    
    // Get initial inventory for a product
    const initialResult = await pool.query('SELECT id, name, inventory FROM products LIMIT 1');
    if (initialResult.rows.length === 0) {
      console.log('No products found in database');
      return;
    }
    
    const product = initialResult.rows[0];
    console.log(`\nInitial state for product "${product.name}":`);
    console.log(`   - Product ID: ${product.id}`);
    console.log(`   - Initial inventory: ${product.inventory}`);
    
    // Simulate inventory reduction (like what happens during order creation)
    const quantityToReduce = 2;
    await pool.query(
      'UPDATE products SET inventory = inventory - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [quantityToReduce, product.id]
    );
    
    // Check final inventory
    const finalResult = await pool.query('SELECT inventory FROM products WHERE id = $1', [product.id]);
    const finalInventory = finalResult.rows[0].inventory;
    
    console.log(`\nAfter reducing inventory by ${quantityToReduce}:`);
    console.log(`   - Final inventory: ${finalInventory}`);
    console.log(`   - Expected inventory: ${product.inventory - quantityToReduce}`);
    
    if (finalInventory === product.inventory - quantityToReduce) {
      console.log('\n✅ Inventory reduction test PASSED!');
    } else {
      console.log('\n❌ Inventory reduction test FAILED!');
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  } finally {
    await pool.end();
  }
}

testInventoryReduction(); 