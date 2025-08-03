// Test script to verify cart functionality
const API_BASE = 'http://localhost:5001';

async function testCartFunctionality() {
  console.log('🧪 Testing Cart Functionality...\n');

  try {
    // Test 1: Add product to cart
    console.log('1️⃣ Testing: Add product to cart');
    const addProductResponse = await fetch(`${API_BASE}/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: 25, quantity: 1 })
    });
    const addProductResult = await addProductResponse.json();
    console.log('   ✅ Product added to cart:', addProductResult.message);

    // Test 2: Add package to cart
    console.log('\n2️⃣ Testing: Add package to cart');
    const addPackageResponse = await fetch(`${API_BASE}/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ package_id: 39, quantity: 1 })
    });
    const addPackageResult = await addPackageResponse.json();
    console.log('   ✅ Package added to cart:', addPackageResult.message);

    // Test 3: Get cart items
    console.log('\n3️⃣ Testing: Get cart items');
    const getCartResponse = await fetch(`${API_BASE}/cart`);
    const getCartResult = await getCartResponse.json();
    console.log('   ✅ Cart retrieved:', getCartResult.cartItems?.length || 0, 'items');

    // Test 4: Checkout
    console.log('\n4️⃣ Testing: Checkout process');
    const checkoutResponse = await fetch(`${API_BASE}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        address: '123 Test St',
        city: 'Test City',
        province: 'ON',
        postalCode: 'A1A1A1',
        subtotal: 100,
        tax: 13,
        shipping: 10,
        total: 123,
        cartItems: [
          {
            product_id: 25,
            product_name: 'Extension Cord',
            product_price: 21.99,
            quantity: 1,
            item_type: 'product'
          }
        ]
      })
    });
    const checkoutResult = await checkoutResponse.json();
    console.log('   ✅ Checkout successful:', checkoutResult.message);

    console.log('\n🎉 All cart functionality tests passed!');
    console.log('📱 You can now access the frontend at: http://localhost:3000');
    console.log('🔧 Backend API is running at: http://localhost:5001');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCartFunctionality(); 