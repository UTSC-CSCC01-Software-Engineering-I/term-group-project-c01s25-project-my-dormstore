import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  user: process.env.PG_USER || 'haotianzhang',
  host: process.env.PG_HOST || 'localhost',
  database: process.env.PG_DATABASE || 'mydormstore',
  password: process.env.PG_PWD || '',
  port: process.env.PG_PORT || 5432,
});

async function updateOrderDates() {
  try {
    console.log('Updating order dates to be relative to current date...');

    // Update orders with dates relative to July 19, 2025
    const dateUpdates = [
      { order_number: 'ORD-2024-001', new_date: '2025-07-12 10:30:00' }, // 7 days ago
      { order_number: 'ORD-2024-002', new_date: '2025-07-07 14:20:00' }, // 12 days ago
      { order_number: 'ORD-2024-003', new_date: '2025-06-19 09:15:00' }, // 1 month ago
      { order_number: 'ORD-2024-004', new_date: '2025-06-04 16:45:00' }, // 1.5 months ago
      { order_number: 'ORD-2024-005', new_date: '2025-03-19 11:30:00' }, // 4 months ago
      { order_number: 'ORD-2024-006', new_date: '2025-01-19 13:20:00' }, // 6 months ago
      { order_number: 'ORD-2024-007', new_date: '2024-10-19 10:00:00' }, // 9 months ago
      { order_number: 'ORD-2024-008', new_date: '2024-08-19 15:30:00' }, // 11 months ago
      { order_number: 'ORD-2024-009', new_date: '2024-07-19 12:45:00' }, // 1 year ago
      { order_number: 'ORD-2024-010', new_date: '2024-06-19 09:15:00' }  // 13 months ago
    ];

    for (const update of dateUpdates) {
      const query = `
        UPDATE orders 
        SET created_at = $1 
        WHERE order_number = $2
      `;
      
      const result = await pool.query(query, [update.new_date, update.order_number]);
      
      if (result.rowCount > 0) {
        console.log(`Updated ${update.order_number} to ${update.new_date}`);
      }
    }

    console.log('Order dates updated successfully!');
    console.log('\nExpected revenue totals:');
    console.log('- Past 7 days: ~$116.69 (ORD-2024-001)');
    console.log('- Past month: ~$556.17 (ORD-2024-001, ORD-2024-002, ORD-2024-003, ORD-2024-004)');
    console.log('- Past year: ~$2,500+ (all orders)');

  } catch (error) {
    console.error('Error updating order dates:', error);
  } finally {
    await pool.end();
  }
}

updateOrderDates(); 