import request from 'supertest';
import { app, pool } from '../server.js';


describe('Admin Routes', () => {
  const admin = {
    email: 'admin@example.com',
    password: 'admin123'
  };

  let token = '';
  let userId = null;

  beforeAll(async () => {
    await pool.query(`
      INSERT INTO admin_users (email, password)
      VALUES ($1, $2)
      ON CONFLICT (email) DO NOTHING
    `, [admin.email, admin.password]);

    const res = await request(app).post('/api/admin/login').send(admin);
    token = res.body.token;

    const userRes = await request(app).post('/registerUser').send({
      email: 'deleteuser@example.com',
      password: 'password123'
    });
    const me = await request(app).get('/me').set('Authorization', `Bearer ${userRes.body.token}`);
    userId = me.body.id;
  });

  afterAll(async () => {
    if (userId) await pool.query(`DELETE FROM users WHERE id = $1`, [userId]);
    await pool.end();
  });

  test('POST /api/admin/login success', async () => {
    const res = await request(app).post('/api/admin/login').send(admin);
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('POST /api/admin/login wrong password', async () => {
    const res = await request(app)
      .post('/api/admin/login')
      .send({ email: admin.email, password: 'wrong' });

    expect(res.statusCode).toBe(401);
  });

  test('GET /api/admin/users returns users', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${token}`);
  
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true); 
    expect(res.body.length).toBeGreaterThanOrEqual(0);
  });
  

  test('DELETE /api/admin/users/:id deletes user & orders', async () => {
    const res = await request(app)
      .delete(`/api/admin/users/${userId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
    userId = null; 
  });

  test('DELETE /api/admin/users/:id not found', async () => {
    const res = await request(app)
      .delete(`/api/admin/users/999999`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
  });

  test('GET /api/admin/orders returns orders with filter', async () => {
    const res = await request(app)
      .get('/api/admin/orders')
      .set('Authorization', `Bearer ${token}`);
  
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true); 
  });
  

  test('GET /api/admin/revenue returns data', async () => {
    const res = await request(app)
      .get('/api/admin/revenue')
      .set('Authorization', `Bearer ${token}`)
      .query({ range: '7' });

    expect(res.statusCode).toBe(200);
    expect(res.body.totalRevenue).toBeDefined();
    expect(res.body.totalOrders).toBeDefined();
    expect(res.body.averageOrderValue).toBeDefined();
    expect(res.body.timeRange).toBeDefined();
  });

  test('PUT /api/order-status updates status', async () => {
    const orderRes = await pool.query(`
        SELECT order_number FROM orders ORDER BY created_at DESC LIMIT 1
    `);
    const orderNumber = orderRes.rows[0]?.order_number;

    if (orderNumber) {
      const res = await request(app)
        .put('/api/order-status')
        .set('Authorization', `Bearer ${token}`)
        .send({ orderNumber, status: 'shipped' })

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(/updated/i);
    } else {
      console.warn('⚠️ No order available to test status update');
    }
  });

  test('GET /api/admin/orders/active returns active orders', async () => {
    const res = await request(app)
      .get('/api/admin/orders/active')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.activeOrders)).toBe(true);
});

test('GET /api/admin/dashboard/summary returns summary stats', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard/summary')
      .set('Authorization', `Bearer ${token}`);
  
    expect(res.statusCode).toBe(200);
    expect(res.body.todayRevenue).toBeDefined();
    expect(res.body.todayOrders).toBeDefined();
    expect(res.body.pendingOrders).toBeDefined();
    expect(res.body.totalUsers).toBeDefined();
  });
});
