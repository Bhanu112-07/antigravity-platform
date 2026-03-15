import express from 'express';
import { getDb } from '../db';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';

const router = express.Router();

// Create Order (Checkout)
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { 
      items, 
      total_amount, 
      customer_name, 
      customer_email, 
      customer_phone, 
      shipping_address, 
      city, 
      pin_code,
      payment_method 
    } = req.body; 
    const userId = req.user.id;

    if (!items || items.length === 0 || !total_amount) {
      return res.status(400).json({ error: 'Invalid order data' });
    }

    if (!customer_email || !customer_phone) {
      return res.status(400).json({ error: 'Email and phone number are required' });
    }

    // Strict phone number validation (requiring country code)
    const phoneStr = String(customer_phone);
    const cleanedPhone = phoneStr.replace(/\D/g, ''); 
    const phoneRegex = /^\+[0-9]{11,15}$/;
    
    // Validate against the regex on a version that preserves + but removes other fluff
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

    // Generate random unique order ID
    const randomId = `RARE-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const db = await getDb();
    
    await db.run(
      `INSERT INTO orders (
        id,
        user_id, 
        total_amount, 
        items, 
        status, 
        customer_name, 
        customer_email, 
        customer_phone, 
        shipping_address, 
        city, 
        pin_code,
        payment_method
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        randomId,
        userId, 
        total_amount, 
        JSON.stringify(items), 
        'pending',
        customer_name,
        customer_email,
        customer_phone,
        shipping_address,
        city,
        pin_code,
        payment_method
      ]
    );

    res.status(201).json({ message: 'Order placed successfully', orderId: randomId });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ error: 'Error processing order' });
  }
});

// Get User's Orders
router.get('/my-orders', authenticate, async (req: AuthRequest, res) => {
  try {
    const db = await getDb();
    const orders = await db.all('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching orders' });
  }
});

// Note: Admin routes to manage orders will be in admin.ts

export default router;
