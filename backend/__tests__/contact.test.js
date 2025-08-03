import request from 'supertest';
import { app, pool } from '../server.js';
import { jest } from '@jest/globals';


describe('Contact Us Routes', () => {
  test('POST /api/contact - valid message', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({
        name: 'Ashley Lin',
        email: 'ashley@example.com',
        message: 'I would like to know more about your products.'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.message || res.body.statusMsg).toMatch(/received/i);
});

  test('POST /api/contact - missing fields', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({
        name: '',
        email: '',
        message: ''
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error || res.body.message).toMatch(/missing/i);
  });
  test('should return 500 if database insert fails', async () => {
    const originalQuery = pool.query;
    const originalConsoleError = console.error;
    console.error = jest.fn();
    pool.query = jest.fn(() => {
      throw new Error('Simulated DB insert failure');
    });

    const res = await request(app).post('/api/contact').send({
      name: 'Test User',
      email: 'test@example.com',
      message: 'Test message'
    });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toMatch(/database error/i);

    pool.query = originalQuery;
    console.error = originalConsoleError;
  });
});
