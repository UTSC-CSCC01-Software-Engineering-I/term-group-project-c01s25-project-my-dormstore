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
        const token = jwt.sign({ userId: user.id }, "secret-key", { expiresIn: "24h" });
  
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
app.get("/cart", async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      // Authenticated user
      try {
        const user = jwt.verify(token, "secret-key");
        const userId = user.userId;
        
        // Get all cart items (both products and packages)
        const cartResult = await pool.query(
          "SELECT id, product_id, package_id, quantity, selected_size, selected_color, item_type, created_at, updated_at FROM cart_items WHERE user_id = $1 ORDER BY created_at DESC",
          [userId]
        );

        // Check stock for each cart item and remove/adjust items as needed
        const cartItems = [];
        const removedItems = [];
        
        for (const item of cartResult.rows) {
          let productResult, isPackage = false;
          
          // Check if it's a package item
          if (item.item_type === 'package' && item.package_id) {
            productResult = await pool.query(
              "SELECT name, stock FROM packages WHERE id = $1",
              [item.package_id]
            );
            isPackage = true;
          } else if (item.item_type === 'product' && item.product_id) {
            // Check products table
            productResult = await pool.query(
              "SELECT name, stock FROM products WHERE id = $1",
              [item.product_id]
            );
          }
          
          // If no results found, the product/package was deleted
          if (!productResult || productResult.rows.length === 0) {
            await pool.query("DELETE FROM cart_items WHERE id = $1", [item.id]);
            removedItems.push({ 
              name: `${isPackage ? 'Package' : 'Product'} (ID: ${item.package_id || item.product_id})`, 
              reason: `${isPackage ? 'Package' : 'Product'} no longer available` 
            });
            continue;
          }
          
          const product = productResult.rows[0];
          
          if (product.stock === 0) {
            // product/package is out of stock, remove from cart
            await pool.query("DELETE FROM cart_items WHERE id = $1", [item.id]);
            removedItems.push({ name: product.name, reason: "Out of stock" });
          } 
          else if (item.quantity > product.stock) {
            // quantity exceeds available stock, adjust quantity
            await pool.query(
              "UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
              [product.stock, item.id]
            );
            item.quantity = product.stock;
            removedItems.push({ 
              name: product.name, 
              reason: `Quantity adjusted to ${product.stock} (available stock)` 
            });
            cartItems.push(item);
          } else {
            // Add to cart items if stock is sufficient
            cartItems.push(item);
          }
        }
        
        res.json({ 
          cartItems: cartItems,
          removedItems: removedItems
        });
      } catch (jwtError) {
        // Invalid token, treat as guest
        res.json({ 
          cartItems: [],
          removedItems: []
        });
      }
    } else {
      // Guest user - return empty cart
      res.json({ 
        cartItems: [],
        removedItems: []
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve cart items" });
  }
});


