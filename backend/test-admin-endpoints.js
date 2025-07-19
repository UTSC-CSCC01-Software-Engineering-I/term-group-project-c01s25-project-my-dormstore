import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5001';

// Test admin login first
async function testAdminLogin() {
  try {
    const response = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    });

    const data = await response.json();
    console.log('Admin Login Response:', data);
    
    if (data.token) {
      return data.token;
    } else {
      console.error('Failed to get admin token');
      return null;
    }
  } catch (error) {
    console.error('Admin login error:', error);
    return null;
  }
}

// Test revenue endpoint
async function testRevenueEndpoint(token) {
  try {
    const response = await fetch(`${BASE_URL}/api/admin/revenue?range=7`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    console.log('Revenue Data (7 days):', data);
  } catch (error) {
    console.error('Revenue endpoint error:', error);
  }
}

// Test active orders endpoint
async function testActiveOrdersEndpoint(token) {
  try {
    const response = await fetch(`${BASE_URL}/api/admin/orders/active`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    console.log('Active Orders Data:', data);
  } catch (error) {
    console.error('Active orders endpoint error:', error);
  }
}

// Test dashboard summary endpoint
async function testDashboardSummaryEndpoint(token) {
  try {
    const response = await fetch(`${BASE_URL}/api/admin/dashboard/summary`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    console.log('Dashboard Summary Data:', data);
  } catch (error) {
    console.error('Dashboard summary endpoint error:', error);
  }
}

// Run all tests
async function runTests() {
  console.log('Testing Admin Dashboard Endpoints...\n');
  
  const token = await testAdminLogin();
  if (token) {
    console.log('\n--- Testing Revenue Endpoint ---');
    await testRevenueEndpoint(token);
    
    console.log('\n--- Testing Active Orders Endpoint ---');
    await testActiveOrdersEndpoint(token);
    
    console.log('\n--- Testing Dashboard Summary Endpoint ---');
    await testDashboardSummaryEndpoint(token);
  } else {
    console.log('Cannot proceed without admin token');
  }
}

runTests().catch(console.error); 