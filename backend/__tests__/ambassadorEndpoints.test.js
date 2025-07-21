import { jest } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app, { pool } from '../server.js';

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterAll(() => {
  console.log.mockRestore();
  console.error.mockRestore();
});

process.env.SECRET = 'secret-key';
const adminToken = jwt.sign({ userId: 1 }, process.env.SECRET);

beforeEach(() => {
  pool.query = jest.fn();
});

describe('GET /api/admin/ambassadors', () => {
  it('should return list of ambassadors when authorized', async () => {
    const fakeRows = [
      { id: 1, firstName: 'John',  lastName: 'Doe',   email: 'john@example.com' },
      { id: 2, firstName: 'Jane',  lastName: 'Smith', email: 'jane@example.com' }
    ];
    pool.query.mockResolvedValue({ rows: fakeRows });

    const res = await request(app)
      .get('/api/admin/ambassadors')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body).toEqual(fakeRows);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('SELECT')
    );
  });

  it('should respond with 500 on database error', async () => {
    pool.query.mockRejectedValue(new Error('Database failure'));

    const res = await request(app)
      .get('/api/admin/ambassadors')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(500);

    expect(res.body).toEqual({ error: 'Failed to fetch ambassadors' });
  });

  it('should respond with 401 if no token is provided', async () => {
    await request(app)
      .get('/api/admin/ambassadors')
      .expect(401);
  });
});

describe('DELETE /api/admin/ambassadors/:id', () => {
  it('should delete ambassador when it exists', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 1 });

    const res = await request(app)
      .delete('/api/admin/ambassadors/123')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body).toEqual({ message: 'Ambassador deleted successfully' });
    expect(pool.query).toHaveBeenCalledWith(
      'DELETE FROM ambassadors WHERE id = $1 RETURNING id',
      [123]
    );
  });

  it('should respond with 404 if ambassador is not found', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 0 });

    const res = await request(app)
      .delete('/api/admin/ambassadors/999')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);

    expect(res.body).toEqual({ error: 'Ambassador not found' });
  });

  it('should respond with 500 on database error during deletion', async () => {
    pool.query.mockRejectedValue(new Error('Deletion error'));

    const res = await request(app)
      .delete('/api/admin/ambassadors/5')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(500);

    expect(res.body).toEqual({ error: 'Failed to delete ambassador' });
  });

  it('should respond with 401 if attempting deletion without a token', async () => {
    await request(app)
      .delete('/api/admin/ambassadors/1')
      .expect(401);
  });
});
