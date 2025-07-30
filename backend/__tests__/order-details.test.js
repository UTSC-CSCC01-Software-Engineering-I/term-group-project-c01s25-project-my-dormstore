import request from 'supertest';
import app, { pool } from '../server.js';

describe('Order Details Endpoint', () => {
  const user = {
    email: 'orderuser@example.com',
    password: 'securepass'
  };

  let token = '';
  let userId = '';
  let productId;
  let orderNumber;

  // ✅ Define basePayload at the top-level scope
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
    await pool.query(`DELETE FROM users WHERE email = $1`, [user.email]);

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
