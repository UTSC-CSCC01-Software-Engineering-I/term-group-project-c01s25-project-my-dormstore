import jwt from 'jsonwebtoken';
import request from 'supertest';
import app from '../server.js';
import { pool } from '../server.js';
import { jest } from '@jest/globals';

let testUserId;
let testToken;
let testOrderIds = [];

beforeAll(async () => {
  await pool.query(`
  DELETE FROM orders WHERE user_id = (
    SELECT id FROM users WHERE email = 'revenueuser@example.com'
  )
`);
await pool.query(`DELETE FROM users WHERE email = 'revenueuser@example.com'`);
  const userRes = await pool.query(
    `INSERT INTO users (email, password, first_name, last_name)
     VALUES ('revenueuser@example.com', 'pass123', 'Revenue', 'User')
     RETURNING id`
  );
  testUserId = userRes.rows[0].id;

  const mockUser = { userId: testUserId, role: 'admin' };
  testToken = `Bearer ${jwt.sign(mockUser, process.env.JWT_SECRET, { expiresIn: '1h' })}`;
  const ranges = [1, 10, 200]; 
  for (const days of ranges) {
    const res = await pool.query(
      `INSERT INTO orders (
        user_id, order_number, order_status, email,
        first_name, last_name, address, phone, city, province, postal_code, subtotal, tax, shipping, total, created_at
       ) VALUES (
         $1, $2, 'Paid', 'revenueuser@example.com',
         'Revenue', 'User', '123 Lane', '555-0000', 'Testville', 'ON', 'A1A1A1', '99.99', '11.11', '11.11', '122.21'
         , CURRENT_DATE - $3 * INTERVAL '1 day'
       ) RETURNING id`,
      [testUserId, `REV${days}`, days]
    );
    testOrderIds.push(res.rows[0].id);
  }
});

afterAll(async () => {
  for (const id of testOrderIds) {
    await pool.query(`DELETE FROM orders WHERE id = $1`, [id]);
  }
  await pool.query(`DELETE FROM users WHERE id = $1`, [testUserId]);
  await pool.end();
});

describe('GET /api/admin/revenue', () => {
  it('should return revenue data for range 7', async () => {
    const res = await request(app)
      .get('/api/admin/revenue?range=7')
      .set('Authorization', testToken);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('totalRevenue');
    expect(res.body).toHaveProperty('totalOrders');
    expect(res.body).toHaveProperty('averageOrderValue');
    expect(res.body.timeRange).toBe("7");
  });

  it('should return revenue data for range 30', async () => {
    const res = await request(app)
      .get('/api/admin/revenue?range=30')
      .set('Authorization', testToken);

    expect(res.statusCode).toBe(200);
    expect(res.body.timeRange).toBe("30");
  });

  it('should return revenue data for range 365', async () => {
    const res = await request(app)
      .get('/api/admin/revenue?range=365')
      .set('Authorization', testToken);

    expect(res.statusCode).toBe(200);
    expect(res.body.timeRange).toBe("365");
  });

  it('should return data with default range when range is missing', async () => {
    const res = await request(app)
      .get('/api/admin/revenue')
      .set('Authorization', testToken);

    expect(res.statusCode).toBe(200);
    expect(res.body.timeRange).toBeUndefined(); 
  });

  it('should return 500 on DB failure', async () => {
    const originalQuery = pool.query;
    const originalConsoleError = console.error;
    console.error = jest.fn();
    pool.query = jest.fn(() => {
      throw new Error('Simulated DB error');
    });

    const res = await request(app)
      .get('/api/admin/revenue?range=7')
      .set('Authorization', testToken);

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toMatch(/failed to fetch/i);

    pool.query = originalQuery;
    console.error = originalConsoleError;
  });
});
