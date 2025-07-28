import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

async function testPackageInventoryLogic() {
  const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PWD,
    port: process.env.PG_PORT,
  });

  try {
    console.log('🧪 Testing Package Inventory Logic...\n');
    
    // Get our test package (ID: 39)
    const packageResult = await pool.query(`
      SELECT * FROM packages WHERE id = 39
    `);
    
    if (packageResult.rows.length === 0) {
      console.log('❌ Test package not found. Please run create-test-package.js first.');
      return;
    }
    
    const testPackage = packageResult.rows[0];
    console.log(`📦 Test Package: ${testPackage.name} (ID: ${testPackage.id})`);
    console.log(`   Initial Inventory: ${testPackage.inventory}`);
    
    // Get sub-products and their inventories
    const subProductsResult = await pool.query(`
      SELECT p.id, p.name, p.inventory, pi.quantity as required_quantity
      FROM package_items pi
      JOIN products p ON pi.product_id = p.id
      WHERE pi.package_id = 39
      ORDER BY p.id
    `);
    
    console.log('\n📋 Sub-products and their inventories:');
    subProductsResult.rows.forEach(product => {
      console.log(`   - ${product.name} (ID: ${product.id}): ${product.inventory} in stock, ${product.required_quantity} needed per package`);
    });
    
    // Calculate expected package inventory based on sub-product availability
    const minAvailable = Math.min(...subProductsResult.rows.map(p => Math.floor(p.inventory / p.required_quantity)));
    console.log(`\n🧮 Expected package inventory: ${minAvailable} (based on sub-product availability)`);
    
    // Test reducing one sub-product inventory
    console.log('\n🔄 Testing inventory reduction...');
    const testProductId = 41; // Magnetic White Board
    const reductionAmount = 10;
    
    console.log(`   Reducing product ID ${testProductId} inventory by ${reductionAmount}...`);
    
    await pool.query(`
      UPDATE products 
      SET inventory = inventory - $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2
    `, [reductionAmount, testProductId]);
    
    // Check updated package inventory
    const updatedPackageResult = await pool.query(`
      SELECT inventory FROM packages WHERE id = 39
    `);
    
    console.log(`   ✅ Package inventory after reduction: ${updatedPackageResult.rows[0].inventory}`);
    
    // Check updated sub-product inventories
    const updatedSubProductsResult = await pool.query(`
      SELECT p.id, p.name, p.inventory, pi.quantity as required_quantity
      FROM package_items pi
      JOIN products p ON pi.product_id = p.id
      WHERE pi.package_id = 39
      ORDER BY p.id
    `);
    
    console.log('\n📋 Updated sub-product inventories:');
    updatedSubProductsResult.rows.forEach(product => {
      console.log(`   - ${product.name} (ID: ${product.id}): ${product.inventory} in stock`);
    });
    
    // Calculate new expected package inventory
    const newMinAvailable = Math.min(...updatedSubProductsResult.rows.map(p => Math.floor(p.inventory / p.required_quantity)));
    console.log(`\n🧮 New expected package inventory: ${newMinAvailable}`);
    
    // Test adding the package to cart
    console.log('\n🛒 Testing package cart functionality...');
    
    // Simulate adding package to cart (guest user)
    const cartResponse = await fetch('http://localhost:5001/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ package_id: 39, quantity: 1 })
    });
    
    if (cartResponse.ok) {
      console.log('   ✅ Package added to cart successfully');
    } else {
      console.log('   ❌ Failed to add package to cart');
    }
    
    // Test order creation with package
    console.log('\n📦 Testing order creation with package...');
    
    // This would normally be done through the checkout process
    // For testing, we'll simulate the order creation logic
    const orderResult = await pool.query(`
      INSERT INTO orders (
        order_number, user_id, email, first_name, last_name, 
        address, city, province, postal_code, 
        subtotal, tax, shipping, total, order_status
      )
      VALUES (
        'TEST-${Date.now()}', 1, 'test@example.com', 'Test', 'User',
        'Test Address', 'Test City', 'ON', 'A1A1A1',
        $1, 0, 0, $1, 'pending'
      )
      RETURNING id
    `, [testPackage.price]);
    
    const orderId = orderResult.rows[0].id;
    console.log(`   ✅ Created test order (ID: ${orderId})`);
    
    // Add package to order
    await pool.query(`
      INSERT INTO order_packages (order_id, package_id, quantity)
      VALUES ($1, $2, $3)
    `, [orderId, 39, 1]);
    
    console.log('   ✅ Added package to order');
    
    // Check final package inventory
    const finalPackageResult = await pool.query(`
      SELECT inventory FROM packages WHERE id = 39
    `);
    
    console.log(`   📦 Final package inventory: ${finalPackageResult.rows[0].inventory}`);
    
    // Clean up test order
    await pool.query(`DELETE FROM orders WHERE id = $1`, [orderId]);
    console.log('   🧹 Cleaned up test order');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

testPackageInventoryLogic(); 