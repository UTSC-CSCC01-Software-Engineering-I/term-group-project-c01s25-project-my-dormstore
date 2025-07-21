import request from 'supertest';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import app, { pool } from '../server.js';

dotenv.config();

// Use a fallback secret if none provided
process.env.JWT_SECRET = process.env.JWT_SECRET || 'secret-key';

// Create a valid admin token for testing
const token = jwt.sign({ id: 1, role: 'admin' }, process.env.JWT_SECRET);

// Store IDs of test users
const testUserIds = [];

beforeAll(async () => {
  // Insert two test users with required fields
  const res1 = await pool.query(
    `INSERT INTO users (first_name, last_name, email, phone, address, password)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    ['Test', 'User1', 'test1@example.com', '111-111-1111', 'Address1', 'password123']
  );
  testUserIds.push(res1.rows[0].id);

  const res2 = await pool.query(
    `INSERT INTO users (first_name, last_name, email, phone, address, password)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    ['Test', 'User2', 'test2@example.com', '222-222-2222', 'Address2', 'password123']
  );
  testUserIds.push(res2.rows[0].id);
});

afterAll(async () => {
  // Clean up test data and close DB connection
  await pool.query('DELETE FROM orders WHERE user_id = ANY($1)', [testUserIds]);
  await pool.query('DELETE FROM users WHERE id = ANY($1)', [testUserIds]);
  await pool.end();
});

describe('GET /api/admin/users', () => {
  it('should return a list of users when authorized', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    const emails = res.body.map(u => u.email);
    expect(emails).toEqual(
      expect.arrayContaining(['test1@example.com', 'test2@example.com'])
    );
  });

  it('should return 401 if no token is provided', async () => {
    await request(app)
      .get('/api/admin/users')
      .expect(401);
  });
});

describe('DELETE /api/admin/users/:id', () => {
  it('should delete a user and their orders when authorized', async () => {
    const userId = testUserIds[0];
    const res = await request(app)
      .delete(`/api/admin/users/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.message).toBe('User and related orders deleted');
    const check = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    expect(check.rowCount).toBe(0);
  });

  it('should return 404 for a non-existent user', async () => {
    await request(app)
      .delete('/api/admin/users/999999')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });

  it('should return 401 if no token is provided', async () => {
    const userId = testUserIds[1];
    await request(app)
      .delete(`/api/admin/users/${userId}`)
      .expect(401);
  });
});
