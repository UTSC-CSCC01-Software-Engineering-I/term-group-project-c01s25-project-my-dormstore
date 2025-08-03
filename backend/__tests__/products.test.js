import request from 'supertest';
import { app, pool } from '../server.js';
import { jest } from '@jest/globals';


describe('Products Routes', () => {
  const admin = {
    email: 'admin@example.com',
    password: 'admin123'
  };

  let token = '';
  let productId = null;

  const testProduct = {
    name: 'Test Product',
    price: 19.99,
    category: 'test',
    description: 'Test product description',
    image_url: 'http://example.com/image.jpg',
    size: 'One Size',
    color: 'Red',
    stock: 50,
    active: true
  };

  beforeAll(async () => {
    await pool.query(
      `INSERT INTO admin_users (email, password)
       VALUES ($1, $2)
       ON CONFLICT (email) DO NOTHING`,
      [admin.email, admin.password]
    );

    const res = await request(app).post('/api/admin/login').send(admin);
    token = res.body.token;
  });

  afterAll(async () => {
    if (productId) {
      await pool.query('DELETE FROM products WHERE id = $1', [productId]);
    }
    await pool.end();
  });

  test('POST /api/admin/products creates new product', async () => {
    const res = await request(app)
      .post('/api/admin/products')
      .set('Authorization', `Bearer ${token}`)
      .send(testProduct);

    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe(testProduct.name);
    productId = res.body.id;
  });

  test('GET /api/products returns all', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.products)).toBe(true);
  });

  test('GET /api/products?category returns filtered', async () => {
    const res = await request(app).get('/api/products').query({ category: 'Test' });
    expect(res.statusCode).toBe(200);
    expect(res.body.products.length).toBeGreaterThan(0);
  });

  test('GET /api/products/:id returns one product', async () => {
    const res = await request(app).get(`/api/products/${productId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.product.name).toBe(testProduct.name);
  });

  test('GET /api/products/:id returns 404 for bad ID', async () => {
    const res = await request(app).get('/api/products/9999999');
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });

  test('PUT /api/admin/products/:id updates product', async () => {
    const res = await request(app)
      .put(`/api/admin/products/${productId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ ...testProduct, name: 'Updated Product Name' });

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Updated Product Name');
  });

  test('PUT /api/admin/products/:id returns 404 for bad ID', async () => {
    const res = await request(app)
      .put('/api/admin/products/9999999')
      .set('Authorization', `Bearer ${token}`)
      .send(testProduct);

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });

  test('DELETE /api/admin/products/:id removes product', async () => {
    const res = await request(app)
      .delete(`/api/admin/products/${productId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
    productId = null; 
  });

  test('DELETE /api/admin/products/:id fails on nonexistent ID', async () => {
    const res = await request(app)
      .delete('/api/admin/products/999999')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });
  test('GET /api/products/:id - should return 500 on DB failure', async () => {
    const originalQuery = pool.query;
    const originalConsoleError = console.error;
    console.error = jest.fn();
    pool.query = jest.fn(() => {
      throw new Error('Simulated DB failure');
    });

    const res = await request(app).get('/api/products/123');

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toMatch(/failed to fetch product/i);

    pool.query = originalQuery;
    console.error = originalConsoleError;
  });
  test('GET /api/products - should return 500 on DB failure', async () => {
    const originalQuery = pool.query;
    const originalConsoleError = console.error;
    console.error = jest.fn();
    pool.query = jest.fn(() => {
      throw new Error('Simulated DB failure');
    });

    const res = await request(app).get('/api/products');

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toMatch(/failed to fetch products/i);

    pool.query = originalQuery;
    console.error = originalConsoleError;
  });
});
