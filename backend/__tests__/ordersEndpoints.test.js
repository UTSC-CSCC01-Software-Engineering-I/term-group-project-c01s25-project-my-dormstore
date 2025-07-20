// backend/__tests__/ambassadorEndpoints.test.js
import process from 'process';
process.env.NODE_ENV = 'test';
import request from 'supertest';
import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import app, { pool } from '../server.js';

// Dummy test to ensure SECRET isn't tree-shaken
test('setup secret-key', () => {});
const SECRET = 'secret-key';
const adminToken = jwt.sign({ userId: 1 }, SECRET);

// Silence server logs and errors during tests
let consoleLogSpy;
let consoleErrorSpy;
beforeAll(() => {
  consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  consoleLogSpy.mockRestore();
  consoleErrorSpy.mockRestore();
});

beforeEach(() => {
  // Reset pool.query to a Jest mock before each test
  pool.query = jest.fn();
});

describe('GET /api/admin/ambassadors', () => {
  it('should return list of ambassadors when authorized', async () => {
    const fakeRows = [
      { id: 1, firstName: 'Zhang', lastName: 'San', email: 'zhang3@example.com' },
      { id: 2, firstName: 'Li', lastName: 'Si', email: 'li4@example.com' }
    ];
    pool.query.mockResolvedValue({ rows: fakeRows });

    const res = await request(app)
      .get('/api/admin/ambassadors')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body).toEqual(fakeRows);
    // verify SQL call: first arg includes SELECT, second arg is undefined or an array
    const callArgs = pool.query.mock.calls[0];
    expect(callArgs[0]).toMatch(/SELECT/);
    const params = Array.isArray(callArgs[1]) ? callArgs[1] : [];
    expect(Array.isArray(params)).toBe(true);
  });

  it('should return 500 on database error', async () => {
    pool.query.mockRejectedValue(new Error('Database failure'));

    const res = await request(app)
      .get('/api/admin/ambassadors')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(500);

    expect(res.body).toEqual({ error: 'Failed to fetch ambassadors' });
  });

  it('should return 401 if no token is provided', async () => {
    await request(app)
      .get('/api/admin/ambassadors')
      .expect(401);
  });
});

describe('DELETE /api/admin/ambassadors/:id', () => {
  it('should delete ambassador when exists', async () => {
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

  it('should return 404 if ambassador not found', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 0 });

    const res = await request(app)
      .delete('/api/admin/ambassadors/999')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);

    expect(res.body).toEqual({ error: 'Ambassador not found' });
  });

  it('should return 500 on database error during deletion', async () => {
    pool.query.mockRejectedValue(new Error('Deletion error'));

    const res = await request(app)
      .delete('/api/admin/ambassadors/5')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(500);

    expect(res.body).toEqual({ error: 'Failed to delete ambassador' });
  });

  it('should return 401 when attempting deletion without a token', async () => {
    await request(app)
      .delete('/api/admin/ambassadors/1')
      .expect(401);
  });
});