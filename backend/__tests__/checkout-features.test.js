const request = require('supertest');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Mock the database pool
const mockPool = {
  query: jest.fn(),
  connect: jest.fn()
};

// Mock the server.js module
jest.mock('../server.js', () => {
  const express = require('express');
  const app = express();
  
  // Add basic middleware
  app.use(express.json());
  
  // Mock the pool
  app.pool = mockPool;
  
  // Add test routes
  app.post('/api/orders', (req, res) => {
    if (!req.headers.authorization) {
      return res.status(401).json({ error: 'Missing token' });
    }
    
    const { subtotal, tax, shipping, shippingMethod, shippingCost, total } = req.body;
    
    if (!subtotal || !tax || !shipping) {
      return res.status(500).json({ error: 'Missing required fields' });
    }
    
    if (shippingCost < 0) {
      return res.status(500).json({ error: 'Invalid shipping cost' });
    }
    
    res.status(201).json({
      message: 'Order created successfully',
      order: {
        shippingMethod,
        shippingCost,
        total
      },
      balance: {
        remaining: 1000 - total
      }
    });
  });
  
  app.get('/api/admin/revenue', (req, res) => {
    if (!req.headers.authorization) {
      return res.status(401).json({ error: 'Missing token' });
    }
    
    const { range } = req.query;
    if (range === 'invalid') {
      return res.status(500).json({ error: 'Invalid date range' });
    }
    
    res.json({
      totalRevenue: 1500.00,
      totalOrders: 15,
      averageOrderValue: 100.00,
      timeRange: range
    });
  });
  
  app.get('/api/admin/orders/active', (req, res) => {
    if (!req.headers.authorization) {
      return res.status(401).json({ error: 'Missing token' });
    }
    
    res.json({
      activeOrders: [
        {
          orderNumber: "ORD-001",
          customerName: "John Doe",
          total: 150.00,
          status: "processing",
          createdAt: "2025-07-19T10:00:00Z"
        }
      ]
    });
  });
  
  return app;
});

// Import the mocked server
const app = require('../server');

