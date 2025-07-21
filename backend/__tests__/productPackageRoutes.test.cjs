// backend/__tests__/productPackageRoutes.test.cjs

jest.mock('express', () => {
  const realExpress = jest.requireActual('express');
  const app = realExpress();
  app.listen = () => {};           
  function fake() { return app; }
  Object.assign(fake, realExpress);   
  return fake;
});

jest.mock('pg', () => {
  const mPool = { query: jest.fn() };
  return { Pool: jest.fn(() => mPool) };
});
const request = require('supertest');
const jwt     = require('jsonwebtoken');
const { app, pool } = require('../server.js');
const mockPool = pool;
const FAKE_TOKEN = jwt.sign({ userId: 1 }, 'secret-key', { expiresIn: '1h' });


describe('Product Routes', () => {
  beforeEach(() => {
    mockPool.query.mockReset();
  });

  test('GET /api/admin/products → 200 + array', async () => {
    mockPool.query.mockResolvedValueOnce({
      rows: [{
        id: 1,
        name: 'Prod1',
        price: 9.99,
        category: 'tech',
        description: 'desc',
        rating: 0,
        image_url: 'u',
        size: 'M',
        color: 'black',
        stock: 20,
        active: true,
      }],
    });

    const res = await request(app)
      .get('/api/admin/products')
      .set('Authorization', `Bearer ${FAKE_TOKEN}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('Prod1');
  });

  test('POST /api/admin/products → 201 + new item', async () => {
    const dto = {
      name: 'X', price: 2, category: 'c', description: 'd',
      image_url: 'u', size: 'S', color: 'red', stock: 5, active: false
    };
    mockPool.query.mockResolvedValueOnce({
      rows: [{ id: 99, ...dto, rating: 0, image_url: 'u' }]
    });

    const res = await request(app)
      .post('/api/admin/products')
      .set('Authorization', `Bearer ${FAKE_TOKEN}`)
      .send(dto);

    expect(res.status).toBe(201);
    expect(res.body.id).toBe(99);
    expect(res.body.name).toBe('X');
  });

  test('PUT /api/admin/products/:id → 200 & sync packages', async () => {
    const upd = {
      name: 'Y', price: 3, category: 'c', description: 'd',
      image_url: 'u', size: 'L', color: 'green', stock: 1, active: true
    };
    mockPool.query
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 5, ...upd, rating: 0, image_url: 'u' }] }) 
      .mockResolvedValueOnce({ rows: [{ package_id: 10 }] })  
      .mockResolvedValueOnce({});                           

    const res = await request(app)
      .put('/api/admin/products/5')
      .set('Authorization', `Bearer ${FAKE_TOKEN}`)
      .send(upd);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(5);
  });

  test('DELETE /api/admin/products/:id → 200', async () => {
    mockPool.query
      .mockResolvedValueOnce({ rows: [{ package_id: 10 }] })     
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 5 }] })  
      .mockResolvedValueOnce({});                                

    const res = await request(app)
      .delete('/api/admin/products/5')
      .set('Authorization', `Bearer ${FAKE_TOKEN}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Product deleted', id: 5 });
  });
});


describe('Package Routes', () => {
  beforeEach(() => {
    mockPool.query.mockReset();
  });

  test('GET /api/admin/packages → 200 + array', async () => {
    mockPool.query.mockResolvedValueOnce({
      rows: [{
        id: 1,
        name: 'Pack1',
        price: 19.99,
        category: 'bundle',
        description: 'bd',
        rating: 0,
        image_url: 'u',
        size: 'L',
        color: 'white',
        stock: 3,
        active: true,
      }],
    });

    const res = await request(app)
      .get('/api/admin/packages')
      .set('Authorization', `Bearer ${FAKE_TOKEN}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('Pack1');
  });

  test('GET /api/admin/packages/:id/items → 200 + items', async () => {
    mockPool.query.mockResolvedValueOnce({
      rows: [{ product_id: 2, product_name: 'Prod2', quantity: 4 }]
    });

    const res = await request(app)
      .get('/api/admin/packages/1/items')
      .set('Authorization', `Bearer ${FAKE_TOKEN}`);

    expect(res.status).toBe(200);
    expect(res.body[0].product_name).toBe('Prod2');
  });

  test('DELETE /api/admin/packages/:id → 200', async () => {
    mockPool.query
      .mockResolvedValueOnce({})  // DELETE package_items
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 40 }] });

    const res = await request(app)
      .delete('/api/admin/packages/40')
      .set('Authorization', `Bearer ${FAKE_TOKEN}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Package deleted', id: 40 });
  });

  test('PUT /api/admin/packages/:id/stock no items', async () => {
    mockPool.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 50, stock: 5 }] });

    const res = await request(app)
      .put('/api/admin/packages/50/stock')
      .set('Authorization', `Bearer ${FAKE_TOKEN}`)
      .send({ stock: 5 });

    expect(res.status).toBe(200);
    expect(res.body.stock).toBe(5);
  });

  test('PUT /api/admin/packages/:id/stock with items', async () => {
    mockPool.query
      .mockResolvedValueOnce({ rows: [{ product_id: 1, quantity: 2 }] })
      .mockResolvedValueOnce({ rows: [{ id: 1, stock: 5 }] })
      .mockResolvedValueOnce({ rows: [{ id: 60, stock: 2 }] });

    const res = await request(app)
      .put('/api/admin/packages/60/stock')
      .set('Authorization', `Bearer ${FAKE_TOKEN}`);

    expect(res.status).toBe(200);
    expect(res.body.stock).toBe(2);
  });
});