// Add item to cart - supports both products and packages
app.post("/cart", authenticateToken, async (req, res) => {
  const userId = req.user.userId; // ✅ verified by middleware
  const { product_id, package_id, quantity = 1, selected_size, selected_color } = req.body;
  console.log("Add to cart body:", req.body);

  try {
    if (!product_id && !package_id) {
      return res.status(400).json({ error: "Product ID or Package ID is required" });
    }
    if (quantity < 1) {
      return res.status(400).json({ error: "Quantity must be at least 1" });
    }

    // Check stock availability
    if (package_id) {
      // Check package stock
      const packageResult = await pool.query(
        "SELECT stock FROM packages WHERE id = $1",
        [package_id]
      );
      
      if (packageResult.rows.length === 0) {
        return res.status(404).json({ error: "Package not found" });
      }
      
      const availableStock = packageResult.rows[0].stock;
      if (quantity > availableStock) {
        return res.status(400).json({ 
          error: "Insufficient package stock", 
          availableStock: availableStock,
          requestedQuantity: quantity,
          maxCanAdd: availableStock
        });
      }
    } else if (product_id) {
      // Check product stock
      let productResult = await pool.query(
        "SELECT stock FROM products WHERE id = $1",
        [product_id]
      );
      
      if (productResult.rows.length === 0) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      const availableStock = productResult.rows[0].stock;
      if (quantity > availableStock) {
        return res.status(400).json({ 
          error: "Insufficient stock", 
          availableStock: availableStock,
          requestedQuantity: quantity,
          maxCanAdd: availableStock
        });
      }
    }

    let existingItemQuery, queryParams, insertQuery, insertParams;

    if (package_id) {
      // Handle package - include size and color handling like products
      existingItemQuery = "SELECT id, quantity FROM cart_items WHERE user_id = $1 AND package_id = $2 AND item_type = 'package'";
      queryParams = [userId, package_id];

      if (selected_size) {
        existingItemQuery += " AND selected_size = $3";
        queryParams.push(selected_size);

        if (selected_color) {
          existingItemQuery += " AND selected_color = $4";
          queryParams.push(selected_color);
        } else {
          existingItemQuery += " AND selected_color IS NULL";
        }
      } else if (selected_color) {
        existingItemQuery += " AND selected_size IS NULL AND selected_color = $3";
        queryParams.push(selected_color);
      } else {
        existingItemQuery += " AND selected_size IS NULL AND selected_color IS NULL";
      }

      insertQuery = "INSERT INTO cart_items (user_id, package_id, quantity, selected_size, selected_color, item_type) VALUES ($1, $2, $3, $4, $5, 'package') RETURNING *";
      insertParams = [userId, package_id, quantity, selected_size || null, selected_color || null];
    } else {
      // Handle product
      existingItemQuery = "SELECT id, quantity FROM cart_items WHERE user_id = $1 AND product_id = $2 AND item_type = 'product'";
      queryParams = [userId, product_id];

      if (selected_size) {
        existingItemQuery += " AND selected_size = $3";
        queryParams.push(selected_size);

        if (selected_color) {
          existingItemQuery += " AND selected_color = $4";
          queryParams.push(selected_color);
        } else {
          existingItemQuery += " AND selected_color IS NULL";
        }
      } else if (selected_color) {
        existingItemQuery += " AND selected_size IS NULL AND selected_color = $3";
        queryParams.push(selected_color);
      } else {
        existingItemQuery += " AND selected_size IS NULL AND selected_color IS NULL";
      }

      insertQuery = "INSERT INTO cart_items (user_id, product_id, quantity, selected_size, selected_color, item_type) VALUES ($1, $2, $3, $4, $5, 'product') RETURNING *";
      insertParams = [userId, product_id, quantity, selected_size || null, selected_color || null];
    }

    const existingItem = await pool.query(existingItemQuery, queryParams);

    if (existingItem.rows.length > 0) {
      // update existing item quantity - check total quantity against stock
      const newQuantity = existingItem.rows[0].quantity + quantity;
      
      // Get the current available stock for validation
      let availableStock;
      if (package_id) {
        const packageResult = await pool.query(
          "SELECT stock FROM packages WHERE id = $1",
          [package_id]
        );
        availableStock = packageResult.rows[0].stock;
      } else {
        const productResult = await pool.query(
          "SELECT stock FROM products WHERE id = $1",
          [product_id]
        );
        availableStock = productResult.rows[0].stock;
      }
      
      // Check if total quantity exceeds available stock
      if (newQuantity > availableStock) {
        return res.status(400).json({ 
          error: "Insufficient stock for total quantity", 
          availableStock: availableStock,
          currentCartQuantity: existingItem.rows[0].quantity,
          requestedQuantity: quantity,
          totalQuantity: newQuantity,
          maxCanAdd: Math.max(0, availableStock - existingItem.rows[0].quantity)
        });
      }
      
      const result = await pool.query(
        "UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
        [newQuantity, existingItem.rows[0].id]
      );

      return res.json({ 
        message: "Cart item updated", 
        cartItem: result.rows[0] 
      });
    } else {
      const result = await pool.query(insertQuery, insertParams);
      return res.status(201).json({ 
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
    if (!quantity || quantity < 0) {
      return res.status(400).json({ error: "Quantity must be at least 0" });
    }

    // If quantity is 0, delete the item
    if (quantity === 0) {
      await pool.query("DELETE FROM cart_items WHERE id = $1 AND user_id = $2", [itemId, userId]);
      return res.json({ 
        message: "Cart item removed", 
        removed: true 
      });
    }

    // Get cart item to check both product_id and package_id
    const cartItemResult = await pool.query(
      "SELECT product_id, package_id, item_type FROM cart_items WHERE id = $1 AND user_id = $2",
      [itemId, userId]
    );
    
    if (cartItemResult.rows.length === 0) {
      return res.status(404).json({ error: "Cart item not found or not authorized" });
    }

    const cartItem = cartItemResult.rows[0];
    let productResult, availableStock;

    // Check stock based on item type
    if (cartItem.item_type === 'package' && cartItem.package_id) {
      productResult = await pool.query(
        "SELECT stock FROM packages WHERE id = $1",
        [cartItem.package_id]
      );
      
      if (productResult.rows.length === 0) {
        return res.status(404).json({ error: "Package not found" });
      }
      
      availableStock = productResult.rows[0].stock;
    } else if (cartItem.item_type === 'product' && cartItem.product_id) {
      productResult = await pool.query(
        "SELECT stock FROM products WHERE id = $1",
        [cartItem.product_id]
      );
      
      if (productResult.rows.length === 0) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      availableStock = productResult.rows[0].stock;
    } else {
      return res.status(400).json({ error: "Invalid cart item type" });
    }

    // Check if requested quantity exceeds available stock
    if (quantity > availableStock) {
      return res.status(400).json({ 
        error: "Insufficient stock", 
        availableStock: availableStock,
        requestedQuantity: quantity,
        maxCanAdd: availableStock
      });
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

// Package cart endpoints - supports both authenticated and guest users
app.post("/package-cart", async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const { package_id, quantity = 1 } = req.body;

    if (!package_id) {
      return res.status(400).json({ error: "Package ID is required" });
    }
    if (quantity < 1) {
      return res.status(400).json({ error: "Quantity must be at least 1" });
    }

    if (token) {
      // Authenticated user
      try {
        const user = jwt.verify(token, "secret-key");
        const userId = user.userId;

        // Check for existing package in cart
        const existingItem = await pool.query(
          "SELECT id, quantity FROM package_cart_items WHERE user_id = $1 AND package_id = $2",
          [userId, package_id]
        );
        
        if (existingItem.rows.length > 0) {
          // update existing item quantity
          const newQuantity = existingItem.rows[0].quantity + quantity;
          const result = await pool.query(
            "UPDATE package_cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
            [newQuantity, existingItem.rows[0].id]
          );
          
          res.json({ 
            message: "Package cart item updated", 
            cartItem: result.rows[0] 
          });
        } else {
          const result = await pool.query(
            "INSERT INTO package_cart_items (user_id, package_id, quantity) VALUES ($1, $2, $3) RETURNING *",
            [userId, package_id, quantity]
          );
          
          res.status(201).json({ 
            message: "Package added to cart", 
            cartItem: result.rows[0] 
          });
        }
      } catch (jwtError) {
        // Invalid token, treat as guest
        res.status(401).json({ error: "Invalid token" });
      }
    } else {
      // Guest user - return success but don't store in database
      res.status(201).json({ 
        message: "Package added to guest cart", 
        cartItem: {
          id: `guest_package_${Date.now()}`,
          package_id: package_id,
          quantity: quantity
        }
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add package to cart" });
  }
});

// Update package cart item quantity
app.put("/package-cart/:itemId", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const itemId = parseInt(req.params.itemId);
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: "Quantity must be at least 1" });
    }

    const result = await pool.query(
      "UPDATE package_cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3 RETURNING *",
      [quantity, itemId, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Package cart item not found or not authorized" });
    }

    res.json({ 
      message: "Package cart item quantity updated", 
      cartItem: result.rows[0] 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update package cart item" });
  }
});

// Remove package from cart
app.delete("/package-cart/:itemId", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const itemId = parseInt(req.params.itemId);

    const result = await pool.query(
      "DELETE FROM package_cart_items WHERE id = $1 AND user_id = $2 RETURNING *",
      [itemId, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Package cart item not found or not authorized" });
    }
    res.json({ 
      message: "Package removed from cart", 
      removedItem: result.rows[0] 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to remove package from cart" });
  }
});

// Clear package cart
app.delete("/package-cart", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      "DELETE FROM package_cart_items WHERE user_id = $1 RETURNING *",
      [userId]
    );

    res.json({ 
      message: "Package cart cleared successfully", 
      removedItems: result.rows,
      itemsRemoved: result.rows.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to clear package cart" });
  }
});


  app.put("/api/user/update", authenticateToken, async (req, res) => {
    const { email, password, currentPassword, dorm, first_name, last_name, school, phone, address, city, province, postal_code } = req.body;
    const userId = req.user.userId;

    if (
      !email && !password && !dorm &&
      !first_name && !last_name && !school &&
      !phone && !address && !city && !province && !postal_code
    ) {
      return res.status(400).json({ error: "No fields provided" });
    }
  
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

  app.get("/api/admin/all-order-updates", async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT 
           id,
           order_number,
           email,
           update_text,
           status,
           created_at
         FROM order_updates
         ORDER BY created_at DESC`
      );
  
      res.json({ data: result.rows });
    } catch (err) {
      console.error("Database fetch error:", err);
      res.status(500).json({ error: "Failed to fetch order updates" });
    }
  });
  
  app.patch("/api/admin/update-status", async (req, res) => {
    const { id, status } = req.body;
    if (!id || !status) {
      return res.status(400).json({ error: "Missing id or status" });
    }
  
    try {
      await pool.query(
        `UPDATE order_updates SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
        [status, id]
      );
      res.json({ message: "Update status updated successfully" });
    } catch (err) {
      console.error("Update status error:", err);
      res.status(500).json({ error: "Failed to update status" });
    }
  });

  app.get('/api/order-tracking', async (req, res) => {
    const { orderNumber, emailOrPhone } = req.query;

    if (!orderNumber || !emailOrPhone) {
      return res.status(400).json({ success: false, message: "Missing order number or email/phone" });
    }
  
    try {
      const result = await pool.query(
        `SELECT * FROM orders 
         WHERE order_number = $1 AND (email = $2 OR phone = $2)`,
        [orderNumber, emailOrPhone]
      );
  
      if (result.rows.length > 0) {
        res.status(200).json({ success: true, data: result.rows[0] }); 
      } else {
        res.status(404).json({ success: false, message: "Order not found" });
      }
    } catch (err) {
      console.error("Tracking error:", err);
      res.status(500).json({ success: false, error: "Server error" });
    }
  });
  

// Products API endpoints
app.get("/api/products", async (req, res) => {
  try {
    const { category } = req.query;
    let query, params;
    
    if (category) {
      query = "SELECT id, name, price, description, rating, image_url, category, size, color, stock, created_at, updated_at FROM products WHERE category = $1 ORDER BY name";
      params = [category];
    } else {

      query = "SELECT id, name, price, description, rating, image_url, category, size, color, stock, created_at, updated_at FROM products ORDER BY name";

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
      "SELECT id, name, price, description, rating, image_url, category, size, color, stock, created_at, updated_at FROM products WHERE id = $1",
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
      "SELECT id, name, price, category, description, rating, image_url, size, color, stock, created_at, updated_at FROM packages ORDER BY category, name"
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
      "SELECT id, name, price, category, description, rating, image_url, size, color, stock, created_at, updated_at FROM packages WHERE id = $1",
      [packageId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Package not found" });
    }
    
    res.json(result.rows[0]);
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
      "SELECT id, name, price, category, description, rating, image_url, size, color, stock, created_at, updated_at FROM packages WHERE id = $1",
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

// Order creation endpoint with balance deduction (supports both authenticated and guest users)
app.post("/api/orders", async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Check if user is authenticated or guest
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    let userId = null;
    
    if (token) {
      try {
        const user = jwt.verify(token, "secret-key");
        userId = user.userId;
      } catch (jwtError) {
        // Invalid token, treat as guest
        userId = null;
      }
    }
    
    // For guest users, we'll create a temporary user or handle differently
    if (!userId) {
      // Guest checkout - create a temporary user or handle without user_id
      console.log('Processing guest checkout...');
    }
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
      shippingMethod,
      shippingCost,
      total,
      billingAddress
    } = req.body;

    // Validate required fields
    if (!email || !firstName || !lastName || !address || !city || !province || !postalCode) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check user balance (only for authenticated users)
    if (userId) {
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
    } else {
      // Guest checkout - skip balance check
      console.log('Guest checkout - skipping balance check');
    }

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create the order
    const orderResult = await client.query(
      `INSERT INTO orders (
        order_number, user_id, email, first_name, last_name, phone,
        address, city, province, postal_code, move_in_date,
        subtotal, tax, shipping, shipping_method, total, payment_method,
        billing_first_name, billing_last_name, billing_address, billing_city, billing_province, billing_postal_code
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
      RETURNING id, order_number`,
      [
        orderNumber, userId, email, firstName, lastName, phone,
        address, city, province, postalCode, moveInDate,
        subtotal, tax, shippingCost || shipping, shippingMethod,
        total, paymentMethod,
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

    // Get cart items (for authenticated users from database, for guests from request body)
    let cartItems = [];
    
    if (userId) {
      // Authenticated user - get from database
      const cartResult = await client.query(
        `SELECT ci.*, 
                ci.item_type,
                p.name as product_name, p.price as product_price,
                pk.name as package_name, pk.price as package_price
         FROM cart_items ci 
         LEFT JOIN products p ON ci.product_id = p.id 
         LEFT JOIN packages pk ON ci.package_id = pk.id 
         WHERE ci.user_id = $1`,
        [userId]
      );
      cartItems = cartResult.rows;
    } else {
      // Guest user - get from request body
      cartItems = req.body.cartItems || [];
      console.log('Guest checkout - using cart items from request body:', cartItems.length, 'items');
    }

    
    // Create order items and reduce inventory
    for (const item of cartItems) {
      if (item.item_type === 'product') {
        const productRes = await client.query("SELECT name, price FROM products WHERE id = $1", [item.product_id]);

        if (productRes.rows.length === 0) {
          throw new Error(`Product with ID ${item.product_id} not found`);
        }

        const { name: product_name, price: product_price } = productRes.rows[0];
        
        // Handle product
        await client.query(
          `INSERT INTO order_items (
            order_id, product_id, product_name, product_price, quantity, subtotal
          ) VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            orderId, item.product_id, item.product_name, item.product_price,
            item.quantity, item.product_price * item.quantity
          ]
        );
        
        // Reduce product stock
        await client.query(
          `UPDATE products 
           SET stock = stock - $1, 
               updated_at = CURRENT_TIMESTAMP 
           WHERE id = $2`,
          [item.quantity, item.product_id]
        );
      } else if (item.item_type === 'package') {
        const packageRes = await client.query("SELECT name, price FROM packages WHERE id = $1", [item.package_id]);

        if (packageRes.rows.length === 0) {
          throw new Error(`Package with ID ${item.package_id} not found`);
        }

        const { name: package_name, price: package_price } = packageRes.rows[0];
      
        // Handle package
        await client.query(
          `INSERT INTO order_packages (
            order_id, package_id, quantity
          ) VALUES ($1, $2, $3)`,
          [orderId, item.package_id, item.quantity]
        );

      }
    }

    // Handle additional packages if they exist in the order data
    if (req.body.packages && req.body.packages.length > 0) {
      for (const packageItem of req.body.packages) {
        // Create order package entry
        await client.query(
          `INSERT INTO order_packages (
            order_id, package_id, quantity
          ) VALUES ($1, $2, $3)`,
          [orderId, packageItem.package_id, packageItem.quantity]
        );
        
        // Package stock will be reduced automatically by the trigger
      }
    }

    // Deduct from user balance and update total spent (only for authenticated users)
    if (userId) {
      await client.query(
        `UPDATE user_balance 
         SET balance = balance - $1, 
             total_spent = total_spent + $1, 
             last_updated = CURRENT_TIMESTAMP 
         WHERE user_id = $2`,
        [total, userId]
      );

      // Clear the user's cart (both products and packages)
      await client.query("DELETE FROM cart_items WHERE user_id = $1", [userId]);
    } else {
      console.log('Guest checkout - skipping balance deduction and cart clearing');
    }

    await client.query('COMMIT');

    // Prepare response
    let response = {
      message: "Order created successfully",
      order: {
        id: orderId,
        orderNumber: orderNumberGenerated,
        total: total,
        shippingMethod: shippingMethod,
        shippingCost: shippingCost || shipping
      }
    };

    // Add balance info for authenticated users
    if (userId) {
      const updatedBalanceResult = await client.query(
        "SELECT balance, total_spent FROM user_balance WHERE user_id = $1",
        [userId]
      );
      
      response.balance = {
        remaining: parseFloat(updatedBalanceResult.rows[0].balance),
        totalSpent: parseFloat(updatedBalanceResult.rows[0].total_spent)
      };
    } else {
      response.message = "Guest order created successfully";
    }

    res.status(201).json(response);

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

app.get("/api/order-details/:orderNumber", async (req, res) => {
  const { orderNumber } = req.params;

  if (!orderNumber) {
    return res.status(400).json({ error: "Missing order number" });
  }

  try {
    const orderRes = await pool.query(
      `SELECT * FROM orders WHERE order_number = $1`,
      [orderNumber]
    );

    if (orderRes.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const order = orderRes.rows[0];

    console.log("Order ID:", order.id);

    const productItems = await pool.query(
      `SELECT 'product' AS item_type, product_name AS name, product_price AS price, quantity
       FROM order_items
       WHERE order_id = $1`,
      [order.id]
    );

    const packageItems = await pool.query(
      `SELECT 'package' AS item_type, p.name, p.price, op.quantity
       FROM order_packages op
       JOIN packages p ON op.package_id = p.id
       WHERE op.order_id = $1`,
      [order.id]
    );

    order.items = [...productItems.rows, ...packageItems.rows];

    res.json({ order });
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

app.delete('/api/admin/users/:id', authenticateToken, async (req, res) => {
  const id = +req.params.id;
  try {
    await pool.query('BEGIN');
    await pool.query('DELETE FROM orders WHERE user_id = $1', [id]);
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );
    if (result.rowCount === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'User not found' });
    }
    await pool.query('COMMIT');
    res.json({ message: 'User and related orders deleted' });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error(`DELETE /api/admin/users/${id} Failed:`, err);
    res.status(500).json({ error: err.detail || 'Failed to delete user' });
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

async function autoUpdatePackageStock(packageId, clientArg) {
  const client = clientArg || (await pool.connect());
  let releaseClient = false;
  if (!clientArg) releaseClient = true;

  try {
    const { rows } = await client.query(`
      SELECT p.stock, pi.quantity
      FROM package_items pi
      JOIN products p ON pi.product_id = p.id
      WHERE pi.package_id = $1
    `, [packageId]);

    if (rows.length === 0) {
      return;
    }

    const minStock = Math.min(...rows.map(r => Math.floor(r.stock / r.quantity)));
    await client.query(`UPDATE packages SET stock = $1 WHERE id = $2`, [minStock, packageId]);
  } catch (err) {
    console.error("autoUpdatePackageStock error:", err);
  } finally {
    if (releaseClient) client.release();
  }
}

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
        image_url AS "imageUrl",
        size,
        color,
        stock,
        active
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
  const { name, price, category, description, image_url, size, color, stock, active } = req.body;
  const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
  try {
    const result = await pool.query(
      `INSERT INTO products (name, price, category, description, image_url, size, color, stock, active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING
         id,
         name,
         price,
         category,
         description,
         rating,
         image_url AS "imageUrl",
         size,
         color,
         stock,
         active`,
      [name, price, formattedCategory, description, image_url, size, color, stock ?? 0, active ?? true]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST /api/products error:", err);
    res.status(500).json({ error: "Failed to add product" });
  }
});

// Admin Dashboard Home Page Endpoints

// Get revenue data for admin dashboard
app.get("/api/admin/revenue", authenticateToken, async (req, res) => {
  const { range } = req.query;
  
  try {
    let dateFilter;
    switch (range) {
      case "7":
        dateFilter = "created_at >= CURRENT_DATE - INTERVAL '7 days'";
        break;
      case "30":
        dateFilter = "created_at >= CURRENT_DATE - INTERVAL '30 days'";
        break;
      case "365":
        dateFilter = "created_at >= CURRENT_DATE - INTERVAL '365 days'";
        break;
      default:
        dateFilter = "created_at >= CURRENT_DATE - INTERVAL '7 days'";
    }

    const result = await pool.query(
      `SELECT 
        COALESCE(SUM(total), 0) as total_revenue,
        COUNT(*) as total_orders,
        COALESCE(AVG(total), 0) as average_order_value
       FROM orders 
       WHERE ${dateFilter}`,
      []
    );

    const revenueData = result.rows[0];
    res.json({
      totalRevenue: parseFloat(revenueData.total_revenue),
      totalOrders: parseInt(revenueData.total_orders),
      averageOrderValue: parseFloat(revenueData.average_order_value),
      timeRange: range
    });
  } catch (error) {
    console.error("Error fetching revenue data:", error);
    res.status(500).json({ error: "Failed to fetch revenue data" });
  }
});

// Get active orders for admin dashboard - matches admin orders page exactly
app.get("/api/admin/orders/active", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        order_number,
        first_name,
        last_name,
        total,
        order_status,
        created_at
       FROM orders 
       ORDER BY created_at DESC 
       LIMIT 10`,
      []
    );

    res.json({
      activeOrders: result.rows.map(order => ({
        orderNumber: order.order_number,
        customerName: `${order.first_name} ${order.last_name}`,
        total: parseFloat(order.total),
        status: order.order_status,
        createdAt: order.created_at
      }))
    });
  } catch (error) {
    console.error("Error fetching active orders:", error);
    res.status(500).json({ error: "Failed to fetch active orders" });
  }
});

// Get dashboard summary data
app.get("/api/admin/dashboard/summary", authenticateToken, async (req, res) => {
  try {
    // Get today's revenue
    const todayRevenue = await pool.query(
      `SELECT COALESCE(SUM(total), 0) as today_revenue
       FROM orders 
       WHERE DATE(created_at) = CURRENT_DATE AND payment_status = 'completed'`,
      []
    );

    // Get total orders today
    const todayOrders = await pool.query(
      `SELECT COUNT(*) as today_orders
       FROM orders 
       WHERE DATE(created_at) = CURRENT_DATE`,
      []
    );

    // Get pending orders count
    const pendingOrders = await pool.query(
      `SELECT COUNT(*) as pending_count
       FROM orders 
       WHERE order_status IN ('pending', 'processing')`,
      []
    );

    // Get total users
    const totalUsers = await pool.query(
      `SELECT COUNT(*) as user_count FROM users`,
      []
    );

    res.json({
      todayRevenue: parseFloat(todayRevenue.rows[0].today_revenue),
      todayOrders: parseInt(todayOrders.rows[0].today_orders),
      pendingOrders: parseInt(pendingOrders.rows[0].pending_count),
      totalUsers: parseInt(totalUsers.rows[0].user_count)
    });
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    res.status(500).json({ error: "Failed to fetch dashboard summary" });
  }
});

async function updateAllRelatedPackageStocks(productId) {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      `SELECT DISTINCT package_id FROM package_items WHERE product_id = $1`,
      [productId]
    );

    for (const row of rows) {
      await autoUpdatePackageStock(row.package_id);
    }
  } catch (err) {
    console.error("updateAllRelatedPackageStocks error:", err);
  } finally {
    client.release();
  }
}

// PUT route
app.put("/api/admin/products/:id", authenticateToken, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const {
    name,
    price,
    category,
    description,
    image_url,
    size,
    color,
    stock,
    active
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE products
         SET name = $1,
             price = $2,
             category = $3,
             description = $4,
             image_url = $5,
             size = $6,
             color = $7,
             stock = $8,
             active = $9
       WHERE id = $10
       RETURNING id, name, price, category, description, rating,
                 image_url AS "imageUrl", size, color, stock, active`,
      [name, price, category, description, image_url, size, color, stock ?? 0, active ?? true, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    await updateAllRelatedPackageStocks(id);

    res.json(result.rows[0]);
  } catch (err) {
    console.error("PUT /api/admin/products/:id error:", err);
    res.status(500).json({ error: "Failed to update product" });
  }
});


// Get all packages
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
        image_url AS "imageUrl",
        size,
        color,
        stock,
        active
      FROM packages
      ORDER BY name
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("GET /api/packages error:", err);
    res.status(500).json({ error: "Failed to fetch packages" });
  }
});

app.post("/api/admin/packages", authenticateToken, async (req, res) => {
  const {
    name, price, category, description, image_url,
    rating, size, color, stock, active, items
  } = req.body;

  const cleanedItems = Array.isArray(items)
    ? items
        .filter(x => x && x.product_id && x.quantity > 0)
        .map(x => ({
          product_id: Number(x.product_id),
          quantity: Number(x.quantity)
        }))
    : [];

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const useAutoStock = cleanedItems.length > 0;
    const pkgResult = await client.query(
      `INSERT INTO packages
         (name, price, category, description, image_url, rating, size, color, stock, active)
       VALUES
         ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING
         id, name, price, category, description, rating,
         image_url AS "imageUrl", size, color, stock, active`,
      [
        name,
        price,
        category,
        description,
        image_url,
        rating || 0,
        size,
        color,
        useAutoStock ? 0 : stock ?? 0, 
        active ?? true
      ]
    );

    const packageId = pkgResult.rows[0].id;
    if (useAutoStock) {
      for (const item of cleanedItems) {
        await client.query(
          `INSERT INTO package_items (package_id, product_id, quantity)
           VALUES ($1, $2, $3)`,
          [packageId, item.product_id, item.quantity]
        );
      }

      await autoUpdatePackageStock(packageId, client);
    }

    await client.query("COMMIT");
    const finalResult = await pool.query(
      `SELECT id, name, price, category, description, rating,
              image_url AS "imageUrl", size, color, stock, active
         FROM packages WHERE id = $1`,
      [packageId]
    );

    res.status(201).json(finalResult.rows[0]);

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("POST /api/packages error:", err);
    res.status(500).json({ error: "Failed to add package" });
  } finally {
    client.release();
  }
});


// Get all products in a package
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

app.put("/api/admin/packages/:id", authenticateToken, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  let {
    name, price, category, description, image_url,
    rating, size, color, stock, active, items
  } = req.body;
  if (!Array.isArray(items)) items = [];
  items = items
    .filter(x => x && x.product_id && x.quantity > 0)
    .map(x => ({
      product_id: Number(x.product_id),
      quantity: Number(x.quantity)
    }));

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query(
      `UPDATE packages
         SET name        = $1,
             price       = $2,
             category    = $3,
             description = $4,
             image_url   = $5,
             rating      = $6,
             size        = $7,
             color       = $8,
             stock       = $9,
             active      = $10
       WHERE id = $11
       RETURNING
         id, name, price, category, description, rating,
         image_url AS "imageUrl", size, color, stock, active`,
      [name, price, category, description, image_url, rating || 0, size, color, stock ?? 0, active ?? true, id]
    );
    if (result.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Package not found" });
    }
    await client.query("DELETE FROM package_items WHERE package_id = $1", [id]);
    for (const item of items) {
      await client.query(
        `INSERT INTO package_items (package_id, product_id, quantity)
         VALUES ($1, $2, $3)`,
        [id, item.product_id, item.quantity]
      );
    }
    await client.query("COMMIT");
    await autoUpdatePackageStock(id);

    res.json(result.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("PUT /api/packages/:id error:", err);
    res.status(500).json({ error: "Failed to update package" });
  } finally {
    client.release();
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

app.put("/api/admin/packages/:id/stock", authenticateToken, async (req, res) => {
  const packageId = parseInt(req.params.id, 10);

  const itemsResult = await pool.query(
    `SELECT product_id, quantity FROM package_items WHERE package_id = $1`,
    [packageId]
  );

  if (itemsResult.rows.length === 0) {
    const { stock } = req.body;
    if (stock === undefined || isNaN(Number(stock)) || stock < 0) {
      return res.status(400).json({ error: "Invalid stock value." });
    }
    const update = await pool.query(
      `UPDATE packages SET stock = $1 WHERE id = $2 RETURNING id, stock`,
      [Number(stock), packageId]
    );
    return res.json(update.rows[0]);
  }

  const productIds = itemsResult.rows.map(row => row.product_id);
  const stockResult = await pool.query(
    `SELECT id, stock FROM products WHERE id = ANY($1)`,
    [productIds]
  );
  const stockMap = {};
  for (const row of stockResult.rows) stockMap[row.id] = Number(row.stock);

  let maxPossible = Infinity;
  for (const item of itemsResult.rows) {
    const pStock = stockMap[item.product_id];
    if (pStock === undefined) {
      return res.status(400).json({ error: `Product id ${item.product_id} not found` });
    }
    const need = Number(item.quantity);
    if (!need) return res.status(400).json({ error: "Invalid package item quantity" });
    const canMake = Math.floor(pStock / need);
    if (canMake < maxPossible) maxPossible = canMake;
  }

  const update = await pool.query(
    `UPDATE packages SET stock = $1 WHERE id = $2 RETURNING id, stock`,
    [maxPossible, packageId]
  );
  res.json({ ...update.rows[0], message: `Stock auto-set to max possible: ${maxPossible}` });
});

// Delete a product by ID
app.delete("/api/admin/products/:id", authenticateToken, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const pkgIdsResult = await pool.query(
      `SELECT DISTINCT package_id FROM package_items WHERE product_id = $1`, [id]
    );
    const result = await pool.query(
      "DELETE FROM products WHERE id = $1 RETURNING id", [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    for (const row of pkgIdsResult.rows) {
      await autoUpdatePackageStock(row.package_id);
    }
    res.json({ message: "Product deleted", id: result.rows[0].id });
  } catch (err) {
    console.error("DELETE /api/products/:id error:", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});


// GET /api/orders
app.get('/api/admin/orders', async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = `
      SELECT
        o.id, o.order_number, o.email, o.first_name, o.last_name, o.phone,
        o.address, o.city, o.province, o.postal_code, o.move_in_date,
        o.shipping, o.shipping_method, o.payment_status, o.order_status
      FROM orders o
      WHERE 1=1
    `;
    const params = [];
    let paramIdx = 1;

    if (status && status !== 'All') {
      query += ` AND o.order_status = $${paramIdx++}`;
      params.push(status);
    }
    
    if (search && search.trim().length > 0) {
      query += ` AND (
        LOWER(o.order_number) LIKE $${paramIdx} OR
        LOWER(o.first_name) LIKE $${paramIdx} OR
        LOWER(o.last_name) LIKE $${paramIdx} OR
        LOWER(o.email) LIKE $${paramIdx} OR
        LOWER(o.address) LIKE $${paramIdx} OR
        LOWER(o.city) LIKE $${paramIdx} OR
        LOWER(o.province) LIKE $${paramIdx} OR
        LOWER(o.postal_code) LIKE $${paramIdx} OR
        LOWER(o.order_status) LIKE $${paramIdx} OR
        LOWER(o.payment_status) LIKE $${paramIdx}
      )`;
      params.push(`%${search.toLowerCase()}%`);
      paramIdx++;
    }
    query += ' ORDER BY o.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// GET /api/admin/orders/:id
app.get("/api/admin/orders/:id", async (req, res) => {
  const orderId = parseInt(req.params.id, 10);
  if (!orderId) return res.status(400).json({ error: "Missing order id" });

  try {
    const orderResult = await pool.query(
      `SELECT * FROM orders WHERE id = $1`,
      [orderId]
    );
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }
    const order = orderResult.rows[0];

    // Get order_items (products)
    const itemsResult = await pool.query(
      `SELECT product_id, product_name, product_price, quantity, subtotal
       FROM order_items WHERE order_id = $1 ORDER BY id ASC`,
      [orderId]
    );

    // Get order_packages (packages)
    const packagesResult = await pool.query(
      `SELECT
         op.package_id,
         p.name AS package_name,
         p.price AS package_price,
         op.quantity,
         (p.price * op.quantity) AS subtotal
       FROM order_packages op
       JOIN packages p ON op.package_id = p.id
       WHERE op.order_id = $1
       ORDER BY op.id ASC`,
      [orderId]
    );

    res.json({
      ...order,
      items: itemsResult.rows,
      packages: packagesResult.rows
    });
  } catch (err) {
    console.error("Error fetching order:", err);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});


// GET /api/admin/order_items?order_id=1
app.get('/api/admin/order_items', async (req, res) => {
  const { order_id } = req.query;
  if (!order_id) return res.status(400).json({ error: "Missing order_id parameter" });

  try {
    const result = await pool.query(
      `SELECT product_id, product_name, product_price, quantity, subtotal
       FROM order_items WHERE order_id = $1 ORDER BY id ASC`,
      [order_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching order_items:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// PUT /api/orders/:id/status
app.put("/api/admin/orders/:id/status", async (req, res) => {
  const orderId = parseInt(req.params.id, 10);
  const { order_status } = req.body;

  if (!orderId || !order_status) {
    return res.status(400).json({ error: "Missing order id or status" });
  }

  try {
    await pool.query(
      `UPDATE orders SET order_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [order_status, orderId]
    );
    res.json({ message: "Order status updated" });
  } catch (err) {
    console.error("Error updating order status:", err);
    res.status(500).json({ error: "Failed to update order status" });
  }
});

app.get("/api/admin/revenue", authenticateToken, async (req, res) => {
  const { range } = req.query;
  
  try {
    let dateFilter;
    switch (range) {
      case "7":
        dateFilter = "created_at >= CURRENT_DATE - INTERVAL '7 days'";
        break;
      case "30":
        dateFilter = "created_at >= CURRENT_DATE - INTERVAL '30 days'";
        break;
      case "365":
        dateFilter = "created_at >= CURRENT_DATE - INTERVAL '365 days'";
        break;
      default:
        dateFilter = "created_at >= CURRENT_DATE - INTERVAL '7 days'";
    }

    const result = await pool.query(
      `SELECT 
        COALESCE(SUM(total), 0) as total_revenue,
        COUNT(*) as total_orders,
        COALESCE(AVG(total), 0) as average_order_value
       FROM orders 
       WHERE ${dateFilter}`,
      []
    );

    const revenueData = result.rows[0];
    res.json({
      totalRevenue: parseFloat(revenueData.total_revenue),
      totalOrders: parseInt(revenueData.total_orders),
      averageOrderValue: parseFloat(revenueData.average_order_value),
      timeRange: range
    });
  } catch (error) {
    console.error("Error fetching revenue data:", error);
    res.status(500).json({ error: "Failed to fetch revenue data" });
  }
});

// Get active orders for admin dashboard
app.get("/api/admin/orders/active", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        order_number,
        first_name,
        last_name,
        total,
        order_status,
        created_at
       FROM orders 
       WHERE order_status IN ('processing', 'pending', 'shipping')
       ORDER BY created_at DESC 
       LIMIT 10`,
      []
    );

    res.json({
      activeOrders: result.rows.map(order => ({
        orderNumber: order.order_number,
        customerName: `${order.first_name} ${order.last_name}`,
        total: parseFloat(order.total),
        status: order.order_status,
        createdAt: order.created_at
      }))
    });
  } catch (error) {
    console.error("Error fetching active orders:", error);
    res.status(500).json({ error: "Failed to fetch active orders" });
  }
});

// Get dashboard summary data
app.get("/api/admin/dashboard/summary", authenticateToken, async (req, res) => {
  try {
    // Get today's revenue
    const todayRevenue = await pool.query(
      `SELECT COALESCE(SUM(total), 0) as today_revenue
       FROM orders 
       WHERE DATE(created_at) = CURRENT_DATE AND payment_status = 'completed'`,
      []
    );

    // Get total orders today
    const todayOrders = await pool.query(
      `SELECT COUNT(*) as today_orders
       FROM orders 
       WHERE DATE(created_at) = CURRENT_DATE`,
      []
    );

    // Get pending orders count
    const pendingOrders = await pool.query(
      `SELECT COUNT(*) as pending_count
       FROM orders 
       WHERE order_status IN ('pending', 'processing')`,
      []
    );

    // Get total users
    const totalUsers = await pool.query(
      `SELECT COUNT(*) as user_count FROM users`,
      []
    );

    res.json({
      todayRevenue: parseFloat(todayRevenue.rows[0].today_revenue),
      todayOrders: parseInt(todayOrders.rows[0].today_orders),
      pendingOrders: parseInt(pendingOrders.rows[0].pending_count),
      totalUsers: parseInt(totalUsers.rows[0].user_count)
    });
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    res.status(500).json({ error: "Failed to fetch dashboard summary" });
  }
});


if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

export { pool };
export default app;