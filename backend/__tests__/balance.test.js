import request from 'supertest';
import app from '../server.js';
import { pool } from '../server.js';
import { jest } from '@jest/globals';

describe('Balance Routes', () => {
  const testUser = {
    email: 'balanceuser@example.com',
    password: 'balancepass123'
  };

  let token = '';
  let userId;

  beforeAll(async () => {
    await pool.query('DELETE FROM users WHERE email = $1', [testUser.email]);

    const registerRes = await request(app).post('/registerUser').send(testUser);
    token = registerRes.body.token;

    const meRes = await request(app).get('/me').set('Authorization', `Bearer ${token}`);
    userId = meRes.body.id;

    await pool.query('DELETE FROM user_balance WHERE user_id = $1', [userId]);
  });

  afterAll(async () => {
    await pool.query('DELETE FROM user_balance WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    await pool.end();
  });

  test('GET /api/user/balance initializes new balance', async () => {
    const res = await request(app)
      .get('/api/user/balance')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.balance).toBeGreaterThan(0);
    expect(res.body.totalSpent).toBe(0);
  });

  test('POST /api/user/balance/add adds funds', async () => {
    const res = await request(app)
      .post('/api/user/balance/add')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 50.75 });

    expect(res.statusCode).toBe(200);
    expect(res.body.balance).toBeGreaterThanOrEqual(1050.75);
    expect(res.body.message).toMatch(/Balance updated successfully/i);
  });

  test('POST /api/user/balance/add fails with invalid amount', async () => {
    const res = await request(app)
      .post('/api/user/balance/add')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 0 });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/Invalid amount/i);
  });
  test('GET /api/user/balance should return 500 on database error', async () => {
    const originalQuery = pool.query;
    const originalConsoleError = console.error;
    console.error = jest.fn();
    pool.query = jest.fn(() => {
      throw new Error("Simulated DB failure");
    });
  
    const res = await request(app)
      .get('/api/user/balance')
      .set('Authorization', `Bearer ${token}`); 
  
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toMatch(/failed to fetch balance/i);
  
    pool.query = originalQuery;
    console.error = originalConsoleError;
  });
  
});
