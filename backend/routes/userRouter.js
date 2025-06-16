import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export default function createUserRouter(pool) {
  const router = express.Router();

  router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    try {
      const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      const hashed = await bcrypt.hash(password, 10);
      const result = await pool.query(
        'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id',
        [email, hashed]
      );

      const token = jwt.sign({ userId: result.rows[0].id }, process.env.SESSION_SECRET);
      res.status(201).json({ message: 'User registered', token });
    } catch (err) {
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      const user = result.rows[0];
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ userId: user.id }, process.env.SESSION_SECRET);
      res.json({ message: 'Login successful', token });
    } catch (err) {
      res.status(500).json({ error: 'Login failed' });
    }
  });

  return router;
}
