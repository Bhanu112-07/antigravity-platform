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

    const db = await getDb();
    
    const result = await db.run(
      `INSERT INTO orders (
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
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
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

    res.status(201).json({ message: 'Order placed successfully', orderId: result.lastID });
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
