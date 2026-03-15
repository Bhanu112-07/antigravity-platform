import express from 'express';
import { getDb } from '../db';
import { authenticateAdmin } from '../middleware/auth';
import { ShiprocketService } from '../services/shiprocket';

const router = express.Router();

// Admin Dashboard Stats
router.get('/stats', authenticateAdmin, async (req, res) => {
  try {
    const db = await getDb();
    
    const usersCount = await db.get('SELECT COUNT(*) as count FROM users');
    const productsCount = await db.get('SELECT COUNT(*) as count FROM products');
    const ordersCount = await db.get('SELECT COUNT(*) as count FROM orders');
    const totalRevenue = await db.get('SELECT SUM(total_amount) as revenue FROM orders WHERE status != "cancelled"');

    res.json({
      users: usersCount.count,
      products: productsCount.count,
      orders: ordersCount.count,
      revenue: totalRevenue.revenue || 0
    });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching admin stats' });
  }
});

// Get All Orders for Admin
router.get('/orders', authenticateAdmin, async (req, res) => {
  try {
    const db = await getDb();
    const orders = await db.all(`
      SELECT o.*, u.name as user_name, u.email as user_email 
      FROM orders o 
      LEFT JOIN users u ON o.user_id = u.id 
      ORDER BY o.created_at DESC
    `);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching orders' });
  }
});

// Update Order Status
router.put('/orders/:id/status', authenticateAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const db = await getDb();
    
    await db.run('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Order status updated' });
  } catch (err) {
    res.status(500).json({ error: 'Error updating order status' });
  }
});

// Delete Order
router.delete('/orders/:id', authenticateAdmin, async (req, res) => {
  try {
    const db = await getDb();
    await db.run('DELETE FROM orders WHERE id = ?', [req.params.id]);
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting order' });
  }
});

// Ship Order via Shiprocket
router.post('/orders/:id/ship', authenticateAdmin, async (req, res) => {
  try {
    const db = await getDb();
    const order = await db.get('SELECT * FROM orders WHERE id = ?', [req.params.id]);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.shiprocket_order_id) {
      return res.status(400).json({ error: 'Order already shipped via Shiprocket' });
    }

    const items = JSON.parse(order.items);
    const orderItems = items.map((item: any) => ({
      name: item.name,
      sku: String(item.id || item.name).substring(0, 50),
      units: item.quantity,
      selling_price: item.price
    }));

    const shiprocketOrder = await ShiprocketService.createOrder({
      order_id: order.id,
      order_date: new Date(order.created_at).toISOString().split('T')[0],
      pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary',
      billing_customer_name: order.customer_name.split(' ')[0] || 'Customer',
      billing_last_name: order.customer_name.split(' ').slice(1).join(' ') || '.',
      billing_address: order.shipping_address,
      billing_city: order.city,
      billing_pincode: order.pin_code,
      billing_state: 'India', // Usually required, but placeholders used
      billing_country: 'India',
      billing_email: order.customer_email,
      billing_phone: order.customer_phone.replace('+', ''), // Shiprocket usually wants just digits
      shipping_is_billing: true,
      order_items: orderItems,
      payment_method: order.payment_method === 'COD' ? 'COD' : 'Prepaid',
      sub_total: order.total_amount,
      length: 10,
      breadth: 10,
      height: 10,
      weight: 0.5
    });

    await db.run(
      'UPDATE orders SET shiprocket_order_id = ?, shiprocket_shipment_id = ?, status = ? WHERE id = ?',
      [shiprocketOrder.order_id, shiprocketOrder.shipment_id, 'shipped', order.id]
    );

    res.json({ message: 'Order shipped via Shiprocket', shiprocketOrder });
  } catch (err: any) {
    console.error('Shiprocket Error:', err);
    res.status(500).json({ error: err.message || 'Error shipping order via Shiprocket' });
  }
});

// Categories Management
router.get('/categories', async (req, res) => {
  try {
    const db = await getDb();
    const categories = await db.all('SELECT * FROM categories ORDER BY name ASC');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching categories' });
  }
});

router.post('/categories', authenticateAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required' });
    
    const db = await getDb();
    await db.run('INSERT INTO categories (name, description) VALUES (?, ?)', [name, description]);
    res.status(201).json({ message: 'Category added' });
  } catch (err: any) {
    if (err.message?.includes('UNIQUE')) {
      return res.status(400).json({ error: 'Category already exists' });
    }
    res.status(500).json({ error: 'Error adding category' });
  }
});

router.delete('/categories/:id', authenticateAdmin, async (req, res) => {
  try {
    const db = await getDb();
    await db.run('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting category' });
  }
});

export default router;
