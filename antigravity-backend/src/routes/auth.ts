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
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Phone validation if provided (strict country code requirement)
    if (phone) {
      const phoneStr = String(phone);
      const cleanedPhone = phoneStr.replace(/\D/g, '');
      const phoneRegex = /^\+[0-9]{11,15}$/;
      const regexTarget = phoneStr.replace(/\s/g, '').replace(/-/g, '').replace(/\(/g, '').replace(/\)/g, '').replace(/\./g, '');
      
      if (cleanedPhone.length < 11 || cleanedPhone.length > 15 || !phoneRegex.test(regexTarget)) {
        return res.status(400).json({ error: 'Invalid phone number format. Please provide a valid number with country code (e.g., +91...)' });
      }

      // Indian number specific validation: first digit after +91 must be 6-9
      if (phoneStr.startsWith('+91')) {
        const numberPart = phoneStr.substring(3).replace(/\D/g, '');
        if (!/^[6-9]/.test(numberPart)) {
          return res.status(400).json({ error: 'Indian mobile numbers must start with 6, 7, 8, or 9' });
        }
      }
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
      'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, phone, role]
    );

    const token = jwt.sign({ id: result.lastID, email, role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: result.lastID, name, email, phone, role }
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
    const user = await db.get('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email]);

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
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Get Current User Profile
router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const db = await getDb();
    const user = await db.get('SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?', [req.user.id]);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error retrieving profile' });
  }
});

export default router;
