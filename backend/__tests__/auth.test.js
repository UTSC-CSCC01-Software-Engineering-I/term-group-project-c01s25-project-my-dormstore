import request from 'supertest';
import app from '../server.js';
import { pool } from '../server.js'; 

describe('Auth Routes', () => {
  const baseUser = {
    email: 'testuser@example.com',
    password: 'testpassword123'
  };

  const duplicateUser = {
    email: 'testuser@example.com',
    password: 'anotherpass456'
  };

  let token = '';

  beforeAll(async () => {
    await pool.query(`DELETE FROM users WHERE email = $1`, [baseUser.email]);
  });

  afterAll(async () => {
    await pool.query(`DELETE FROM users WHERE email = $1`, [baseUser.email]);
    await pool.end();
  });

  test('Register success', async () => {
    const res = await request(app).post('/registerUser').send(baseUser);
    expect(res.statusCode).toBe(201);
    expect(res.body.token).toBeDefined();
    token = res.body.token; // Save for later
  });

  test('Missing fields on register', async () => {
    const res = await request(app).post('/registerUser').send({ email: '' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/Email and password both needed/i);
  });

  test('Duplicate email register fails', async () => {
    const res = await request(app).post('/registerUser').send(duplicateUser);
    expect(res.statusCode).toBe(500); // constraint violation
    expect(res.body.error).toBeDefined();
  });

  test('Login success', async () => {
    const res = await request(app).post('/loginUser').send(baseUser);
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('Wrong password login', async () => {
    const res = await request(app).post('/loginUser').send({
      email: baseUser.email,
      password: 'wrongpassword'
    });
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toMatch(/Authentication failed/i);
  });

  test('Missing fields on login', async () => {
    const res = await request(app).post('/loginUser').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/Email and password both needed/i);
  });

  test('Valid token returns user (GET /me)', async () => {
    const res = await request(app)
      .get('/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe(baseUser.email);
  });

  test('Invalid token fails (GET /me)', async () => {
    const res = await request(app)
      .get('/me')
      .set('Authorization', 'Bearer invalidtoken123');
    expect(res.statusCode).toBe(403);
    expect(res.body.error).toMatch(/Invalid token/i);
  });

  test('Missing token fails (GET /me)', async () => {
    const res = await request(app).get('/me');
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toMatch(/Missing token/i);
  });

  test('Update name/email/school (PUT /api/user/update)', async () => {
    const res = await request(app)
      .put('/api/user/update')
      .set('Authorization', `Bearer ${token}`)
      .send({ first_name: 'Ashley', school: 'Test School' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('Update password with correct current password', async () => {
    const res = await request(app)
      .put('/api/user/update')
      .set('Authorization', `Bearer ${token}`)
      .send({
        currentPassword: baseUser.password,
        password: 'newSecurePass123'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('Update password fails with wrong current password', async () => {
    const res = await request(app)
      .put('/api/user/update')
      .set('Authorization', `Bearer ${token}`)
      .send({
        currentPassword: 'wrongPass',
        password: 'newSecurePass456'
      });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/Current password is incorrect/i);
  });
});
