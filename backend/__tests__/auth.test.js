import request from 'supertest';
import app from '../server.js';
import { pool } from '../server.js'; 
import jwt from 'jsonwebtoken';
import { jest } from '@jest/globals';

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
    token = res.body.token;
  });

  test('Missing fields on register', async () => {
    const res = await request(app).post('/registerUser').send({ email: '' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/Email and password both needed/i);
  });

  test('Duplicate email register fails', async () => {
    const res = await request(app).post('/registerUser').send(duplicateUser);
    expect(res.statusCode).toBe(500); 
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

  test('GET /me with valid token but deleted user returns 404', async () => {
    // Create user and token
    const tempUser = { email: 'tempuser@test.com', password: 'temp123' };
    const register = await request(app).post('/registerUser').send(tempUser);
    const tempToken = register.body.token;
  
    // Delete user
    await pool.query(`DELETE FROM users WHERE email = $1`, [tempUser.email]);
  
    // Now try to get /me with the token
    const res = await request(app)
      .get('/me')
      .set('Authorization', `Bearer ${tempToken}`);
  
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toMatch(/User not found/i);
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
  test('Update user with no data returns 400', async () => {
    const res = await request(app)
      .put('/api/user/update')
      .set('Authorization', `Bearer ${token}`)
      .send({});
  
    expect(res.statusCode).toBe(400); 
  });
  
  test('Update email to duplicate one fails', async () => {
    const newUser = await request(app)
      .post('/registerUser')
      .send({ email: 'existing@example.com', password: 'pass1234' });
  
    const res = await request(app)
      .put('/api/user/update')
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'existing@example.com' });
  
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toMatch(/Failed to update user/i);
  
    await pool.query(`DELETE FROM users WHERE email = $1`, ['existing@example.com']);
  });
  test('Update password missing currentPassword fails', async () => {
    const res = await request(app)
      .put('/api/user/update')
      .set('Authorization', `Bearer ${token}`)
      .send({ password: 'newPassOnly' });
  
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
  test('Login - DB error triggers 500', async () => {
    const originalQuery = pool.query.bind(pool); 
    pool.query = jest.fn().mockImplementation(() => {
      throw new Error('Simulated DB error');
    });
  
    const res = await request(app).post('/loginUser').send(baseUser);
  
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toMatch(/Simulated DB error/i);
  
    pool.query = originalQuery; 
  });
});
