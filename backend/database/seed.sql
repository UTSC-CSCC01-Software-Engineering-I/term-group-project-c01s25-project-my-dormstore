-- Add some sample data for testing
INSERT INTO products (name, price, description, rating) VALUES 
    ('Laundry Essentials', 44.99, 'This package includes everything you will need for your clean and dirty laundry.', 4.0),
    ('Kitchen Package', 99.95, 'Complete kitchen essentials for your dorm room', 3.5),
    ('Cleaning Package', 39.99, 'All the cleaning supplies you need for your dorm', 4.0)
ON CONFLICT DO NOTHING; 

-- Insert sample users
INSERT INTO users (email, password, dorm, first_name, last_name, school) VALUES
  ('test1@example.com', '$2b$10$testpasswordhash', 'Dorm A', 'Test', 'User1', 'Test University'),
  ('test2@example.com', '$2b$10$testpasswordhash2', 'Dorm B', 'Jane', 'Doe', 'Sample College');

-- Insert sample orders for testing revenue functionality
INSERT INTO orders (order_number, user_id, email, first_name, last_name, phone, address, city, province, postal_code, move_in_date, subtotal, tax, shipping, total, payment_method, payment_status, order_status, created_at) VALUES
  ('ORD-1703123456-123', 1, 'test1@example.com', 'Test', 'User1', '123-456-7890', '123 Dorm St', 'Toronto', 'ON', 'M5V 2H1', '2024-09-01', 44.99, 5.85, 10.00, 60.84, 'credit_card', 'completed', 'processing', CURRENT_TIMESTAMP - INTERVAL '2 days'),
  ('ORD-1703123457-456', 2, 'test2@example.com', 'Jane', 'Doe', '987-654-3210', '456 Campus Rd', 'Waterloo', 'ON', 'N2L 3G1', '2024-09-15', 99.95, 12.99, 15.00, 127.94, 'credit_card', 'completed', 'shipping', CURRENT_TIMESTAMP - INTERVAL '1 day'),
  ('ORD-1703123458-789', 1, 'test1@example.com', 'Test', 'User1', '123-456-7890', '123 Dorm St', 'Toronto', 'ON', 'M5V 2H1', '2024-09-01', 39.99, 5.20, 8.00, 53.19, 'credit_card', 'completed', 'pending', CURRENT_TIMESTAMP - INTERVAL '5 hours'),
  ('ORD-1703123459-012', 2, 'test2@example.com', 'Jane', 'Doe', '987-654-3210', '456 Campus Rd', 'Waterloo', 'ON', 'N2L 3G1', '2024-09-15', 149.94, 19.49, 20.00, 189.43, 'credit_card', 'pending', 'processing', CURRENT_TIMESTAMP - INTERVAL '30 minutes')
ON CONFLICT DO NOTHING;

-- Insert sample order items
INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, subtotal) VALUES
  (1, 1, 'Laundry Essentials', 44.99, 1, 44.99),
  (2, 2, 'Kitchen Package', 99.95, 1, 99.95),
  (3, 3, 'Cleaning Package', 39.99, 1, 39.99),
  (4, 1, 'Laundry Essentials', 44.99, 1, 44.99),
  (4, 2, 'Kitchen Package', 99.95, 1, 99.95),
  (4, 3, 'Cleaning Package', 39.99, 1, 39.99)
ON CONFLICT DO NOTHING;

-- Insert sample order udpates 
INSERT INTO order_updates (order_name, email, update_text) VALUES
  ('Test User', 'testuser1@example.com', 'Order is being packed'),
  ('John Doe', 'johndoe@example.com', 'Order shipped, tracking number sent');
