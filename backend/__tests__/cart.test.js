import request from 'supertest';
import app from '../server.js';
import { pool } from '../server.js';

describe('Cart Routes', () => {
  const testUser = {
    email: 'cartuser@example.com',
    password: 'test1234'
  };

  let token = '';
  let productId = null;
  let cartItemId = null;

  beforeAll(async () => {
    await pool.query(`DELETE FROM users WHERE email = $1`, [testUser.email]);

    const registerRes = await request(app).post('/registerUser').send(testUser);
    token = registerRes.body.token;

    const productRes = await pool.query(
      `INSERT INTO products (name, price, category, description, rating, size, color, stock, active)
       VALUES ('Test Product', 10.0, 'test', 'test product desc', 4.5, 'One Size', 'Red', 100, true)
       RETURNING id`
    );
    productId = productRes.rows[0].id;
  });

  afterAll(async () => {
    await pool.query('DELETE FROM cart_items WHERE user_id = (SELECT id FROM users WHERE email = $1)', [testUser.email]);
    await pool.query('DELETE FROM users WHERE email = $1', [testUser.email]);
    await pool.query('DELETE FROM products WHERE id = $1', [productId]);
    await pool.end();
  });

  test('GET /cart returns empty initially', async () => {
    const res = await request(app)
      .get('/cart')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.cartItems).toEqual([]);
  });

  test('POST /cart adds new item', async () => {
    const res = await request(app)
      .post('/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ product_id: productId, quantity: 2 });
    expect(res.statusCode).toBe(201);
    expect(res.body.cartItem).toBeDefined();
    expect(res.body.cartItem.quantity).toBe(2);
    cartItemId = res.body.cartItem.id;
  });

  test('POST /cart adds same item (updates quantity)', async () => {
    const res = await request(app)
      .post('/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ product_id: productId, quantity: 3 });
    expect(res.statusCode).toBe(200);
    expect(res.body.cartItem.quantity).toBe(5); // 2 + 3
  });

  test('POST /cart fails with invalid quantity', async () => {
    const res = await request(app)
      .post('/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ product_id: productId, quantity: 0 });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/quantity/i);
  });

  test('POST /cart fails with missing product_id', async () => {
    const res = await request(app)
      .post('/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 1 });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/Product ID/i);
  });

  test('PUT /cart/:itemId updates quantity', async () => {
    const res = await request(app)
      .put(`/cart/${cartItemId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 10 });
    expect(res.statusCode).toBe(200);
    expect(res.body.cartItem.quantity).toBe(10);
  });

  test('PUT /cart/:itemId fails with bad quantity', async () => {
    const res = await request(app)
      .put(`/cart/${cartItemId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 0 });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/quantity/i);
  });

  test('PUT /cart/:itemId fails with invalid item ID', async () => {
    const res = await request(app)
      .put(`/cart/999999`)
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 1 });
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toMatch(/Cart item not found/i);
  });

  test('DELETE /cart/:itemId removes the item', async () => {
    const res = await request(app)
      .delete(`/cart/${cartItemId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/removed/i);
  });

  test('DELETE /cart/:itemId fails with invalid ID', async () => {
    const res = await request(app)
      .delete(`/cart/9999999`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toMatch(/not authorized/i);
  });

  test('DELETE /cart clears all items', async () => {
    await request(app)
      .post('/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ product_id: productId, quantity: 1 });

    const res = await request(app)
      .delete('/cart')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.itemsRemoved).toBeGreaterThan(0);
  });
});
