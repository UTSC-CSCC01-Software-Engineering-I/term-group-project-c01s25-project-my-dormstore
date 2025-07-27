import request from 'supertest';
import app from '../server.js';
import { pool } from '../server.js';

describe('Orders Routes', () => {
  const testUser = {
    email: 'orderuser@example.com',
    password: 'order123'
  };

  let token = '';
  let productId = null;
  let orderId = null;
  let orderNumber = '';

  beforeAll(async () => {
    await pool.query(`DELETE FROM users WHERE email = $1`, [testUser.email]);

    const registerRes = await request(app).post('/registerUser').send(testUser);
    token = registerRes.body.token;

    const userRes = await request(app).get('/me').set('Authorization', `Bearer ${token}`);
    const userId = userRes.body.id;

    await pool.query(`
      INSERT INTO user_balance (user_id, balance, total_spent)
      VALUES ($1, 1000, 0)
      ON CONFLICT (user_id) DO NOTHING
    `, [userId]);

    const result = await pool.query(
      `INSERT INTO products (name, price, category, description, rating, size, color, stock, active)
       VALUES ('Order Product', 25.0, 'Test', 'Order test product', 4.5, 'M', 'Blue', 20, true)
       RETURNING id`
    );
    productId = result.rows[0].id;

    await request(app)
      .post('/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ product_id: productId, quantity: 2 });
  });

  afterAll(async () => {
    if (orderId) await pool.query('DELETE FROM orders WHERE id = $1', [orderId]);
    await pool.query('DELETE FROM products WHERE id = $1', [productId]);
    await pool.query('DELETE FROM users WHERE email = $1', [testUser.email]);
    await pool.end();
  });

  test('Create order (POST /api/orders)', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: testUser.email,
        firstName: 'Order',
        lastName: 'User',
        phone: '123-456-7890',
        address: '123 Order St',
        city: 'Testville',
        province: 'ON',
        postalCode: 'A1A1A1',
        moveInDate: '2025-09-01',
        paymentMethod: 'Balance',
        subtotal: 50,
        tax: 6.5,
        shipping: 5,
        shippingMethod: 'Standard',
        shippingCost: 5,
        total: 61.5,
        billingAddress: {
          firstName: 'Bill',
          lastName: 'User',
          address: '123 Bill St',
          city: 'Billtown',
          province: 'ON',
          postalCode: 'B2B2B2'
        }
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.order).toBeDefined();
    orderId = res.body.order.id;
    orderNumber = res.body.order.orderNumber;
  });

  test('Create order with missing fields', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        // Missing required address fields
        email: testUser.email,
        firstName: 'John',
        lastName: 'Doe'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/Missing required fields/i);
  });

  test('Create order with insufficient balance', async () => {
    // Add expensive product
    const productRes = await pool.query(
      `INSERT INTO products (name, price, category, description, rating, size, color, stock, active)
       VALUES ('Expensive Product', 9999.99, 'Test', 'Too expensive', 5, 'XL', 'Gold', 5, true)
       RETURNING id`
    );

    const expensiveProductId = productRes.rows[0].id;

    await request(app)
      .post('/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ product_id: expensiveProductId, quantity: 1 });

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: testUser.email,
        firstName: 'Rich',
        lastName: 'User',
        phone: '000-000-0000',
        address: '1 Money Lane',
        city: 'Richville',
        province: 'ON',
        postalCode: 'X1X1X1',
        moveInDate: '2025-09-01',
        paymentMethod: 'Balance',
        subtotal: 9999.99,
        tax: 100,
        shipping: 10,
        shippingMethod: 'Gold Delivery',
        shippingCost: 10,
        total: 10109.99,
        billingAddress: {
          firstName: 'Rich',
          lastName: 'User',
          address: '1 Money Lane',
          city: 'Richville',
          province: 'ON',
          postalCode: 'X1X1X1'
        }
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/Insufficient funds/i);

    await pool.query('DELETE FROM products WHERE id = $1', [expensiveProductId]);
  });

  test('Fetch order by ID (GET /api/orders/:id)', async () => {
    const res = await request(app)
      .get(`/api/orders/${orderId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.order.items.length).toBeGreaterThan(0);
  });

  test('Fetch order with wrong user (unauthorized)', async () => {
    const res = await request(app)
      .get(`/api/orders/999999`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
  });

  test('GET /api/order-details/:orderNumber', async () => {
    const res = await request(app)
      .get(`/api/order-details/${orderNumber}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.order.items.length).toBeGreaterThan(0);
  });

  test('GET /api/order-tracking success', async () => {
    const res = await request(app)
      .get(`/api/order-tracking?orderNumber=${orderNumber}&emailOrPhone=${testUser.email}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.email).toBe(testUser.email);
  });

  test('GET /api/order-tracking invalid info', async () => {
    const res = await request(app)
      .get(`/api/order-tracking?orderNumber=WRONG123&emailOrPhone=wrong@example.com`);

    expect(res.statusCode).toBe(404);
  });

  test('GET /api/order-history for user', async () => {
    const res = await request(app)
      .get('/api/order-history')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.orders.length).toBeGreaterThan(0);
  });
});
