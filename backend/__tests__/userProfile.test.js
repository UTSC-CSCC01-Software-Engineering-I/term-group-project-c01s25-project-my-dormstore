import request from 'supertest';
import app from '../server.js';
import { pool } from '../server.js';
import jwt from 'jsonwebtoken';
import { jest } from '@jest/globals';

let token;
let userId;

beforeAll(async () => {
  const userRes = await pool.query(
    `INSERT INTO users (email, password, first_name, last_name)
     VALUES ('testuser@example.com', 'hashed_pwd', 'Test', 'User') RETURNING id`
  );
  userId = userRes.rows[0].id;

  token = jwt.sign({ userId, email: 'testuser@example.com' }, "secret-key", {
    expiresIn: '1h',
  });
});

afterAll(async () => {
  await pool.query(`DELETE FROM users WHERE email = 'testuser@example.com'`);
  await pool.end();
});

describe('GET /me', () => {
  test('returns user info with valid token', async () => {
    const res = await request(app)
      .get('/me')
      .set('Authorization', `Bearer ${token}`);

    console.log("res.body", res.body);
    expect(res.statusCode).toBe(200);
    expect(res.body.first_name).toBe('Test');
    expect(res.body.last_name).toBe('User');
    expect(res.body.email).toBe('testuser@example.com');
  });

  test('returns 401 without token', async () => {
    const res = await request(app).get('/me');
    expect(res.statusCode).toBe(401);
  });

  test('handles DB failure gracefully', async () => {
    const originalQuery = pool.query;
    pool.query = jest.fn(() => Promise.reject(new Error('Simulated DB error')));

    const res = await request(app)
      .get('/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toMatch(/something went wrong/i);

    pool.query = originalQuery;
  });
});

describe('PUT /api/user/update', () => {
  test('updates user profile with valid token and fields', async () => {
    const res = await request(app)
      .put('/api/user/update')
      .set('Authorization', `Bearer ${token}`)
      .send({
        firstName: 'UpdatedFirst',
        lastName: 'UpdatedLast',
        school: 'New School',
        dorm: 'Dorm X'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/user updated successfully/i);
  });

  test('returns 400 if required fields are missing', async () => {
    const res = await request(app)
      .put('/api/user/update')
      .set('Authorization', `Bearer ${token}`)
      .send({}); // no fields

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/no fields provided/i);
  });

  test('returns 403 with invalid token', async () => {
    const res = await request(app)
      .put('/api/user/update')
      .set('Authorization', `Bearer invalidtoken`)
      .send({
        firstName: 'Hacky',
        lastName: 'User'
      });

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toMatch(/invalid token/i);
  });

  test('returns 401 if no token is provided', async () => {
    const res = await request(app)
      .put('/api/user/update')
      .send({
        firstName: 'NoToken',
        lastName: 'User'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toMatch(/missing token/i);
  });
});