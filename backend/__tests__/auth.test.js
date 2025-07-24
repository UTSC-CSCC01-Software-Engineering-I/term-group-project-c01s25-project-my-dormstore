import request from 'supertest';
import app from '../server.js';
import { pool } from '../server.js';

describe('Auth Routes', () => {
  const testUser = {
    email: 'testuser@example.com',
    password: 'testpassword123'
  };

  beforeAll(async () => {
    await pool.query(`DELETE FROM users WHERE email = $1`, [testUser.email]);
  });

  afterAll(async () => {
    await pool.query(`DELETE FROM users WHERE email = $1`, [testUser.email]);
    await pool.end();
  });

  test('should register a user successfully', async () => {
    const res = await request(app)
      .post('/registerUser')
      .send(testUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.response).toBe("User registered successfully.");
  });

  test('should not register with missing fields', async () => {
    const res = await request(app)
      .post('/registerUser')
      .send({ email: '' });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/Email and password both needed/i);
  });

  test('should login successfully with correct credentials', async () => {
    const res = await request(app)
      .post('/loginUser')
      .send(testUser);

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.response).toMatch(/logged in/i);
  });

  test('should fail login with incorrect password', async () => {
    const res = await request(app)
      .post('/loginUser')
      .send({ email: testUser.email, password: 'wrongpassword' });

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toMatch(/Authentication failed/i);
  });

  test('should fail login with missing email/password', async () => {
    const res = await request(app)
      .post('/loginUser')
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/Email and password both needed/i);
  });
});
