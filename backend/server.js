import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pg from 'pg';
import 'dotenv/config';

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
        "SELECT id, email, dorm, first_name, last_name, school FROM users WHERE id = $1",
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
    const { email, password, currentPassword, dorm, first_name, last_name, school } = req.body;
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
  
      res.json({ message: "User updated successfully", success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });
  
  app.post("/api/order-updates", async (req, res) => {
    const { orderName, email, update } = req.body;
  
    if (!orderName || !email || !update) {
      return res.status(400).json({ error: "Missing required fields" });
    }
  
    try {
      await pool.query(
        "INSERT INTO order_updates (order_name, email, update_text) VALUES ($1, $2, $3)",
        [orderName, email, update]
      );
      res.status(200).json({ message: "Update saved" });
    } catch (err) {
      console.error("Database insert error:", err);
      res.status(500).json({ error: "Database error" });
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
  

