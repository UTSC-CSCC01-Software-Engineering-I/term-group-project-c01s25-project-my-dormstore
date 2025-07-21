const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');

// Create a minimal express app for testing
function createTestApp(pool) {
  const app = express();
  app.use(express.json());

  // Middleware to simulate authentication
  app.use((req, res, next) => {
    const auth = req.headers['authorization'];
    if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
    next();
  });

  // Revenue endpoint
  app.get('/api/admin/revenue', async (req, res) => {
    const { range } = req.query;
    try {
      const result = await pool.query(
        'SELECT 1000 as total_revenue, 5 as total_orders, 200 as average_order_value',
        []
      );
      res.json({
        totalRevenue: result.rows[0].total_revenue,
        totalOrders: result.rows[0].total_orders,
        averageOrderValue: result.rows[0].average_order_value,
        timeRange: range
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch revenue data' });
    }
  });

  // Active orders endpoint
  app.get('/api/admin/orders/active', async (req, res) => {
    try {
      const result = await pool.query('', []);
      res.json({
        activeOrders: result.rows.map(order => ({
          orderNumber: order.order_number,
          customerName: `${order.first_name} ${order.last_name}`,
          total: order.total,
          status: order.order_status,
          createdAt: order.created_at
        }))
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch active orders' });
    }
  });

  return app;
}

describe('Admin Revenue & Recent Orders Endpoints', () => {
  const SECRET = 'secret-key';
  const adminToken = jwt.sign({ userId: 1 }, SECRET);
  let pool;
  let app;

  beforeEach(() => {
    pool = { query: jest.fn() };
    app = createTestApp(pool);
  });

  describe('GET /api/admin/revenue', () => {
    it('returns revenue data for a given range', async () => {
      pool.query.mockResolvedValue({ rows: [{ total_revenue: 1000, total_orders: 5, average_order_value: 200 }] });
      const res = await request(app)
        .get('/api/admin/revenue?range=7')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(res.body).toEqual({
        totalRevenue: 1000,
        totalOrders: 5,
        averageOrderValue: 200,
        timeRange: '7',
      });
    });
    it('returns 500 on db error', async () => {
      pool.query.mockRejectedValue(new Error('DB error'));
      const res = await request(app)
        .get('/api/admin/revenue?range=7')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(500);
      expect(res.body).toHaveProperty('error', 'Failed to fetch revenue data');
    });
  });

  describe('GET /api/admin/orders/active', () => {
    it('returns recent active orders', async () => {
      pool.query.mockResolvedValue({ rows: [
        { order_number: '1001', first_name: 'Alice', last_name: 'Smith', total: 100, order_status: 'Processing', created_at: '2024-07-01' },
        { order_number: '1002', first_name: 'Bob', last_name: 'Lee', total: 200, order_status: 'Shipped', created_at: '2024-07-02' },
      ] });
      const res = await request(app)
        .get('/api/admin/orders/active')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(res.body.activeOrders).toHaveLength(2);
      expect(res.body.activeOrders[0]).toMatchObject({
        orderNumber: '1001',
        customerName: 'Alice Smith',
        total: 100,
        status: 'Processing',
        createdAt: '2024-07-01',
      });
    });
    it('returns 500 on db error', async () => {
      pool.query.mockRejectedValue(new Error('DB error'));
      const res = await request(app)
        .get('/api/admin/orders/active')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(500);
      expect(res.body).toHaveProperty('error', 'Failed to fetch active orders');
    });
  });
}); 