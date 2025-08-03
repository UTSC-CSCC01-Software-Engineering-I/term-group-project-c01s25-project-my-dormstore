import request from 'supertest';
import { app, pool } from '../server.js';
import { jest } from '@jest/globals';


describe('GET /api/admin/order_items', () => {
    let testUserId;
    let testOrderId;

    beforeAll(async () => {
        const userRes = await pool.query(
          `INSERT INTO users (email, password, first_name, last_name)
           VALUES ('testuser@example.com', 'hashedpassword', 'Test', 'User')
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
        await pool.query(
          `INSERT INTO order_items (
             order_id, product_id, product_name, product_price, quantity, subtotal
           )
           VALUES ($1, 1, 'Test Product', 10.00, 2, 20.00)`,
          [testOrderId]
        );
      });
      
      afterAll(async () => {
        await pool.query(`DELETE FROM order_items WHERE order_id = $1`, [testOrderId]);
        await pool.query(`DELETE FROM orders WHERE id = $1`, [testOrderId]);
        await pool.query(`DELETE FROM users WHERE id = $1`, [testUserId]);
        await pool.end();
      });
      
  it('should return 400 if order_id is missing', async () => {
    const res = await request(app).get('/api/admin/order_items');
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/missing order_id/i);
  });

  it('should return order_items for a valid order_id', async () => {
    const res = await request(app)
      .get('/api/admin/order_items')
      .query({ order_id: testOrderId });

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('product_id');
    expect(res.body[0]).toHaveProperty('product_name');
    expect(res.body[0].quantity).toBe(2);
  });

  it('should return empty array for non-existent order_id', async () => {
    const res = await request(app)
      .get('/api/admin/order_items')
      .query({ order_id: 999999 });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('should return 500 on DB failure', async () => {
    const originalQuery = pool.query;
    const originalConsoleError = console.error;
    console.error = jest.fn();
    pool.query = jest.fn(() => {
      throw new Error('Simulated DB failure');
    });

    const res = await request(app)
      .get('/api/admin/order_items')
      .query({ order_id: testOrderId });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toMatch(/database error/i);

    pool.query = originalQuery; 
    console.error = originalConsoleError;
  });
});
