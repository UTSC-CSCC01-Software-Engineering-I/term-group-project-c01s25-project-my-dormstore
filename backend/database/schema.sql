-- Step 1: Basic Products Table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    rating DECIMAL(2,1) DEFAULT 0,
    category VARCHAR(100),
    size TEXT,
    color TEXT,
    image_url TEXT,
    stock INTEGER DEFAULT 100, -- Add stock field with default 100
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    active BOOLEAN DEFAULT true -- Add active field to manage product visibility
);

-- users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  dorm VARCHAR(255),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  city VARCHAR(255),
  province VARCHAR(255),
  postal_code VARCHAR(20),
  school VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- user_balance table for tracking spending like a banking app
CREATE TABLE IF NOT EXISTS user_balance (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  balance DECIMAL(10,2) NOT NULL DEFAULT 1000.00, -- Starting balance of $1000
  total_spent DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- cart_items table for shopping cart functionality
CREATE TABLE IF NOT EXISTS cart_items (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  selected_size VARCHAR(50),
  selected_color VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  package_id INTEGER REFERENCES packages(id) ON DELETE CASCADE,
  item_type VARCHAR(50) NOT NULL DEFAULT 'product', -- 'product' or 'package'
  UNIQUE(user_id, product_id, selected_size, selected_color)
);

-- orders table for completed orders
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  user_id INTEGER REFERENCES users(id),
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address TEXT NOT NULL,
  city VARCHAR(255) NOT NULL,
  province VARCHAR(255) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  move_in_date DATE,
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) NOT NULL,
  shipping DECIMAL(10,2) NOT NULL,
  shipping_method VARCHAR(100),
  total DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(100),
  payment_status VARCHAR(50) DEFAULT 'pending',
  status VARCHAR(50) DEFAULT 'processing',
  order_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  billing_first_name TEXT,
  billing_last_name TEXT,
  billing_address TEXT,
  billing_city TEXT,
  billing_province TEXT,
  billing_postal_code TEXT
);

-- order_items table for items in each order
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  product_name VARCHAR(255) NOT NULL,
  product_price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- order_updates table
CREATE TABLE IF NOT EXISTS order_updates (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  update_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'wait for process',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add Admin table
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
);


-- ambassadors table
CREATE TABLE IF NOT EXISTS ambassadors (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- contact_messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- packages table
CREATE TABLE IF NOT EXISTS packages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  rating DECIMAL(2,1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  image_url TEXT,
  size TEXT,
  color TEXT,
  stock INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true
);


-- package_items
CREATE TABLE IF NOT EXISTS package_items (
  id SERIAL PRIMARY KEY,
  package_id INTEGER NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(package_id, product_id)
);

-- order_packages
CREATE TABLE IF NOT EXISTS order_packages (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  package_id INTEGER REFERENCES packages(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Deduct stock when order_packages are inserted
CREATE OR REPLACE FUNCTION deduct_package_stock()
RETURNS TRIGGER AS $$
DECLARE
  item RECORD;
  found_items INTEGER;
BEGIN
  -- Check if there are mapped products
  SELECT COUNT(*) INTO found_items
  FROM package_items
  WHERE package_id = NEW.package_id;

  IF found_items > 0 THEN
    -- Loop and deduct product stock
    FOR item IN
      SELECT product_id, quantity
      FROM package_items
      WHERE package_id = NEW.package_id
    LOOP
      UPDATE products
      SET stock = stock - (item.quantity * NEW.quantity),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = item.product_id;
    END LOOP;
  ELSE
    -- Deduct stock directly from the package itself
    UPDATE packages
    SET stock = stock - NEW.quantity
    WHERE id = NEW.package_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for deducting stock when a package is ordered
CREATE TRIGGER trigger_deduct_stock_on_package_order
AFTER INSERT ON order_packages
FOR EACH ROW
EXECUTE FUNCTION deduct_package_stock();

-- Update package stock automatically when a product's stock changes
CREATE OR REPLACE FUNCTION update_related_packages_stock()
RETURNS TRIGGER AS $$
DECLARE
  pkg_id INTEGER;
BEGIN
  FOR pkg_id IN
    SELECT DISTINCT package_id
    FROM package_items
    WHERE product_id = NEW.id
  LOOP
    PERFORM
      (
        WITH items AS (
          SELECT p.stock, pi.quantity
          FROM package_items pi
          JOIN products p ON pi.product_id = p.id
          WHERE pi.package_id = pkg_id
        )
        UPDATE packages
        SET stock = (
          SELECT
            CASE WHEN COUNT(*) = 0 THEN 0
                 ELSE MIN(FLOOR(stock / quantity)) END
          FROM items
        )
        WHERE id = pkg_id
      );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update package stock after product stock changes
CREATE TRIGGER trg_auto_update_package_stock
AFTER UPDATE OF stock ON products
FOR EACH ROW
WHEN (OLD.stock IS DISTINCT FROM NEW.stock)
EXECUTE FUNCTION update_related_packages_stock();
