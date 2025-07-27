import request from 'supertest';
import app from '../server.js';
import { pool } from '../server.js';

describe('Package Routes', () => {
  const admin = {
    email: 'admin@example.com',
    password: 'admin123'
  };

  let token = '';
  let productId = null;
  let packageId = null;

  beforeAll(async () => {
    await pool.query(
      `INSERT INTO admin_users (email, password)
       VALUES ($1, $2)
       ON CONFLICT (email) DO NOTHING`,
      [admin.email, admin.password]
    );

    const res = await request(app).post('/api/admin/login').send(admin);
    token = res.body.token;

    const prodRes = await pool.query(
      `INSERT INTO products (name, price, category, description, rating, size, color, stock, active)
       VALUES ('Package Product', 15.0, 'Test', 'For package', 4.0, 'One Size', 'Blue', 50, true)
       RETURNING id`
    );
    productId = prodRes.rows[0].id;
  });

  afterAll(async () => {
    if (packageId) await pool.query('DELETE FROM packages WHERE id = $1', [packageId]);
    await pool.query('DELETE FROM products WHERE id = $1', [productId]);
    await pool.end();
  });

  test('POST /api/admin/packages creates a new package with items', async () => {
    const res = await request(app)
      .post('/api/admin/packages')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Package',
        price: 99.99,
        category: 'Test',
        description: 'A sample package',
        image_url: 'http://example.com/package.jpg',
        rating: 4.5,
        size: 'Standard',
        color: 'Mixed',
        stock: 5,
        active: true,
        items: [{ product_id: productId, quantity: 2 }]
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Test Package');
    packageId = res.body.id;
  });

  test('GET /api/packages returns list', async () => {
    const res = await request(app).get('/api/packages');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.packages)).toBe(true);
  });

  test('GET /api/packages/:id returns a package', async () => {
    const res = await request(app).get(`/api/packages/${packageId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBeDefined();
  });

  test('GET /api/packages/:id with invalid ID returns 404', async () => {
    const res = await request(app).get(`/api/packages/9999999`);
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });

  test('GET /api/packages/:id/details includes items or fallback', async () => {
    const res = await request(app).get(`/api/packages/${packageId}/details`);
    expect(res.statusCode).toBe(200);
    expect(res.body.package).toBeDefined();
    expect(Array.isArray(res.body.package.included_products)).toBe(true);
  });

  test('PUT /api/admin/packages/:id updates name and items', async () => {
    const res = await request(app)
      .put(`/api/admin/packages/${packageId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Updated Package Name',
        price: 79.99,
        category: 'Test',
        description: 'Updated',
        image_url: 'http://example.com/updated.jpg',
        rating: 4.8,
        size: 'Large',
        color: 'Green',
        stock: 3,
        active: true,
        items: [{ product_id: productId, quantity: 1 }]
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Updated Package Name');
  });

  test('PUT /api/admin/packages/:id with malformed items fails', async () => {
    const res = await request(app)
      .put(`/api/admin/packages/${packageId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Broken Package',
        items: [{ quantity: 2 }] 
      });

    expect(res.statusCode).toBe(500); 
    expect(res.body.error).toBeDefined();
  });

  test('DELETE /api/admin/packages/:id removes the package', async () => {
    const res = await request(app)
      .delete(`/api/admin/packages/${packageId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
    packageId = null; 
  });
});
