import request from 'supertest';
import { app, pool } from '../server.js';
import { jest } from '@jest/globals';


let testOrderNumber = `TEST-${Date.now()}`;
let testEmail = 'testuser@example.com';

beforeAll(async () => {
  await pool.query(`DELETE FROM order_updates WHERE order_number = $1 AND email = $2`, [testOrderNumber, testEmail]);
});

afterAll(async () => {
  await pool.query(`DELETE FROM order_updates WHERE order_number = $1 AND email = $2`, [testOrderNumber, testEmail]);
  await pool.end();
});

describe('POST /api/admin/order-updates', () => {
  test('400 if required fields are missing', async () => {
    const res = await request(app).post('/api/admin/order-updates').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/missing required fields/i);
  });

  test('200 if update is saved', async () => {
    const res = await request(app).post('/api/admin/order-updates').send({
      orderNumber: testOrderNumber,
      email: testEmail,
      update: 'Order packed and ready to ship.'
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/update saved/i);
  });
});

describe('GET /api/order-updates', () => {
  test('400 if missing query params', async () => {
    const res = await request(app).get('/api/order-updates');
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/missing order number or email/i);
  });

  test('200 and returns updates array', async () => {
    const res = await request(app)
      .get('/api/order-updates')
      .query({ orderNumber: testOrderNumber, email: testEmail });

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.updates)).toBe(true);
    expect(res.body.updates.length).toBeGreaterThanOrEqual(1);
  });
});

describe('GET /api/admin/all-order-updates', () => {
  test('200 and returns all updates', async () => {
    const res = await request(app).get('/api/admin/all-order-updates');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('PATCH /api/admin/update-status', () => {
  let insertedId;

  beforeAll(async () => {
    const insert = await pool.query(
      `INSERT INTO order_updates (order_number, email, update_text) VALUES ($1, $2, $3) RETURNING id`,
      ['TEST-ORDER', 'test@example.com', 'Initial update']
    );
    insertedId = insert.rows[0].id;
  });

  afterAll(async () => {
    await pool.query(`DELETE FROM order_updates WHERE id = $1`, [insertedId]);
  });

  test('400 if id or status missing', async () => {
    const res = await request(app).patch('/api/admin/update-status').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/missing id or status/i);
  });

  test('200 if update successful', async () => {
    const res = await request(app).patch('/api/admin/update-status').send({
      id: insertedId,
      status: 'shipped'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/updated successfully/i);
  });
  test('PATCH /api/admin/update-status - simulate DB failure', async () => {
    const originalQuery = pool.query;
    const originalConsoleError = console.error;
    console.error = jest.fn();
    pool.query = jest.fn(() => {
      throw new Error('Simulated update failure');
    });

    const res = await request(app)
      .patch('/api/admin/update-status')
      .send({ id: 1, status: 'shipped' });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toMatch(/failed to update status/i);

    pool.query = originalQuery;
    console.error = originalConsoleError; 
  });
});

describe('GET /api/order-updates - simulate DB error', () => {
  test('should return 500 when DB fails', async () => {
    const originalQuery = pool.query;
    const originalConsoleError = console.error;
    console.error = jest.fn();
    pool.query = jest.fn(() => {
      throw new Error('Simulated DB failure');
    });

    const res = await request(app).get('/api/order-updates')
      .query({ orderNumber: '123', email: 'ashley@example.com' });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toMatch(/fetch updates/i);

    pool.query = originalQuery;
    console.error = originalConsoleError; 
  });
});

describe('GET /api/admin/all-order-updates - simulate DB error', () => {
  test('should return 500 when DB fails', async () => {
    const originalQuery = pool.query;
    const originalConsoleError = console.error;
    console.error = jest.fn();

    pool.query = jest.fn(() => {
      throw new Error('Simulated DB error');
    });

    const res = await request(app).get('/api/admin/all-order-updates');

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toMatch(/fetch order updates/i);

    pool.query = originalQuery;
    console.error = originalConsoleError;
  });
});
describe('POST /api/admin/order-updates - simulate DB insert error', () => {
  test('should return 500 when DB insert fails', async () => {
    const originalQuery = pool.query;
    const originalConsoleError = console.error;
    console.error = jest.fn();
    pool.query = jest.fn(() => {
      throw new Error('Simulated insert failure');
    });

    const res = await request(app)
      .post('/api/admin/order-updates')
      .send({
        orderNumber: 'TEST123',
        email: 'test@example.com',
        update: 'This is a test update.'
      });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toMatch(/database error/i);

    pool.query = originalQuery; 
    console.error = originalConsoleError;
  });
});