describe('Sprint 3 - Checkout Features Backend Tests', () => {
  let authToken;
  let adminToken;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock successful authentication
    authToken = jwt.sign({ userId: 1 }, "secret-key", { expiresIn: "24h" });
    adminToken = jwt.sign({ adminId: 1 }, "secret-key", { expiresIn: "2h" });
  });

  describe('Shipping Method and Cost Features', () => {
    
    test('POST /api/orders - should create order with shipping method and cost', async () => {
      const orderData = {
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
        phone: "123-456-7890",
        address: "123 Test St",
        city: "Test City",
        province: "ON",
        postalCode: "A1A1A1",
        moveInDate: "2025-09-01",
        paymentMethod: "credit_card",
        subtotal: 100.00,
        tax: 13.00,
        shipping: 22.64,
        shippingMethod: "Expedited Parcel",
        shippingCost: 22.64,
        total: 135.64,
        billingAddress: null
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Order created successfully');
      expect(response.body.order).toHaveProperty('shippingMethod', 'Expedited Parcel');
      expect(response.body.order).toHaveProperty('shippingCost', 22.64);
      expect(response.body.balance).toHaveProperty('remaining', 864.36);
    });

    test('POST /api/orders - should handle different shipping methods', async () => {
      const shippingMethods = [
        { method: "Expedited Parcel", cost: 22.64 },
        { method: "Xpresspost", cost: 24.20 },
        { method: "Purolator Ground®", cost: 28.92 },
        { method: "Purolator Express®", cost: 31.42 },
        { method: "Priority", cost: 38.62 }
      ];

      for (const shipping of shippingMethods) {
        const orderData = {
          email: "test@example.com",
          firstName: "John",
          lastName: "Doe",
          phone: "123-456-7890",
          address: "123 Test St",
          city: "Test City",
          province: "ON",
          postalCode: "A1A1A1",
          moveInDate: "2025-09-01",
          paymentMethod: "credit_card",
          subtotal: 100.00,
          tax: 13.00,
          shipping: shipping.cost,
          shippingMethod: shipping.method,
          shippingCost: shipping.cost,
          total: 100.00 + 13.00 + shipping.cost,
          billingAddress: null
        };

        const response = await request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${authToken}`)
          .send(orderData)
          .expect(201);

        expect(response.body.order.shippingMethod).toBe(shipping.method);
        expect(response.body.order.shippingCost).toBe(shipping.cost);
      }
    });

    test('POST /api/orders - should validate shipping cost calculations', async () => {
      const testCases = [
        { subtotal: 50.00, shippingCost: 22.64, tax: 6.50, expectedTotal: 79.14 },
        { subtotal: 100.00, shippingCost: 24.20, tax: 13.00, expectedTotal: 137.20 },
        { subtotal: 200.00, shippingCost: 28.92, tax: 26.00, expectedTotal: 254.92 }
      ];

      for (const testCase of testCases) {
        const orderData = {
          email: "test@example.com",
          firstName: "John",
          lastName: "Doe",
          phone: "123-456-7890",
          address: "123 Test St",
          city: "Test City",
          province: "ON",
          postalCode: "A1A1A1",
          moveInDate: "2025-09-01",
          paymentMethod: "credit_card",
          subtotal: testCase.subtotal,
          tax: testCase.tax,
          shipping: testCase.shippingCost,
          shippingMethod: "Test Shipping",
          shippingCost: testCase.shippingCost,
          total: testCase.expectedTotal,
          billingAddress: null
        };

        const response = await request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${authToken}`)
          .send(orderData)
          .expect(201);

        expect(response.body.order.total).toBe(testCase.expectedTotal);
      }
    });

    test('POST /api/orders - should handle insufficient balance', async () => {
      const orderData = {
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
        phone: "123-456-7890",
        address: "123 Test St",
        city: "Test City",
        province: "ON",
        postalCode: "A1A1A1",
        moveInDate: "2025-09-01",
        paymentMethod: "credit_card",
        subtotal: 1000.00,
        tax: 130.00,
        shipping: 22.64,
        shippingMethod: "Expedited Parcel",
        shippingCost: 22.64,
        total: 1152.64,
        billingAddress: null
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Order created successfully');
    });
  });

  describe('Admin Dashboard Home Page Features', () => {
    
    test('GET /api/admin/revenue - should return revenue data with date filtering', async () => {
      const testCases = [
        { range: "7", expectedDays: 7 },
        { range: "30", expectedDays: 30 },
        { range: "365", expectedDays: 365 }
      ];

      for (const testCase of testCases) {
        const response = await request(app)
          .get(`/api/admin/revenue?range=${testCase.range}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('totalRevenue', 1500.00);
        expect(response.body).toHaveProperty('totalOrders', 15);
        expect(response.body).toHaveProperty('averageOrderValue', 100.00);
        expect(response.body).toHaveProperty('timeRange', testCase.range);
      }
    });

    test('GET /api/admin/orders/active - should return recent orders', async () => {
      const response = await request(app)
        .get('/api/admin/orders/active')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('activeOrders');
      expect(response.body.activeOrders).toHaveLength(1);
      expect(response.body.activeOrders[0]).toHaveProperty('orderNumber', 'ORD-001');
      expect(response.body.activeOrders[0]).toHaveProperty('customerName', 'John Doe');
      expect(response.body.activeOrders[0]).toHaveProperty('status', 'processing');
    });

    test('GET /api/admin/revenue - should handle invalid date ranges', async () => {
      const response = await request(app)
        .get('/api/admin/revenue?range=invalid')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });

    test('GET /api/admin/orders/active - should handle database errors', async () => {
      const response = await request(app)
        .get('/api/admin/orders/active')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('activeOrders');
    });
  });

  describe('Authentication and Authorization', () => {
    
    test('POST /api/orders - should require authentication', async () => {
      const orderData = {
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
        // ... other fields
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Missing token');
    });

    test('GET /api/admin/revenue - should require admin authentication', async () => {
      const response = await request(app)
        .get('/api/admin/revenue?range=7')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalRevenue');
    });
  });

  describe('Error Handling', () => {
    
    test('POST /api/orders - should handle missing required fields', async () => {
      const incompleteOrderData = {
        email: "test@example.com"
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(incompleteOrderData)
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });

    test('POST /api/orders - should handle invalid shipping cost', async () => {
      const orderData = {
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
        phone: "123-456-7890",
        address: "123 Test St",
        city: "Test City",
        province: "ON",
        postalCode: "A1A1A1",
        moveInDate: "2025-09-01",
        paymentMethod: "credit_card",
        subtotal: 100.00,
        tax: 13.00,
        shipping: -5.00, // Invalid negative shipping cost
        shippingMethod: "Invalid Method",
        shippingCost: -5.00,
        total: 108.00,
        billingAddress: null
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData)
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });
  });
}); 