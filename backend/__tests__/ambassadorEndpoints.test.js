import request from 'supertest';
import app from '../server.js';
import { pool } from '../server.js';
import { jest } from '@jest/globals';

describe('POST /api/ambassador/register', () => {
  const testEmail = 'ambassador_test@example.com';

  afterAll(async () => {
    // Clean up test ambassador if inserted
    await pool.query('DELETE FROM ambassadors WHERE email = $1', [testEmail]);
    await pool.end();
  });

  test('should fail with missing fields', async () => {
    const res = await request(app)
      .post('/api/ambassador/register')
      .send({ firstName: 'A', lastName: 'B', email: testEmail }); // Missing password fields

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'All fields are required.');
  });

  test('should fail when passwords do not match', async () => {
    const res = await request(app)
      .post('/api/ambassador/register')
      .send({
        firstName: 'Test',
        lastName: 'User',
        email: testEmail,
        password: '123456',
        confirmPassword: 'abcdef'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'Passwords do not match.');
  });

  test('should register ambassador successfully', async () => {
    const res = await request(app)
      .post('/api/ambassador/register')
      .send({
        firstName: 'Test',
        lastName: 'Ambassador',
        email: testEmail,
        password: '123456',
        confirmPassword: '123456'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'Ambassador registered');
    expect(res.body).toHaveProperty('ambassador');
    expect(res.body.ambassador.email).toBe(testEmail);
  });
});

describe('Ambassador Register Endpoint - Error Handling', () => {
  test('should return 500 if database fails during ambassador registration', async () => {
    const originalQuery = pool.query;
    pool.query = jest.fn(() => {
      throw new Error('DB insert error');
    });

    const payload = {
      firstName: 'Test',
      lastName: 'Ambassador',
      email: 'errorcase@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    };

    const res = await request(app)
      .post('/api/ambassador/register')
      .send(payload);

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toMatch(/failed to register ambassador/i);

    pool.query = originalQuery;
  });
});