import request from 'supertest';
import app from '../server.js';
import { pool } from '../server.js';
import { jest } from '@jest/globals';

let testUserId;
let testOrderId;

beforeAll(async () => {
  const userRes = await pool.query(
    `INSERT INTO users (email, password, first_name, last_name)
     VALUES ('statususer@example.com', 'test123', 'Status', 'User')
     RETURNING id`
  );
  testUserId = userRes.rows[0].id;

  const orderRes = await pool.query(
    `INSERT INTO orders (
        user_id, order_number, order_status, email,
        first_name, last_name, address, phone, city, province, postal_code, subtotal, tax, shipping, total
     )
     VALUES (
        $1, 'TEST123456', 'Pending', 'testuser@example.com',
        'Test', 'User', '123 Test St', '123-456-7890', 'Test City', 'ON', 'M1A1A1', '99.99', '11.11', '11.11', '122.21'
     )
     RETURNING id`,
    [testUserId]
  );
  testOrderId = orderRes.rows[0].id;
});

afterAll(async () => {
  await pool.query(`DELETE FROM orders WHERE id = $1`, [testOrderId]);
  await pool.query(`DELETE FROM users WHERE id = $1`, [testUserId]);
  await pool.end();
});

describe('PUT /api/admin/orders/:id/status', () => {
  it('should update order status successfully', async () => {
    const res = await request(app)
      .put(`/api/admin/orders/${testOrderId}/status`)
      .send({ order_status: 'Shipped' });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/order status updated/i);

    const check = await pool.query(
      `SELECT order_status FROM orders WHERE id = $1`,
      [testOrderId]
    );
    expect(check.rows[0].order_status).toBe('Shipped');
  });

  it('should return 400 if order ID or status is missing', async () => {
    const res1 = await request(app)
      .put(`/api/admin/orders//status`) 
      .send({ order_status: 'Delivered' });
    expect(res1.statusCode).toBe(404); 

    const res2 = await request(app)
      .put(`/api/admin/orders/${testOrderId}/status`)
      .send({}); 
    expect(res2.statusCode).toBe(400);
    expect(res2.body.error).toMatch(/missing order id or status/i);
  });

  it('should return 500 if DB fails', async () => {
    const originalQuery = pool.query;
    pool.query = jest.fn(() => {
      throw new Error('Simulated DB error');
    });

    const res = await request(app)
      .put(`/api/admin/orders/${testOrderId}/status`)
      .send({ order_status: 'Canceled' });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toMatch(/failed to update/i);

    pool.query = originalQuery;
  });
});
