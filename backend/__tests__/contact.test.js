import request from 'supertest';
import app from '../server.js'; 

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
});
