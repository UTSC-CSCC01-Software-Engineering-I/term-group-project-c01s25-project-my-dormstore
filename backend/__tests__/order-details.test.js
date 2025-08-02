import request from 'supertest';
import app, { pool } from '../server.js';
import { jest } from '@jest/globals';


describe('Order Details Endpoint', () => {
  const user = {
    email: 'orderuser@example.com',
    password: 'securepass'
  };

  let token = '';
  let userId = '';
  let productId;
  let orderNumber;

  const basePayload = {
    email: user.email,
    firstName: "Test",
    lastName: "User",
    phone: "1234567890",
    address: "123 Test St",
    city: "Toronto",
    province: "ON",
    postalCode: "A1A1A1",
    moveInDate: "2025-08-01",
    paymentMethod: "credit_card",
    subtotal: 50.0,
    tax: 5.0,
    shipping: 5.0,
    shippingMethod: "Standard",
    shippingCost: 5.0,
    total: 60.0,
    billingAddress: {
      firstName: "Test",
      lastName: "User",
      address: "123 Billing St",
      city: "Toronto",
      province: "ON",
      postalCode: "A1A1A1"
    }
  };

  beforeAll(async () => {
    const cleanupRes = await pool.query('SELECT id FROM users WHERE email = $1', [user.email]);
    if (cleanupRes.rows.length > 0) {
      const existingUserId = cleanupRes.rows[0].id;
      await pool.query(`DELETE FROM order_packages WHERE order_id IN (SELECT id FROM orders WHERE user_id = $1)`, [existingUserId]);
      await pool.query(`DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE user_id = $1)`, [existingUserId]);
      await pool.query(`DELETE FROM orders WHERE user_id = $1`, [existingUserId]);
      await pool.query(`DELETE FROM user_balance WHERE user_id = $1`, [existingUserId]);
      await pool.query(`DELETE FROM users WHERE id = $1`, [existingUserId]);
    }

    const res = await request(app).post('/registerUser').send(user);
    token = res.body.token;

    const userRes = await pool.query(`SELECT id FROM users WHERE email = $1`, [user.email]);
    userId = userRes.rows[0].id;

    await pool.query(`
      INSERT INTO user_balance (user_id, balance, total_spent)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id) DO UPDATE SET balance = $2
    `, [userId, 1000, 0]);

    const prodRes = await pool.query(`
      INSERT INTO products (name, price, category, description, rating, size, color, stock, active)
      VALUES ('Detail Test Prod', 50.0, 'Testing', 'desc', 4, 'One Size', 'Black', 100, true)
      RETURNING id
    `);
    productId = prodRes.rows[0].id;

    const orderPayload = {
      ...basePayload,
      cartItems: [{
        item_type: 'product',
        product_id: productId,
        quantity: 1,
        selected_size: "One Size",
        selected_color: "Black"
      }]
    };

    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send(orderPayload);

    orderNumber = orderRes.body.order.orderNumber;
  });

  afterAll(async () => {
    const userRes = await pool.query('SELECT id FROM users WHERE email = $1', [user.email]);
if (userRes.rows.length > 0) {
  const oldUserId = userRes.rows[0].id;

  await pool.query(`DELETE FROM order_packages WHERE order_id IN (SELECT id FROM orders WHERE user_id = $1)`, [oldUserId]);
  await pool.query(`DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE user_id = $1)`, [oldUserId]);
  await pool.query(`DELETE FROM orders WHERE user_id = $1`, [oldUserId]);
  await pool.query(`DELETE FROM user_balance WHERE user_id = $1`, [oldUserId]);
  await pool.query(`DELETE FROM users WHERE id = $1`, [oldUserId]);
}
  });

  test('Valid order returns full data', async () => {
    const res = await request(app)
      .get(`/api/order-details/${orderNumber}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.order).toBeDefined();
    expect(res.body.order.order_number).toBe(orderNumber);
  });

  test('Unauthorized user gets rejected', async () => {
    const res = await request(app)
      .get(`/api/order-details/${orderNumber}`);

    expect(res.statusCode).toBe(401);
  });

  test('Invalid order number returns 404', async () => {
    const res = await request(app)
      .get(`/api/order-details/INVALID123`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
  });
});

describe('GET /api/order-details/:orderNumber - simulate DB error', () => {
  let testOrderNumber = `TEMP_ORDER_${Date.now()}`;
  let token = '';

  let userId;
beforeAll(async () => {
  await request(app)
  .post('/registerUser')
  .send({ email: 'test@example.com', password: 'testpass' });

// Then login
const loginRes = await request(app)
  .post('/loginUser')
  .send({ email: 'test@example.com', password: 'testpass' });

token = loginRes.body.token;

// Now get the ID
const emailParam = 'test@example.com';
const userRes = await pool.query(
  'SELECT id FROM users WHERE email = $1',
  [emailParam]
);
userId = userRes.rows[0].id;
const orderRes = await pool.query(`
INSERT INTO orders (
  user_id, order_number, email, first_name, last_name, phone,
  address, city, province, postal_code, move_in_date,
  subtotal, tax, shipping, total,
  shipping_method, payment_method, payment_status
)
VALUES (
  $1, $2, 'test@example.com', 'Test', 'User', '1234567890',
  '123 Test St', 'Toronto', 'ON', 'A1A1A1', CURRENT_DATE,
  100.00, 13.00, 10.00, 123.00,
  'Canada Post', 'Credit Card', 'pending'
)
RETURNING order_number
`, [userId, testOrderNumber]);
testOrderNumber = orderRes.rows[0].order_number;
  });
  afterAll(async () => {
    await pool.query(`DELETE FROM orders WHERE order_number = $1`, [testOrderNumber]);
  });

  test('should return 500 on DB failure', async () => {
    const originalQuery = pool.query;
    pool.query = jest.fn(() => {
      throw new Error('Simulated DB failure');
    });

    const res = await request(app)
      .get(`/api/order-details/${testOrderNumber}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toMatch(/failed to fetch order details/i);

    pool.query = originalQuery;
  });
});