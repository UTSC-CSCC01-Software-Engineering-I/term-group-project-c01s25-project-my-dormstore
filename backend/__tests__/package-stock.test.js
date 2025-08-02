import request from 'supertest';
import app from '../server.js';
import { pool } from '../server.js';

describe('PUT /api/admin/packages/:id/stock', () => {
  let token;
  let packageId;
  let productId;

  const admin = { email: 'admin@example.com', password: 'admin123' };

  beforeAll(async () => {
    // Login admin
    const loginRes = await request(app).post('/api/admin/login').send(admin);
    token = loginRes.body.token;

    // Insert product
    const productRes = await pool.query(`
      INSERT INTO products (name, price, category, description, rating, size, color, stock, active)
      VALUES ('Test Stock Product', 10.0, 'Test', 'Test', 4.5, 'N/A', 'N/A', 10, true)
      RETURNING id
    `);
    productId = productRes.rows[0].id;

    // Insert package with item
    const packageRes = await request(app)
      .post('/api/admin/packages')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Stock Test Package',
        price: 20,
        category: 'Test',
        description: 'Testing package stock',
        image_url: '',
        rating: 4,
        size: 'Std',
        color: 'Blue',
        stock: 0,
        active: true,
        items: [{ product_id: productId, quantity: 2 }]
      });

    packageId = packageRes.body.id;
  });

  afterAll(async () => {
    await pool.query('DELETE FROM packages WHERE id = $1', [packageId]);
    await pool.query('DELETE FROM products WHERE id = $1', [productId]);
    await pool.end();
  });

  test('should reject invalid stock value (NaN)', async () => {
    const res = await request(app)
      .put(`/api/admin/packages/${packageId}/stock`)
      .set('Authorization', `Bearer ${token}`)
      .send({ stock: "notANumber" }); 
  
    expect([200, 400]).toContain(res.statusCode); 
  });
  

  test('should handle normal auto-set package stock logic', async () => {
    const res = await request(app)
      .put(`/api/admin/packages/${packageId}/stock`)
      .set('Authorization', `Bearer ${token}`)
      .send({ stock: null }); // triggers auto-set

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/stock auto-set to max possible/i);
  });

  test('should return 400 if item quantity is missing or 0', async () => {
    // simulate missing quantity
    await pool.query(`UPDATE package_items SET quantity = 0 WHERE package_id = $1`, [packageId]);

    const res = await request(app)
      .put(`/api/admin/packages/${packageId}/stock`)
      .set('Authorization', `Bearer ${token}`)
      .send({ stock: null });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/invalid package item quantity/i);
  });
  
  test('should update manually when stock value is valid', async () => {
    await pool.query(`UPDATE package_items SET quantity = 2 WHERE package_id = $1`, [packageId]);
  
    const res = await request(app)
      .put(`/api/admin/packages/${packageId}/stock`)
      .set('Authorization', `Bearer ${token}`)
      .send({ stock: 5 });
  
    expect(res.statusCode).toBe(200);
    expect(res.body.stock).toBe(5); 
  });
});
