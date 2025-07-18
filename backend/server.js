import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pg from 'pg';
import 'dotenv/config';
import { packageCompositions } from './scripts/package-compositions.js';

const { Pool } = pg;
const app = express();
const PORT = process.env.PORT || 5001;

// CORS setup
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
    
// Middleware
app.use(express.json());

let pool;

async function connectToPG() {
  try {
    pool = new Pool({
      user: process.env.PG_USER,
      host: process.env.PG_HOST,
      database: process.env.PG_DATABASE,
      password: process.env.PG_PWD,
      port: process.env.PG_PORT,
    });
  } catch (error) {
    console.error("Error connecting to PostgreSQL:", error);
  }
}
connectToPG();

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 

  if (!token) {
    return res.status(401).json({ error: 'Missing token' });
  }

  jwt.verify(token, "secret-key", (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
  

// Register a new user
app.post("/registerUser", async (req, res) => {
    try {
        const { email, password } = req.body;
  
        // Basic body request check
        if (!email || !password) {
            return res
            .status(400)
            .json({ error: "Email and password both needed to register." });
        }
  
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id",
            [email, hashedPassword]
        );
  
        const token = jwt.sign({ userId: result.rows[0].id }, "secret-key", { expiresIn: "1h" });
        res.status(201).json({ response: "User registered successfully.", token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
  });

// Log in an existing user
app.post("/loginUser", async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Basic body request check
      if (!email || !password) {
        return res
          .status(400)
          .json({ error: "Email and password both needed to login." });
      }
  
      const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
      const user = result.rows[0];
  
      if (user && (await bcrypt.compare(password, user.password))) {
        const token = jwt.sign({ userId: user.id }, "secret-key", { expiresIn: "1h" });
  
        res.json({ response: "User logged in succesfully.", token: token }); 
      } else {
        res.status(401).json({ error: "Authentication failed." });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/me", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const result = await pool.query(
        "SELECT id, email, dorm, first_name, last_name, school, phone, address, city, province, postal_code FROM users WHERE id = $1",
        [userId]
      );
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
  
      res.json(result.rows[0]);  
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Something went wrong" });
    }
  });

// Get user's cart items
app.get("/cart", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await pool.query(
      "SELECT id, product_id, quantity, created_at, updated_at FROM cart_items WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );
    res.json({ cartItems: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve cart items" });
  }
});

// Add item to cart
app.post("/cart", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { product_id, quantity = 1 } = req.body;

    if (!product_id) {
      return res.status(400).json({ error: "Product ID is required" });
    }
    if (quantity < 1) {
      return res.status(400).json({ error: "Quantity must be at least 1" });
    }
    const existingItem = await pool.query(
      "SELECT id, quantity FROM cart_items WHERE user_id = $1 AND product_id = $2",
      [userId, product_id]
    );
    if (existingItem.rows.length > 0) {
      // update existing item quantity
      const newQuantity = existingItem.rows[0].quantity + quantity;
      const result = await pool.query(
        "UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND product_id = $3 RETURNING *",
        [newQuantity, userId, product_id]
      );
      
      res.json({ 
        message: "Cart item updated", 
        cartItem: result.rows[0] 
      });
    } else {
      const result = await pool.query(
        "INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *",
        [userId, product_id, quantity]
      );
      res.status(201).json({ 
        message: "Item added to cart", 
        cartItem: result.rows[0] 
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add item to cart" });
  }
});

// update cart item quantity
app.put("/cart/:itemId", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const itemId = parseInt(req.params.itemId);
    const { quantity } = req.body;

    // validate
    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: "Quantity must be at least 1" });
    }

    const result = await pool.query(
      "UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3 RETURNING *",
      [quantity, itemId, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Cart item not found or not authorized" });
    }

    res.json({ 
      message: "Cart item quantity updated", 
      cartItem: result.rows[0] 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update cart item" });
  }
});

// Remove specific item from cart
app.delete("/cart/:itemId", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const itemId = parseInt(req.params.itemId);

    const result = await pool.query(
      "DELETE FROM cart_items WHERE id = $1 AND user_id = $2 RETURNING *",
      [itemId, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Cart item not found or not authorized" });
    }
    res.json({ 
      message: "Item removed from cart", 
      removedItem: result.rows[0] 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to remove cart item" });
  }
});

app.delete("/cart", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      "DELETE FROM cart_items WHERE user_id = $1 RETURNING *",
      [userId]
    );

    res.json({ 
      message: "Cart cleared successfully", 
      removedItems: result.rows,
      itemsRemoved: result.rows.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to clear cart" });
  }
});


  app.put("/api/user/update", authenticateToken, async (req, res) => {
    const { email, password, currentPassword, dorm, first_name, last_name, school, phone, address, city, province, postal_code } = req.body;
    const userId = req.user.userId;
  
    try {
      if (password && currentPassword) {
        const userResult = await pool.query("SELECT password FROM users WHERE id = $1", [userId]);
        const user = userResult.rows[0];
        
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return res.status(403).json({ message: "Current password is incorrect", success: false });
        }
  
        const hashed = await bcrypt.hash(password, 10);
        await pool.query("UPDATE users SET password = $1 WHERE id = $2", [hashed, userId]);
      }

      if (email) {
        await pool.query("UPDATE users SET email = $1 WHERE id = $2", [email, userId]);
      }
      if (password) {
        const hashed = await bcrypt.hash(password, 10);
        await pool.query("UPDATE users SET password = $1 WHERE id = $2", [hashed, userId]);
      }
      if (dorm) {
        await pool.query("UPDATE users SET dorm = $1 WHERE id = $2", [dorm, userId]);
      }
      if (first_name) {
        await pool.query("UPDATE users SET first_name = $1 WHERE id = $2", [first_name, userId]);
      }
      if (last_name) {
        await pool.query("UPDATE users SET last_name = $1 WHERE id = $2", [last_name, userId]);
      }
      if (school) {
        await pool.query("UPDATE users SET school = $1 WHERE id = $2", [school, userId]);
      }
      if (phone) {
        await pool.query("UPDATE users SET phone = $1 WHERE id = $2", [phone, userId]);
      }
      if (address) {
        await pool.query("UPDATE users SET address = $1 WHERE id = $2", [address, userId]);
      }
      if (city) {
        await pool.query("UPDATE users SET city = $1 WHERE id = $2", [city, userId]);
      }
      if (province) {
        await pool.query("UPDATE users SET province = $1 WHERE id = $2", [province, userId]);
      }
      if (postal_code) {
        await pool.query("UPDATE users SET postal_code = $1 WHERE id = $2", [postal_code, userId]);
      }
  
      res.json({ message: "User updated successfully", success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });
  
  //change it to admin orderupdates
  app.post("/api/admin/order-updates", async (req, res) => {
    const { orderNumber, email, update } = req.body;
  
    if (!orderNumber || !email || !update) {
      return res.status(400).json({ error: "Missing required fields" });
    }
  
    try {
      await pool.query(
        "INSERT INTO order_updates (order_number, email, update_text) VALUES ($1, $2, $3)",
        [orderNumber, email, update]
      );
      res.status(200).json({ message: "Update saved" });
    } catch (err) {
      console.error("Database insert error:", err);
      res.status(500).json({ error: "Database error" });
    }
  });

  app.get("/api/order-updates", async (req, res) => {
    const { orderNumber, email } = req.query;
  
    if (!orderNumber || !email) {
      return res.status(400).json({ error: "Missing order number or email" });
    }
  
    try {
      const result = await pool.query(
        "SELECT update_text, created_at FROM order_updates WHERE order_number = $1 AND email = $2 ORDER BY created_at ASC",
        [orderNumber, email]
      );
  
      res.json({ updates: result.rows });
    } catch (err) {
      console.error("Database fetch error:", err);
      res.status(500).json({ error: "Failed to fetch updates" });
    }
  });

  app.get('/api/order-tracking', async (req, res) => {
    const { orderNumber, emailOrPhone } = req.query;
  
    try {
      const result = await pool.query(
        `SELECT * FROM orders 
         WHERE order_number = $1 AND (email = $2 OR phone = $2)`,
        [orderNumber, emailOrPhone]
      );
  
      if (result.rows.length > 0) {
        res.status(200).json(result.rows[0]);
      } else {
        res.status(404).json({ message: "Order not found" });
      }
    } catch (err) {
      console.error("Tracking error:", err);
      res.status(500).json({ error: "Server error" });
    }
  });

// Products API endpoints
app.get("/api/products", async (req, res) => {
  try {
    const { category } = req.query;
    let query, params;
    
    if (category) {
      query = "SELECT id, name, price, description, rating, image_url, created_at, updated_at FROM products WHERE category = $1 ORDER BY name";
      params = [category];
    } else {
      query = "SELECT id, name, price, description, rating, image_url, created_at, updated_at FROM products ORDER BY name";
      params = [];
    }
    
    const result = await pool.query(query, params);
    res.json({ products: result.rows });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Get single product by ID
app.get("/api/products/:id", async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const result = await pool.query(
      "SELECT id, name, price, description, rating, image_url, created_at, updated_at FROM products WHERE id = $1",
      [productId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    res.json({ product: result.rows[0] });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// Packages API endpoints
app.get("/api/packages", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, price, category, description, rating, image_url, created_at, updated_at FROM packages ORDER BY category, name"
    );
    res.json({ packages: result.rows });
  } catch (error) {
    console.error("Error fetching packages:", error);
    res.status(500).json({ error: "Failed to fetch packages" });
  }
});

// Get single package by ID
app.get("/api/packages/:id", async (req, res) => {
  try {
    const packageId = parseInt(req.params.id);
    const result = await pool.query(
      "SELECT id, name, price, category, description, rating, image_url, created_at, updated_at FROM packages WHERE id = $1",
      [packageId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Package not found" });
    }
    
    res.json({ package: result.rows[0] });
  } catch (error) {
    console.error("Error fetching package:", error);
    res.status(500).json({ error: "Failed to fetch package" });
  }
});

// Get package details with included products
app.get("/api/packages/:id/details", async (req, res) => {
  try {
    const packageId = parseInt(req.params.id);
    
    // Get package info
    const packageResult = await pool.query(
      "SELECT id, name, price, category, description, rating, image_url, created_at, updated_at FROM packages WHERE id = $1",
      [packageId]
    );
    
    if (packageResult.rows.length === 0) {
      return res.status(404).json({ error: "Package not found" });
    }
    
    // Get included products
    const productsResult = await pool.query(`
      SELECT p.id, p.name, p.price, p.category, p.description, p.rating, pi.quantity
      FROM package_items pi
      JOIN products p ON pi.product_id = p.id
      WHERE pi.package_id = $1
      ORDER BY p.name
    `, [packageId]);
    
    let includedProducts = productsResult.rows;
    
    // If no real products exist, show intended products from our compositions
    if (includedProducts.length === 0) {
      const packageName = packageResult.rows[0].name;
      const composition = packageCompositions.find(comp => comp.packageName === packageName);
      
      if (composition && composition.products.length > 0) {
        includedProducts = composition.products.map((product, index) => ({
          id: `intended_${packageId}_${index}`,
          name: product.name,
          price: null,
          category: null,
          description: null,
          rating: null,
          quantity: product.quantity,
          is_intended: true
        }));
      }
    }
    
    const packageData = {
      ...packageResult.rows[0],
      included_products: includedProducts
    };
    
    res.json({ package: packageData });
  } catch (error) {
    console.error("Error fetching package details:", error);
    res.status(500).json({ error: "Failed to fetch package details" });
  }
});
  
  // Contact form endpoint
  app.post("/api/contact", async (req, res) => {
  const { name, phone, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO contact_messages (name, phone, email, message) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, phone, email, message]
    );

    res.status(201).json({ message: "Message received!", data: result.rows[0] });
  } catch (err) {
    console.error("Error saving contact message:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Get user's balance
app.get("/api/user/balance", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get or create user balance
    let result = await pool.query(
      "SELECT * FROM user_balance WHERE user_id = $1",
      [userId]
    );
    
    if (result.rows.length === 0) {
      // Create initial balance for new user
      result = await pool.query(
        "INSERT INTO user_balance (user_id, balance, total_spent) VALUES ($1, $2, $3) RETURNING *",
        [userId, 1000.00, 0.00]
      );
    }
    
    res.json({ 
      balance: parseFloat(result.rows[0].balance),
      totalSpent: parseFloat(result.rows[0].total_spent)
    });
  } catch (error) {
    console.error("Error fetching user balance:", error);
    res.status(500).json({ error: "Failed to fetch balance" });
  }
});

// Add funds to user balance
app.post("/api/user/balance/add", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }
    
    const result = await pool.query(
      `UPDATE user_balance 
       SET balance = balance + $1, last_updated = CURRENT_TIMESTAMP 
       WHERE user_id = $2 
       RETURNING balance, total_spent`,
      [amount, userId]
    );
    
    if (result.rows.length === 0) {
      // Create balance record if it doesn't exist
      await pool.query(
        "INSERT INTO user_balance (user_id, balance, total_spent) VALUES ($1, $2, $3)",
        [userId, 1000.00 + parseFloat(amount), 0.00]
      );
      res.json({ 
        balance: 1000.00 + parseFloat(amount),
        totalSpent: 0.00,
        message: "Balance updated successfully"
      });
    } else {
      res.json({ 
        balance: parseFloat(result.rows[0].balance),
        totalSpent: parseFloat(result.rows[0].total_spent),
        message: "Balance updated successfully"
      });
    }
  } catch (error) {
    console.error("Error updating balance:", error);
    res.status(500).json({ error: "Failed to update balance" });
  }
});

// Order creation endpoint with balance deduction
app.post("/api/orders", authenticateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const userId = req.user.userId;
    const {
      email,
      firstName,
      lastName,
      phone,
      address,
      city,
      province,
      postalCode,
      moveInDate,
      paymentMethod,
      subtotal,
      tax,
      shipping,
      total,
      billingAddress
    } = req.body;

    // Validate required fields
    if (!email || !firstName || !lastName || !address || !city || !province || !postalCode) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check user balance
    let balanceResult = await client.query(
      "SELECT * FROM user_balance WHERE user_id = $1",
      [userId]
    );
    
    if (balanceResult.rows.length === 0) {
      // Create initial balance for new user
      await client.query(
        "INSERT INTO user_balance (user_id, balance, total_spent) VALUES ($1, $2, $3)",
        [userId, 1000.00, 0.00]
      );
      balanceResult = await client.query(
        "SELECT * FROM user_balance WHERE user_id = $1",
        [userId]
      );
    }
    
    const currentBalance = parseFloat(balanceResult.rows[0].balance);
    
    if (currentBalance < total) {
      return res.status(400).json({ 
        error: "Insufficient funds", 
        currentBalance: currentBalance,
        requiredAmount: total,
        shortfall: total - currentBalance
      });
    }

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create the order
    const orderResult = await client.query(
      `INSERT INTO orders (
        order_number, user_id, email, first_name, last_name, phone,
        address, city, province, postal_code, move_in_date,
        subtotal, tax, shipping, total, payment_method,
        billing_first_name, billing_last_name, billing_address, billing_city, billing_province, billing_postal_code
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
      RETURNING id, order_number`,
      [
        orderNumber, userId, email, firstName, lastName, phone,
        address, city, province, postalCode, moveInDate,
        subtotal, tax, shipping, total, paymentMethod,
        billingAddress?.firstName || null,
        billingAddress?.lastName || null,
        billingAddress?.address || null,
        billingAddress?.city || null,
        billingAddress?.province || null,
        billingAddress?.postalCode || null,
      ]
    );

    const orderId = orderResult.rows[0].id;
    const orderNumberGenerated = orderResult.rows[0].order_number;

    // Get cart items for this user
    const cartResult = await client.query(
      "SELECT ci.*, p.name as product_name, p.price as price FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.user_id = $1",
      [userId]
    );

    // Create order items
    for (const item of cartResult.rows) {
      await client.query(
        `INSERT INTO order_items (
          order_id, product_id, product_name, price, quantity, subtotal
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          orderId, item.product_id, item.product_name, item.price,
          item.quantity, item.product_price * item.quantity
        ]
      );
    }

    // Deduct from user balance and update total spent
    await client.query(
      `UPDATE user_balance 
       SET balance = balance - $1, 
           total_spent = total_spent + $1, 
           last_updated = CURRENT_TIMESTAMP 
       WHERE user_id = $2`,
      [total, userId]
    );

    // Clear the user's cart
    await client.query("DELETE FROM cart_items WHERE user_id = $1", [userId]);

    await client.query('COMMIT');

    // Get updated balance
    const updatedBalanceResult = await client.query(
      "SELECT balance, total_spent FROM user_balance WHERE user_id = $1",
      [userId]
    );

    res.status(201).json({
      message: "Order created successfully",
      order: {
        id: orderId,
        orderNumber: orderNumberGenerated,
        total: total
      },
      balance: {
        remaining: parseFloat(updatedBalanceResult.rows[0].balance),
        totalSpent: parseFloat(updatedBalanceResult.rows[0].total_spent)
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Order creation error:", error);
    console.error("Request body:", req.body);
    res.status(500).json({ error: "Failed to create order" });
  } finally {
    client.release();
  }
});

// Get order details
app.get("/api/orders/:orderId", authenticateToken, async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const userId = req.user.userId;

    const orderResult = await pool.query(
      `SELECT o.*, oi.* FROM orders o 
       LEFT JOIN order_items oi ON o.id = oi.order_id 
       WHERE o.id = $1 AND o.user_id = $2`,
      [orderId, userId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Group order items
    const order = {
      ...orderResult.rows[0],
      items: orderResult.rows.map(row => ({
        product_id: row.product_id,
        product_name: row.product_name,
        product_price: row.product_price,
        quantity: row.quantity,
        subtotal: row.subtotal
      }))
    };

    res.json({ order });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

// Get user's orders
/*app.get("/api/orders", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT id, order_number, total, order_status, created_at 
       FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );

    res.json({ orders: result.rows });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});
*/

// Register Ambassador
app.post("/api/ambassador/register", async (req, res) => {
  const { firstName, lastName, email, password, confirmPassword } = req.body;
  console.log("Got request body:", req.body);

  if (!firstName || !lastName || !email || !password || !confirmPassword) {
    console.log("Missing fields");
    return res.status(400).json({ error: "All fields are required." });
  }

  if (password !== confirmPassword) {
    console.log("Passwords do not match");
    return res.status(400).json({ error: "Passwords do not match." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Password hashed");

    const result = await pool.query(
      `INSERT INTO ambassadors (first_name, last_name, email, password)
       VALUES ($1, $2, $3, $4)
       RETURNING id, first_name, last_name, email, created_at`,
      [firstName, lastName, email, hashedPassword]
    );

    console.log("Ambassador inserted:", result.rows[0]);

    res.status(201).json({ message: "Ambassador registered", ambassador: result.rows[0] });
  } catch (err) {
    console.error("Ambassador registration error:", err);
    res.status(500).json({ error: "Failed to register ambassador" });
  }
});

// Admin login endpoint
app.post("/api/admin/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM admin_users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Admin not found." });
    }

    const admin = result.rows[0];
    if (admin.password !== password) {
      return res.status(401).json({ error: "Incorrect password." });
    }
    // Generate JWT token for admin
    const token = jwt.sign({ adminId: admin.id }, "secret-key", { expiresIn: "2h" });

    res.json({ message: "Admin login successful", token });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/api/order-status", async (req, res) => {
  const { orderNumber, status } = req.body;
  if (!orderNumber || !status) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    await pool.query(
      `UPDATE orders SET order_status = $1, updated_at = CURRENT_TIMESTAMP WHERE order_number = $2`,
      [status, orderNumber]
    );
    res.status(200).json({ message: "Order status updated" });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Failed to update status" });
  }
});

app.get("/api/order-details", async (req, res) => {
  const { orderNumber } = req.query;

  if (!orderNumber) {
    return res.status(400).json({ error: "Missing order number" });
  }

  try {
    const result = await pool.query(
      `SELECT o.*, 
              json_agg(json_build_object(
                'product_id', oi.product_id,
                'product_name', oi.product_name,
                'product_price', oi.price,
                'quantity', oi.quantity,
                'subtotal', oi.subtotal
              )) AS items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.order_number = $1
       GROUP BY o.id`,
      [orderNumber]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({ order: result.rows[0] });
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({ error: "Failed to fetch order details" });
  }
});

app.get("/api/order-history", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await pool.query(
      "SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );

    res.json({ orders: result.rows });
  } catch (error) {
    console.error("Error fetching order history:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET all users for admin dashboard
app.get('/api/admin/users', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        first_name  AS "firstName",
        last_name   AS "lastName",
        email,
        phone,
        address
      FROM users
      ORDER BY id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('GET /api/users error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// DELETE a user by ID -admindashboard
app.delete('/api/admin/users/:id', authenticateToken, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(`DELETE /api/users/${id} error:`, err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

//GET all ambassadors for admin dashboard
app.get('/api/admin/ambassadors', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        first_name  AS "firstName",
        last_name   AS "lastName",
        email
      FROM ambassadors
      ORDER BY id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('GET /api/ambassadors error:', err);
    res.status(500).json({ error: 'Failed to fetch ambassadors' });
  }
});

// DELETE an ambassador by ID - admin dashboard
app.delete('/api/admin/ambassadors/:id', authenticateToken, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const result = await pool.query(
      'DELETE FROM ambassadors WHERE id = $1 RETURNING id',
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Ambassador not found' });
    }
    res.json({ message: 'Ambassador deleted successfully' });
  } catch (err) {
    console.error(`DELETE /api/ambassadors/${id} error:`, err);
    res.status(500).json({ error: 'Failed to delete ambassador' });
  }
});

// Get all products
app.get("/api/admin/products", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        price,
        category,
        description,
        rating,
        image_url AS "imageUrl"
      FROM products
      ORDER BY name
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("GET /api/products error:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Add a new product
app.post("/api/admin/products", authenticateToken, async (req, res) => {
  const { name, price, category, description, image_url } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO products (name, price, category, description, image_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING
         id,
         name,
         price,
         category,
         description,
         rating,
         image_url AS "imageUrl"`,
      [name, price, category, description, image_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST /api/products error:", err);
    res.status(500).json({ error: "Failed to add product" });
  }
});

// Update a product by ID
app.put("/api/admin/products/:id", authenticateToken, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { name, price, category, description, image_url } = req.body;
  try {
    const result = await pool.query(
      `UPDATE products
         SET name        = $1,
             price       = $2,
             category    = $3,
             description = $4,
             image_url   = $5
       WHERE id = $6
       RETURNING
         id,
         name,
         price,
         category,
         description,
         rating,
         image_url AS "imageUrl"`,
      [name, price, category, description, image_url, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("PUT /api/products/:id error:", err);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// Delete a product by ID
app.delete("/api/admin/products/:id", authenticateToken, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const result = await pool.query(
      "DELETE FROM products WHERE id = $1 RETURNING id",
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json({ message: "Product deleted", id: result.rows[0].id });
  } catch (err) {
    console.error("DELETE /api/products/:id error:", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

app.get("/api/admin/packages", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        price,
        category,
        description,
        rating,
        image_url AS "imageUrl"
      FROM packages
      ORDER BY name
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("GET /api/packages error:", err);
    res.status(500).json({ error: "Failed to fetch packages" });
  }
});

// Add a new package with package_items
app.post("/api/admin/packages", authenticateToken, async (req, res) => {
  const { name, price, category, description, image_url, rating, items } = req.body;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const pkgResult = await client.query(
      `INSERT INTO packages (name, price, category, description, image_url, rating)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, price, category, description, rating, image_url AS "imageUrl"`,
      [name, price, category, description, image_url, rating || 0]
    );
    const packageId = pkgResult.rows[0].id;
    if (Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        await client.query(
          `INSERT INTO package_items (package_id, product_id, quantity) VALUES ($1, $2, $3)`,
          [packageId, item.product_id, item.quantity]
        );
      }
    }
    await client.query("COMMIT");
    res.status(201).json(pkgResult.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("POST /api/packages error:", err);
    res.status(500).json({ error: "Failed to add package" });
  } finally {
    client.release();
  }
});

app.get("/api/admin/packages/:id/items", authenticateToken, async (req, res) => {
  const packageId = parseInt(req.params.id, 10);
  try {
    const result = await pool.query(
      `SELECT pi.product_id, p.name AS product_name, pi.quantity
         FROM package_items pi
         JOIN products p ON pi.product_id = p.id
        WHERE pi.package_id = $1`,
      [packageId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /api/admin/packages/:id/items error:", err);
    res.status(500).json({ error: "Failed to fetch package items" });
  }
});

// Update a package by ID
app.put("/api/admin/packages/:id", authenticateToken, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { name, price, category, description, image_url, rating } = req.body;
  try {
    const result = await pool.query(
      `UPDATE packages
         SET name        = $1,
             price       = $2,
             category    = $3,
             description = $4,
             image_url   = $5,
             rating      = $6
       WHERE id = $7
       RETURNING
         id,
         name,
         price,
         category,
         description,
         rating,
         image_url AS "imageUrl"`,
      [name, price, category, description, image_url, rating || 0, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Package not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("PUT /api/packages/:id error:", err);
    res.status(500).json({ error: "Failed to update package" });
  }
});

// Delete a package by ID
app.delete("/api/admin/packages/:id", authenticateToken, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    await pool.query("DELETE FROM package_items WHERE package_id = $1", [id]);
    const result = await pool.query(
      "DELETE FROM packages WHERE id = $1 RETURNING id",
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Package not found" });
    }
    res.json({ message: "Package deleted", id: result.rows[0].id });
  } catch (err) {
    console.error("DELETE /api/packages/:id error:", err);
    res.status(500).json({ error: "Failed to delete package" });
  }
});
