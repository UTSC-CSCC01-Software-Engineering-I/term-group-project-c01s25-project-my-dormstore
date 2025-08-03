import jwt from 'jsonwebtoken';
import request from 'supertest';
import { app, pool } from '../server.js';
import { jest } from '@jest/globals';


let token;
let pkgId;
let existingItemId;


beforeAll(async () => {
  const res = await request(app)
    .post('/registerUser')
    .send({
      email: `testuser${Date.now()}@example.com`, 
      password: 'password123'
    });
  token = res.body.token;

  const packageRes = await pool.query(`
    INSERT INTO packages (name, description, price, stock, category, active)
    VALUES ('Coverage Package', 'Test coverage', 10, 10, 'Test', true)
    RETURNING id
  `);
  pkgId = packageRes.rows[0].id;

  const addRes = await request(app)
    .post('/package-cart')
    .set('Authorization', `Bearer ${token}`)
    .send({
      package_id: pkgId,
      quantity: 1
    });
  
  existingItemId = addRes.body.cartItem.id; 
});

afterAll(async () => {
  await pool.query('DELETE FROM package_cart_items WHERE package_id = $1', [pkgId]);
  await pool.query('DELETE FROM packages WHERE id = $1', [pkgId]);
  await pool.end();
});

describe('POST /package-cart', () => {

  test('POST /package-cart adds item', async () => {
    const res = await request(app)
      .post('/package-cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ package_id: pkgId, quantity: 1 });
  
    expect(res.statusCode).toBe(200);
    expect(res.body.cartItem.package_id).toBe(pkgId);
  
    existingItemId = res.body.cartItem.id;
    console.log('Item ID after POST:', existingItemId);
  });

  test('400 if package_id is missing', async () => {
    const res = await request(app)
      .post('/package-cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 1 });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/Package ID is required/i);
  });

  test('400 if quantity < 1', async () => {
    const res = await request(app)
      .post('/package-cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ package_id: pkgId, quantity: 0 });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/Quantity must be at least 1/i);
  });

  test('401 if token is invalid', async () => {
    const res = await request(app)
      .post('/package-cart')
      .set('Authorization', 'Bearer invalidtoken123')
      .send({ package_id: pkgId, quantity: 1 });

    expect(res.statusCode).toBe(401);
  });

  test('201 if adding new package to cart', async () => {
    const res = await request(app)
      .post('/package-cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ package_id: pkgId, quantity: 1 });

      expect(res.statusCode).toBe(200);     
      expect(res.body.message).toMatch(/(added|updated)/i);
      expect(res.body.cartItem.package_id).toBe(pkgId);
  });

  test('200 if updating existing package cart item', async () => {
    const res = await request(app)
      .post('/package-cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ package_id: pkgId, quantity: 1 });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/updated/i);
    expect(res.body.cartItem.package_id).toBe(pkgId);
  });
  test('PUT /package-cart/:itemId updates quantity', async () => {
    const res = await request(app)
      .put(`/package-cart/${existingItemId}`) 
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 3 });
  
    expect(res.statusCode).toBe(200);
    expect(res.body.cartItem.quantity).toBe(3);
  });
  
  test('DELETE /package-cart/:itemId removes item', async () => {
    const res = await request(app)
      .delete(`/package-cart/${existingItemId}`)
      .set('Authorization', `Bearer ${token}`);
  
    expect(res.statusCode).toBe(200);
    expect(res.body.removedItem.id).toBe(existingItemId);
  });
});
describe('DELETE /package-cart - simulate DB error', () => {
  test('should return 500 on DB failure', async () => {
    const token = jwt.sign({ userId: 123 }, process.env.JWT_SECRET || 'test_secret');

    const originalQuery = pool.query;
    pool.query = jest.fn(() => {
      throw new Error('Simulated DB error');
    });

    const res = await request(app)
      .delete('/package-cart')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toMatch(/failed to clear package cart/i);

    pool.query = originalQuery; 
  });
});

describe('DELETE /package-cart/item/:id - simulate DB error', () => {
  let validItemId;

  beforeAll(async () => {
    const createRes = await request(app)
      .post('/package-cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ package_id: pkgId, quantity: 1 });

    validItemId = createRes.body.cartItem.id;
  });

  test('should return 500 on DB failure', async () => {
    const originalQuery = pool.query;
    pool.query = jest.fn(() => {
      throw new Error('Simulated DB failure');
    });

    const res = await request(app)
      .delete(`/package-cart/${validItemId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toMatch(/failed to remove package/i);

    pool.query = originalQuery;
  });
});
describe('PUT /package-cart/:itemId - simulate DB error', () => {
  let validItemId;

  beforeAll(async () => {
    const createRes = await request(app)
      .post('/package-cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ package_id: pkgId, quantity: 1 });

    validItemId = createRes.body.cartItem.id;
  });

  test('should return 500 on DB failure', async () => {
    const originalQuery = pool.query;
    const originalConsoleError = console.error;
    console.error = jest.fn();
    pool.query = jest.fn(() => {
      throw new Error('Simulated DB failure');
    });

    const res = await request(app)
      .put(`/package-cart/${validItemId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 2 });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toMatch(/failed to update package cart item/i);

    pool.query = originalQuery;
    console.error = originalConsoleError;
  });
});