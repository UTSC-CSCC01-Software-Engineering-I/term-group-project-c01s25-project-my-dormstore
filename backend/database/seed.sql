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

-- Insert sample order udpates 
INSERT INTO order_updates (order_name, email, update_text) VALUES
  ('Test User', 'testuser1@example.com', 'Order is being packed'),
  ('John Doe', 'johndoe@example.com', 'Order shipped, tracking number sent');
