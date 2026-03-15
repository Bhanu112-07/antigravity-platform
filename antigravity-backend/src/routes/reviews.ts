import express from 'express';
import { getDb } from '../db';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Get reviews for a product
router.get('/:productId', async (req, res) => {
  try {
    const db = await getDb();
    const reviews = await db.all(
      'SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC',
      [req.params.productId]
    );
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching reviews' });
  }
});

// Post a review
router.post('/', authenticate, async (req, res) => {
  try {
    const { product_id, rating, comment } = req.body;
    const user_id = (req as any).user.id;
    const user_name = (req as any).user.name;

    if (!product_id || !rating) {
      return res.status(400).json({ error: 'Product ID and rating are required' });
    }

    const db = await getDb();
    
    // Check if user has purchased the product
    const orders = await db.all(
      'SELECT items FROM orders WHERE user_id = ?',
      [user_id]
    );

    const hasPurchased = orders.some(order => {
      try {
        const items = JSON.parse(order.items);
        return items.some((item: any) => String(item.product_id) === String(product_id));
      } catch (e) {
        return false;
      }
    });

    if (!hasPurchased) {
      return res.status(403).json({ error: 'You must purchase the product before reviewing it' });
    }

    // Check if user already reviewed this product
    const existingReview = await db.get(
      'SELECT * FROM reviews WHERE product_id = ? AND user_id = ?',
      [product_id, user_id]
    );

    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this product' });
    }

    await db.run(
      'INSERT INTO reviews (product_id, user_id, rating, comment, user_name) VALUES (?, ?, ?, ?, ?)',
      [product_id, user_id, rating, comment, user_name]
    );

    res.status(201).json({ message: 'Review added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error adding review' });
  }
});

export default router;
