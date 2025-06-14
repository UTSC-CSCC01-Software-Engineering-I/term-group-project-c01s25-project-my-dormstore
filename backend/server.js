import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;
const app = express();
const PORT = 5000;

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


