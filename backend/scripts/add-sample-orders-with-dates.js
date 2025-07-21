import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  user: process.env.PG_USER || 'haotianzhang',
  host: process.env.PG_HOST || 'localhost',
  database: process.env.PG_DATABASE || 'mydormstore',
  password: process.env.PG_PWD || '',
  port: process.env.PG_PORT || 5432,
});

async function addSampleOrdersWithDates() {
  try {
    console.log('Adding sample orders with different dates...');

    // Sample orders with different dates
    const sampleOrders = [
      {
        order_number: 'ORD-2024-001',
        user_id: 1,
        email: 'john.doe@example.com',
        first_name: 'John',
        last_name: 'Doe',
        phone: '555-0101',
        address: '123 Main St',
        city: 'Toronto',
        province: 'ON',
        postal_code: 'M5V 3A8',
        move_in_date: '2024-09-01',
        subtotal: 89.99,
        tax: 11.70,
        shipping: 15.00,
        total: 116.69,
        payment_method: 'credit_card',
        payment_status: 'paid',
        order_status: 'delivered',
        created_at: '2024-12-15 10:30:00' // 7 days ago
      },
      {
        order_number: 'ORD-2024-002',
        user_id: 2,
        email: 'jane.smith@example.com',
        first_name: 'Jane',
        last_name: 'Smith',
        phone: '555-0102',
        address: '456 Oak Ave',
        city: 'Vancouver',
        province: 'BC',
        postal_code: 'V6B 1A1',
        move_in_date: '2024-09-15',
        subtotal: 149.99,
        tax: 19.50,
        shipping: 20.00,
        total: 189.49,
        payment_method: 'credit_card',
        payment_status: 'paid',
        order_status: 'shipped',
        created_at: '2024-12-10 14:20:00' // 12 days ago
      },
      {
        order_number: 'ORD-2024-003',
        user_id: 3,
        email: 'mike.wilson@example.com',
        first_name: 'Mike',
        last_name: 'Wilson',
        phone: '555-0103',
        address: '789 Pine Rd',
        city: 'Montreal',
        province: 'QC',
        postal_code: 'H2Y 1C6',
        move_in_date: '2024-10-01',
        subtotal: 199.99,
        tax: 26.00,
        shipping: 25.00,
        total: 250.99,
        payment_method: 'credit_card',
        payment_status: 'paid',
        order_status: 'processing',
        created_at: '2024-11-20 09:15:00' // 1 month ago
      },
      {
        order_number: 'ORD-2024-004',
        user_id: 1,
        email: 'john.doe@example.com',
        first_name: 'John',
        last_name: 'Doe',
        phone: '555-0101',
        address: '123 Main St',
        city: 'Toronto',
        province: 'ON',
        postal_code: 'M5V 3A8',
        move_in_date: '2024-11-01',
        subtotal: 79.99,
        tax: 10.40,
        shipping: 12.00,
        total: 102.39,
        payment_method: 'credit_card',
        payment_status: 'paid',
        order_status: 'delivered',
        created_at: '2024-11-15 16:45:00' // 1.5 months ago
      },
      {
        order_number: 'ORD-2024-005',
        user_id: 2,
        email: 'jane.smith@example.com',
        first_name: 'Jane',
        last_name: 'Smith',
        phone: '555-0102',
        address: '456 Oak Ave',
        city: 'Vancouver',
        province: 'BC',
        postal_code: 'V6B 1A1',
        move_in_date: '2024-08-01',
        subtotal: 299.99,
        tax: 39.00,
        shipping: 30.00,
        total: 368.99,
        payment_method: 'credit_card',
        payment_status: 'paid',
        order_status: 'delivered',
        created_at: '2024-08-15 11:30:00' // 4 months ago
      },
      {
        order_number: 'ORD-2024-006',
        user_id: 3,
        email: 'mike.wilson@example.com',
        first_name: 'Mike',
        last_name: 'Wilson',
        phone: '555-0103',
        address: '789 Pine Rd',
        city: 'Montreal',
        province: 'QC',
        postal_code: 'H2Y 1C6',
        move_in_date: '2024-06-01',
        subtotal: 159.99,
        tax: 20.80,
        shipping: 18.00,
        total: 198.79,
        payment_method: 'credit_card',
        payment_status: 'paid',
        order_status: 'delivered',
        created_at: '2024-06-10 13:20:00' // 6 months ago
      },
      {
        order_number: 'ORD-2024-007',
        user_id: 1,
        email: 'john.doe@example.com',
        first_name: 'John',
        last_name: 'Doe',
        phone: '555-0101',
        address: '123 Main St',
        city: 'Toronto',
        province: 'ON',
        postal_code: 'M5V 3A8',
        move_in_date: '2024-03-01',
        subtotal: 399.99,
        tax: 52.00,
        shipping: 35.00,
        total: 486.99,
        payment_method: 'credit_card',
        payment_status: 'paid',
        order_status: 'delivered',
        created_at: '2024-03-15 10:00:00' // 9 months ago
      },
      {
        order_number: 'ORD-2024-008',
        user_id: 2,
        email: 'jane.smith@example.com',
        first_name: 'Jane',
        last_name: 'Smith',
        phone: '555-0102',
        address: '456 Oak Ave',
        city: 'Vancouver',
        province: 'BC',
        postal_code: 'V6B 1A1',
        move_in_date: '2024-01-01',
        subtotal: 249.99,
        tax: 32.50,
        shipping: 22.00,
        total: 304.49,
        payment_method: 'credit_card',
        payment_status: 'paid',
        order_status: 'delivered',
        created_at: '2024-01-20 15:30:00' // 11 months ago
      },
      {
        order_number: 'ORD-2024-009',
        user_id: 3,
        email: 'mike.wilson@example.com',
        first_name: 'Mike',
        last_name: 'Wilson',
        phone: '555-0103',
        address: '789 Pine Rd',
        city: 'Montreal',
        province: 'QC',
        postal_code: 'H2Y 1C6',
        move_in_date: '2023-12-01',
        subtotal: 179.99,
        tax: 23.40,
        shipping: 20.00,
        total: 223.39,
        payment_method: 'credit_card',
        payment_status: 'paid',
        order_status: 'delivered',
        created_at: '2023-12-10 12:45:00' // 1 year ago
      },
      {
        order_number: 'ORD-2024-010',
        user_id: 1,
        email: 'john.doe@example.com',
        first_name: 'John',
        last_name: 'Doe',
        phone: '555-0101',
        address: '123 Main St',
        city: 'Toronto',
        province: 'ON',
        postal_code: 'M5V 3A8',
        move_in_date: '2023-11-01',
        subtotal: 129.99,
        tax: 16.90,
        shipping: 15.00,
        total: 161.89,
        payment_method: 'credit_card',
        payment_status: 'paid',
        order_status: 'delivered',
        created_at: '2023-11-15 09:15:00' // 13 months ago
      }
    ];

    // Insert orders
    for (const order of sampleOrders) {
      const orderQuery = `
        INSERT INTO orders (
          order_number, user_id, email, first_name, last_name, phone, address, city, province, postal_code,
          move_in_date, subtotal, tax, shipping, total, payment_method, payment_status, order_status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
        ON CONFLICT (order_number) DO NOTHING
      `;

      const orderValues = [
        order.order_number, order.user_id, order.email, order.first_name, order.last_name,
        order.phone, order.address, order.city, order.province, order.postal_code,
        order.move_in_date, order.subtotal, order.tax, order.shipping, order.total,
        order.payment_method, order.payment_status, order.order_status, order.created_at
      ];

      const orderResult = await pool.query(orderQuery, orderValues);

      if (orderResult.rowCount > 0) {
        console.log(`Added order: ${order.order_number} - $${order.total} - ${order.created_at}`);
        
        // Add order items for each order
        const orderItems = [
          {
            product_id: 16,
            product_name: 'Basic Bedding Package',
            product_price: 89.99,
            quantity: 1,
            subtotal: 89.99
          },
          {
            product_id: 17,
            product_name: 'Laundry Essentials',
            product_price: 44.99,
            quantity: 1,
            subtotal: 44.99
          }
        ];

        // Get the order ID
        const orderIdResult = await pool.query('SELECT id FROM orders WHERE order_number = $1', [order.order_number]);
        const orderId = orderIdResult.rows[0].id;

        for (const item of orderItems) {
          const itemQuery = `
            INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, subtotal)
            VALUES ($1, $2, $3, $4, $5, $6)
          `;
          
          const itemValues = [
            orderId, item.product_id, item.product_name, item.product_price, item.quantity, item.subtotal
          ];

          await pool.query(itemQuery, itemValues);
        }
      }
    }

    console.log('Sample orders with dates added successfully!');
    console.log('\nExpected revenue totals:');
    console.log('- Past 7 days: ~$116.69 (ORD-2024-001)');
    console.log('- Past month: ~$556.17 (ORD-2024-001, ORD-2024-002, ORD-2024-003, ORD-2024-004)');
    console.log('- Past year: ~$2,500+ (all orders)');

  } catch (error) {
    console.error('Error adding sample orders:', error);
  } finally {
    await pool.end();
  }
}

addSampleOrdersWithDates(); 