import request from 'supertest';
import app from '../server.js';
import { pool } from '../server.js';
import { jest } from '@jest/globals';

const originalQuery = pool.query;
let token;


describe('Cart Routes', () => {
  const testUser = {
    email: 'cartuser@example.com',
    password: 'test1234'
  };

  let productId = null;
  let package_id = 95;
  let validProductWithSize;


  beforeAll(async () => {
    await pool.query(`DELETE FROM users WHERE email = $1`, [testUser.email]);

    const registerRes = await request(app).post('/registerUser').send(testUser);
    token = registerRes.body.token;

    const productRes = await pool.query(
      `INSERT INTO products (name, price, category, description, rating, size, color, stock, active)
       VALUES ('Test Product', 10.0, 'test', 'test product desc', 4.5, 'One Size', 'Red', 100, true)
       RETURNING id`
    );
    productId = productRes.rows[0].id;
    const sizedRes = await pool.query(`
    INSERT INTO products (name, price, category, description, rating, size, color, stock, active)
    VALUES ('Sized Product', 20, 'test', 'desc', 4.5, 'M', 'Red', 10, true)
    RETURNING id
    `);
    validProductWithSize = sizedRes.rows[0].id;
  });

  afterAll(async () => {
    await pool.query('DELETE FROM cart_items WHERE user_id = (SELECT id FROM users WHERE email = $1)', [testUser.email]);
    await pool.query('DELETE FROM users WHERE email = $1', [testUser.email]);
    await pool.query('DELETE FROM products WHERE id = $1', [productId]);
  });

  test('GET /cart returns empty initially', async () => {
    const res = await request(app)
      .get('/cart')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.cartItems).toEqual([]);
  });

  test('POST /cart adds new item', async () => {
    const res = await request(app)
      .post('/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ product_id: productId, quantity: 2 });
    expect(res.statusCode).toBe(201);
    expect(res.body.cartItem).toBeDefined();
    expect(res.body.cartItem.quantity).toBe(2);
    cartItemId = res.body.cartItem.id;
  });

  test('POST /cart adds same item (updates quantity)', async () => {
    const res = await request(app)
      .post('/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ product_id: productId, quantity: 3 });
    expect(res.statusCode).toBe(200);
    expect(res.body.cartItem.quantity).toBe(5); // 2 + 3
  });

  test('POST /cart fails with invalid quantity', async () => {
    const res = await request(app)
      .post('/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ product_id: productId, quantity: 0 });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/quantity/i);
  });

  test('POST /cart fails with missing product_id', async () => {
    const res = await request(app)
      .post('/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 1 });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/Product ID/i);
  });

  test('PUT /cart/:itemId updates quantity', async () => {
    const res = await request(app)
      .put(`/cart/${cartItemId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 10 });
    expect(res.statusCode).toBe(200);
    expect(res.body.cartItem.quantity).toBe(10);
  });

  test('PUT /cart/:itemId fails with bad quantity', async () => {
    const res = await request(app)
      .put(`/cart/${cartItemId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 0 });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/quantity/i);
  });

  test('PUT /cart/:itemId fails with invalid item ID', async () => {
    const res = await request(app)
      .put(`/cart/999999`)
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 1 });
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toMatch(/Cart item not found/i);
  });

  test('DELETE /cart/:itemId removes the item', async () => {
    const res = await request(app)
      .delete(`/cart/${cartItemId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/removed/i);
  });

  test('DELETE /cart/:itemId fails with invalid ID', async () => {
    const res = await request(app)
      .delete(`/cart/9999999`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toMatch(/not authorized/i);
  });

  test('DELETE /cart clears all items', async () => {
    await request(app)
      .post('/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ product_id: productId, quantity: 1 });

    const res = await request(app)
      .delete('/cart')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.itemsRemoved).toBeGreaterThan(0);
  });
  test('GET /cart without token returns 200 if public', async () => {
    const res = await request(app).get('/cart');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.cartItems)).toBe(true);
  });
  test('POST /cart fails with invalid product ID', async () => {
    const res = await request(app)
      .post('/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ product_id: 9999999, quantity: 1 });
    expect(res.statusCode).toBe(404);
  });
  let brokenProductId = null;

  test('GET /cart removes item if product is deleted', async () => {
    await request(app)
      .post('/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ product_id: productId, quantity: 1 });
  
    await pool.query('DELETE FROM cart_items WHERE product_id = $1', [productId]);
  
    await pool.query('ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_product_id_fkey');
  
    await pool.query('DELETE FROM products WHERE id = $1', [productId]);
  
    await pool.query(`
      INSERT INTO cart_items (user_id, product_id, quantity, item_type, created_at, updated_at)
      VALUES ((SELECT id FROM users WHERE email = $1), $2, 1, 'product', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [testUser.email, productId]);
  
    brokenProductId = productId;
  
    const res = await request(app)
      .get('/cart')
      .set('Authorization', `Bearer ${token}`);
  
    expect(res.statusCode).toBe(200);
    expect(res.body.removedItems.length).toBeGreaterThan(0);
    expect(res.body.removedItems[0].reason).toMatch(/no longer available/i);
  });
  
  test('GET /cart removes item if product is out of stock', async () => {
    const productRes = await pool.query(
      `INSERT INTO products (name, price, category, description, rating, size, color, stock, active)
       VALUES ('Test OutOfStock', 10.0, 'test', 'test product', 4.5, 'One Size', 'Blue', 5, true)
       RETURNING id`
    );
    const tempProductId = productRes.rows[0].id;
  
    await request(app)
      .post('/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ product_id: tempProductId, quantity: 1 });
  
    await pool.query(`UPDATE products SET stock = 0 WHERE id = $1`, [tempProductId]);
  
    const res = await request(app)
      .get('/cart')
      .set('Authorization', `Bearer ${token}`);
  
    expect(res.statusCode).toBe(200);
    expect(res.body.removedItems.length).toBeGreaterThan(0);
    expect(res.body.removedItems[0].reason).toMatch(/Out of stock/i);
  
    await pool.query('DELETE FROM products WHERE id = $1', [tempProductId]);
  });
  test('GET /cart adjusts quantity if it exceeds available stock', async () => {
    const productRes = await pool.query(
      `INSERT INTO products (name, price, category, description, rating, size, color, stock, active)
       VALUES ('Limited Product', 10.0, 'test', 'limited product', 4.5, 'One Size', 'Green', 10, true)
       RETURNING id`
    );
    const limitedProductId = productRes.rows[0].id;
  
    await request(app)
      .post('/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ product_id: limitedProductId, quantity: 8 });
  
    await pool.query(`UPDATE products SET stock = 5 WHERE id = $1`, [limitedProductId]);
  
    const res = await request(app)
      .get('/cart')
      .set('Authorization', `Bearer ${token}`);
  
    expect(res.statusCode).toBe(200);
    expect(res.body.removedItems.length).toBeGreaterThan(0);
    expect(res.body.removedItems[0].reason).toMatch(/adjusted to 5/);
  
    await pool.query('DELETE FROM cart_items WHERE product_id = $1', [limitedProductId]);
    await pool.query('DELETE FROM products WHERE id = $1', [limitedProductId]);
  });
  test('GET /cart includes valid package item and does not remove it', async () => {
    const packageRes = await pool.query(`
  INSERT INTO packages (name, description, price, category, stock, active)
  VALUES ('Test Package', 'Test Desc', 50, 'test-category', 10, true)
  RETURNING id
`);
    const packageId = packageRes.rows[0].id;
  
    await pool.query(`
      INSERT INTO cart_items (user_id, package_id, item_type, quantity, created_at, updated_at)
      VALUES ((SELECT id FROM users WHERE email = $1), $2, 'package', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [testUser.email, packageId]);
  
    const res = await request(app)
      .get('/cart')
      .set('Authorization', `Bearer ${token}`);
  
    expect(res.statusCode).toBe(200);
    expect(res.body.cartItems.some(item => item.package_id === packageId)).toBe(true);
    expect(res.body.removedItems.length).toBe(0);
  
    await pool.query('DELETE FROM cart_items WHERE package_id = $1', [packageId]);
    await pool.query('DELETE FROM packages WHERE id = $1', [packageId]);
  });
  test('GET /cart returns item unchanged if in stock and valid', async () => {
    const productRes = await pool.query(`
      INSERT INTO products (name, price, category, description, rating, size, color, stock, active)
      VALUES ('Normal Product', 20, 'test', 'description', 4.5, 'M', 'Blue', 100, true)
      RETURNING id
    `);
    const productId = productRes.rows[0].id;
  
    await request(app)
      .post('/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ product_id: productId, quantity: 2 });
  
    const res = await request(app)
      .get('/cart')
      .set('Authorization', `Bearer ${token}`);
  
    expect(res.statusCode).toBe(200);
    expect(res.body.cartItems.some(i => i.product_id === productId)).toBe(true);
    expect(res.body.removedItems.length).toBe(0);
  
    await pool.query('DELETE FROM cart_items WHERE product_id = $1', [productId]);
    await pool.query('DELETE FROM products WHERE id = $1', [productId]);
  });
  test('POST /cart returns 404 if package not found', async () => {
    const res = await request(app)
      .post('/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({
        package_id: 9999999, 
        quantity: 1,
      });
  
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: "Package not found" });
  });
  let lowStockPackageId;

beforeAll(async () => {
  const result = await pool.query(`
    INSERT INTO packages (name, description, price, stock, category, active)
    VALUES ('Low Stock Package', 'For test', 10, 2, 'Test', true)
    RETURNING id
  `);
  lowStockPackageId = result.rows[0].id;
});
test('POST /cart returns 400 if quantity > availableStock', async () => {
  const res = await request(app)
    .post('/cart')
    .set('Authorization', `Bearer ${token}`)
    .send({
      package_id: lowStockPackageId,
      quantity: 5, 
    });

  expect(res.statusCode).toBe(400);
  expect(res.body.error).toBe("Insufficient package stock");
});
test('POST /cart returns 404 if product not found', async () => {
  const res = await request(app)
    .post('/cart')
    .set('Authorization', `Bearer ${token}`)
    .send({
      product_id: 9999999,
      quantity: 1,
    });

  expect(res.statusCode).toBe(404);
  expect(res.body).toEqual({ error: "Product not found" });
});
test('POST /cart with size and color defined', async () => {
  await request(app)
    .post('/cart')
    .set('Authorization', `Bearer ${token}`)
    .send({
      package_id,
      quantity: 1,
      selected_size: 'L',
      selected_color: 'Red',
    })
    .expect(201); 
});
test('POST /cart with only size defined', async () => {
  await request(app)
    .post('/cart')
    .set('Authorization', `Bearer ${token}`)
    .send({
      package_id,
      quantity: 1,
      selected_size: 'M',
    })
    .expect(201);
});
it('POST /cart (product only size)', async () => {
  const res = await request(app)
    .post('/cart')
    .set('Authorization', `Bearer ${token}`)
    .send({
      product_id: validProductWithSize,
      quantity: 1,
      selected_size: 'M'
    });
  expect(res.statusCode).toBe(201);
});
let poolClosed = false;

afterAll(async () => {
  if (poolClosed) return;

  try {
    if (brokenProductId) {
      await pool.query('DELETE FROM cart_items WHERE product_id = $1', [brokenProductId]);
    }

    await pool.query(`
      ALTER TABLE cart_items ADD CONSTRAINT cart_items_product_id_fkey
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    `);

    await pool.query('DELETE FROM products WHERE id = $1', [validProductWithSize]);
  } catch (err) {
    console.error("Cleanup failed:", err);
  } finally {
    poolClosed = true;
    //await pool.end();
  }
});
test('POST /cart with only color defined', async () => {
  await request(app)
    .post('/cart')
    .set('Authorization', `Bearer ${token}`)
    .send({
      package_id,
      quantity: 1,
      selected_color: 'Blue',
    })
    .expect(201);
});
test('POST /cart with no size or color', async () => {
  await request(app)
    .post('/cart')
    .set('Authorization', `Bearer ${token}`)
    .send({
      package_id,
      quantity: 1,
    })
    .expect(201);
});

  test('GET /cart handles DB error gracefully', async () => {
    const spy = jest.spyOn(pool, 'query').mockImplementation(() => {
      throw new Error('Simulated DB error');
    });
  
    const res = await request(app)
      .get('/cart')
      .set('Authorization', `Bearer ${token}`);
  
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ cartItems: [], removedItems: [] });
  
    spy.mockRestore();
  });
  test('GET /cart handles internal server error', async () => {
    const spy = jest.spyOn(pool, 'query').mockImplementation(() => {
      throw new Error('Simulated failure');
    });
  
    const res = await request(app)
      .get('/cart')
      .set('Authorization', `Bearer ${token}`);
  
    expect(res.statusCode).toBe(200); 
    expect(res.body).toEqual({ cartItems: [], removedItems: [] });
  
    spy.mockRestore();
  });

});

describe('DELETE /cart - simulate DB error', () => {
  test('should return 500 on DB failure', async () => {
    const originalQuery = pool.query;
    pool.query = jest.fn(() => {
      throw new Error('Simulated DB failure');
    });

    const res = await request(app)
      .delete('/cart')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toMatch(/failed to clear cart/i);

    pool.query = originalQuery;
  });
});
