import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../db';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'antigravity-secret-key-123';

// Register User
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = await getDb();
    
    // Check if user exists
    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // the first user registered is automatically an admin for testing purposes
    const countRes = await db.get('SELECT COUNT(*) as count FROM users');
    const role = countRes.count === 0 ? 'admin' : 'user';

    // Insert user
    const result = await db.run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );

    const token = jwt.sign({ id: result.lastID, email, role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: result.lastID, name, email, role }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    const db = await getDb();
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Logged in successfully',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Get Current User Profile
router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const db = await getDb();
    const user = await db.get('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [req.user.id]);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error retrieving profile' });
  }
});

export default router;
