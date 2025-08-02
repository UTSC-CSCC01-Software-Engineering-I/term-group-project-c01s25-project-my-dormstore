import request from 'supertest';
import app, { pool } from '../server.js';

describe('Checkout Endpoint', () => {
  const user = {
    email: 'checkoutuser@example.com',
    password: 'securepass'
  };

  let token = '';
  let userId = '';
  let productId;
  let packageId;

  beforeAll(async () => {
    const userRes = await pool.query(`SELECT id FROM users WHERE email = $1`, [user.email]);
    if (userRes.rows.length > 0) {
      const tempUserId = userRes.rows[0].id;
    
      await pool.query(`DELETE FROM order_packages WHERE order_id IN (SELECT id FROM orders WHERE user_id = $1)`, [tempUserId]);
      await pool.query(`DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE user_id = $1)`, [tempUserId]);
      await pool.query(`DELETE FROM orders WHERE user_id = $1`, [tempUserId]);
      await pool.query(`DELETE FROM user_balance WHERE user_id = $1`, [tempUserId]);
      await pool.query(`DELETE FROM users WHERE id = $1`, [tempUserId]);
    }
  
    const res = await request(app).post('/registerUser').send(user);
    token = res.body.token;
  
    const newUserRes = await pool.query('SELECT id FROM users WHERE email = $1', [user.email]);
    userId = newUserRes.rows[0].id;
  
    await pool.query(`
      INSERT INTO user_balance (user_id, balance, total_spent)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id) DO UPDATE SET balance = EXCLUDED.balance
    `, [userId, 1000, 0]);
  
    const prodRes = await pool.query(`
      INSERT INTO products (name, price, category, description, rating, size, color, stock, active)
      VALUES ('Test Prod', 50.0, 'Testing', 'desc', 4, 'One Size', 'Black', 100, true)
      RETURNING id
    `);
    productId = prodRes.rows[0].id;
  
    const packRes = await pool.query(`
      INSERT INTO packages (name, price, category, description, rating, size, color)
      VALUES ('Test Pack', 100.0, 'Testing', 'desc', 5, 'One Size', 'Blue')
      RETURNING id
    `);
    packageId = packRes.rows[0].id;
  });
  

  afterAll(async () => {
    if (userId) {
      await pool.query(`DELETE FROM order_packages WHERE order_id IN (SELECT id FROM orders WHERE user_id = $1)`, [userId]);
      await pool.query(`DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE user_id = $1)`, [userId]);
      await pool.query(`DELETE FROM orders WHERE user_id = $1`, [userId]);
      await pool.query(`DELETE FROM user_balance WHERE user_id = $1`, [userId]);
      await pool.query(`DELETE FROM users WHERE id = $1`, [userId]);
    }
  
    if (productId) {
      await pool.query(`DELETE FROM products WHERE id = $1`, [productId]);
    }
  
    if (packageId) {
      await pool.query(`DELETE FROM packages WHERE id = $1`, [packageId]);
    }
  
    await pool.end();
  });

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
    subtotal: 150.0,
    tax: 15.0,
    shipping: 10.0,
    shippingMethod: "Standard",
    shippingCost: 10.0,
    total: 175.0,
    billingAddress: "123 Billing St"
  };

  test('Create order with products only', async () => {
    const payload = {
      ...basePayload,
      cartItems: [{
        item_type: 'product',
        product_id: productId,
        quantity: 2,
        selected_size: "One Size",
        selected_color: "Black"
      }]
    };

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toMatch(/order created successfully/i);
    expect(res.body.order).toBeDefined();
    });

  test('Create order with packages only', async () => {
    const payload = {
      ...basePayload,
      cartItems: [{
        item_type: 'package',
        package_id: packageId,
        quantity: 1
      }]
    };

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toMatch(/order created successfully/i);
    expect(res.body.order).toBeDefined();
  });

  test('Fail if user.balance < total', async () => {
    // Set user's balance to $50
    await pool.query(`
      UPDATE user_balance 
      SET balance = 50.0, total_spent = 0.0 
      WHERE user_id = $1`, 
      [userId]
    );
  
    const payload = {
      ...basePayload,
      cartItems: [{
        item_type: 'product',
        product_id: productId,
        quantity: 1,
        selected_size: "One Size",
        selected_color: "Black"
      }],
      total: 9999 // Force it to be way higher than balance
    };
  
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);
  
    console.log("Balance fail test response:", res.body);
  
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/insufficient/i);
  });
});
