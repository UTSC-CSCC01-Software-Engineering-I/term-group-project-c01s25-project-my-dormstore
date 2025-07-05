-- Step 1: Basic Products Table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    rating DECIMAL(2,1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add some sample data for testing
INSERT INTO products (name, price, description, rating) VALUES 
    ('Laundry Essentials', 44.99, 'This package includes everything you will need for your clean and dirty laundry.', 4.0),
    ('Kitchen Package', 99.95, 'Complete kitchen essentials for your dorm room', 3.5),
    ('Cleaning Package', 39.99, 'All the cleaning supplies you need for your dorm', 4.0)
ON CONFLICT DO NOTHING; 