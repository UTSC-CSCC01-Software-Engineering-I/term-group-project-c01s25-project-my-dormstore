import request from 'supertest';
import app from '../server.js';
import { pool } from '../server.js';
import { jest } from '@jest/globals';

const testOrder = {
  order_number: 'ORD-TRACK-001',
  email: 'tracktest@example.com',
  phone: '1234567890',
  first_name: 'Track',
  last_name: 'Test',
  address: '123 Tracking Ln',
  city: 'Toronto',
  province: 'ON',
  postal_code: 'M1M1M1',
  subtotal: 90.00,
  tax: 10.00,
  shipping: 5.00, 
  total: 105.00,   
  order_status: 'confirmed',
};

beforeAll(async () => {
  await pool.query(`DELETE FROM orders WHERE order_number = $1`, [testOrder.order_number]);

  await pool.query(
    `INSERT INTO orders (
      order_number, email, phone, first_name, last_name, address,
      city, province, postal_code, subtotal, tax, shipping, total, order_status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
    [
      testOrder.order_number,
      testOrder.email,
      testOrder.phone,
      testOrder.first_name,
      testOrder.last_name,
      testOrder.address,
      testOrder.city,
      testOrder.province,
      testOrder.postal_code,
      testOrder.subtotal,
      testOrder.tax,
      testOrder.shipping, 
      testOrder.total,
      testOrder.order_status,
    ]
  );
});

afterAll(async () => {
  await pool.query(`DELETE FROM orders WHERE order_number = $1`, [testOrder.order_number]);
  await pool.end();
});

describe('GET /api/order-tracking', () => {
  test('200: returns order for valid email', async () => {
    const res = await request(app)
      .get('/api/order-tracking')
      .query({ orderNumber: testOrder.order_number, emailOrPhone: testOrder.email });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.order_number).toBe(testOrder.order_number);
  });

  test('200: returns order for valid phone', async () => {
    const res = await request(app)
      .get('/api/order-tracking')
      .query({ orderNumber: testOrder.order_number, emailOrPhone: testOrder.phone });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.order_number).toBe(testOrder.order_number);
  });

  test('404: returns not found for wrong email/phone', async () => {
    const res = await request(app)
      .get('/api/order-tracking')
      .query({ orderNumber: testOrder.order_number, emailOrPhone: 'wrong@email.com' });

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/not found/i);
  });

  test('400: missing query params', async () => {
    const res = await request(app).get('/api/order-tracking');
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/missing/i);
  });
  test('GET /api/order-tracking - simulate DB failure', async () => {
    const originalQuery = pool.query;
    
    pool.query = jest.fn(() => {
      throw new Error('Simulated DB error');
    });
  
    const res = await request(app).get('/api/order-tracking?orderNumber=XYZ&emailOrPhone=abc@example.com');
  
    expect(res.statusCode).toBe(500); 
    expect(res.body.error || res.body.message).toMatch(/server error/i);
  
    pool.query = originalQuery; 
  });
});
