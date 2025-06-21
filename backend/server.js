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
      const result = await pool.query("SELECT id, email FROM users WHERE id = $1", [userId]);
  
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


