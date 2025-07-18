import request from 'supertest';
import app from '../server';

describe('GET /api/products/:id', () => {
  it('should return product data', async () => {
    const res = await request(app).get('/api/products/1');
    expect(res.statusCode).toBe(200);
    expect(res.body.product).toHaveProperty('name');
    expect(res.body.product).toHaveProperty('price');
  });
});
