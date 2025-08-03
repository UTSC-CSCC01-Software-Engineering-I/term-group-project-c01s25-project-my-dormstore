import request from 'supertest';
import { app } from '../server.js';

describe('POST /api/admin/login', () => {
  test('should login successfully with correct credentials', async () => {
    const res = await request(app)
      .post('/api/admin/login')
      .send({ email: 'admin@example.com', password: 'admin123' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Admin login successful');
    expect(res.body).toHaveProperty('token');
  });

  test('should fail login with incorrect password', async () => {
    const res = await request(app)
      .post('/api/admin/login')
      .send({ email: 'admin@example.com', password: 'wrongpass' });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error', 'Incorrect password.');
  });

  test('should fail login with non-existent admin', async () => {
    const res = await request(app)
      .post('/api/admin/login')
      .send({ email: 'nonexistent@example.com', password: 'password123' });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error', 'Admin not found.');
  });

  test('should return 400 for missing fields', async () => {
    const res = await request(app)
      .post('/api/admin/login')
      .send({ email: 'admin@example.com'  }); 

    expect(res.statusCode).toBe(401); 
  });
});
