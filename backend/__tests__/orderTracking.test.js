import request from 'supertest';
import app from '../server.js'; 
import { Pool } from 'pg';

const pool = new Pool({
    user: process.env.PG_USER,
    password: process.env.PG_PWD,
    host: process.env.PG_HOST,
    port: Number(process.env.PG_PORT),
    database: process.env.PG_DATABASE,
  });

console.log("Loaded PG_PWD:", process.env.PG_PWD);

beforeAll(async () => {
    console.log("TEST ENV VARS", {
        PG_USER: process.env.PG_USER,
        PG_PWD: process.env.PG_PWD,
        PG_DATABASE: process.env.PG_DATABASE,
      });
  await pool.query(`DELETE FROM orders WHERE order_number = 'ORD-TEST-001'`);
  await pool.query(`
    INSERT INTO orders (
      order_number, email, first_name, last_name, address,
      city, province, postal_code, total, order_status
    ) VALUES (
      'ORD-TEST-001', 'test@example.com', 'John', 'Doe', '123 Test St',
      'Toronto', 'ON', 'A1A1A1', 99.99, 'confirmed'
    )
  `);
});

afterAll(async () => {
  await pool.query(`DELETE FROM orders WHERE order_number = 'ORD-TEST-001'`);
  await pool.end(); // Close DB connection
});

describe('GET /api/order-tracking', () => {
  it('returns order data for valid order number and email', async () => {
    const res = await request(app)
      .get('/api/order-tracking')
      .query({
        orderNumber: 'ORD-TEST-001',
        emailOrPhone: 'test@example.com',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.order_number).toBe('ORD-TEST-001');
  });

  it('returns 404 for missing order', async () => {
    const res = await request(app)
      .get('/api/order-tracking')
      .query({
        orderNumber: 'ORD-FAKE-999',
        emailOrPhone: 'nobody@example.com',
      });

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 for missing query params', async () => {
    const res = await request(app)
      .get('/api/order-tracking');

    expect(res.statusCode).toBe(400); // Consider adding this check in your server
  });
});
