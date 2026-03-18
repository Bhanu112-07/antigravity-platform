import express from 'express';
import { getDb } from '../db';
import { authenticateAdmin } from '../middleware/auth';
import { productUpload } from '../middleware/upload';

const router = express.Router();

// Get all products (Public)
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    const db = await getDb();
    
    let query = 'SELECT * FROM products WHERE 1=1';
    const params: any[] = [];
    
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    
    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC';

    const products = await db.all(query, params);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching products' });
  }
});

// Get single product (Public)
router.get('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const product = await db.get('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching product' });
  }
});

// Create Product (Admin Only)
router.post('/', authenticateAdmin, productUpload, async (req, res) => {
  try {
    const { name, description, price, category, stock, colors, sizes, existing_image_urls, video_url, is_bestseller } = req.body;
    
    // Parse any pre-existing URLs handed from frontend
    let imageUrls: string[] = [];
    if (existing_image_urls) {
      try {
        imageUrls = JSON.parse(existing_image_urls);
      } catch (e) {
        imageUrls = typeof existing_image_urls === 'string' ? [existing_image_urls] : existing_image_urls;
      }
    }

    // Add new uploaded files
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    if (files && files['images']) {
      files['images'].forEach((f: any) => {
        imageUrls.push(f.path);
      });
    }

    let final_video_url = video_url || '';
    if (files && files['video'] && files['video'].length > 0) {
      final_video_url = files['video'][0].path;
    }

    // Fallback logic for single initial image for backward compatibility
    let primary_image_url = imageUrls.length > 0 ? imageUrls[0] : req.body.image_url;
    if (req.body.image_url && !imageUrls.includes(req.body.image_url)) {
      imageUrls.push(req.body.image_url);
      if (!primary_image_url) primary_image_url = req.body.image_url;
    }

    if (!name || isNaN(price)) {
      return res.status(400).json({ error: 'Invalid product data: name and numeric price are required' });
    }

    const db = await getDb();
    const result = await db.run(
      'INSERT INTO products (name, description, price, category, image_url, stock, colors, sizes, image_urls, video_url, is_bestseller) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, description, Number(price), category, primary_image_url, Number(stock) || 0, colors || '', sizes || '', JSON.stringify(imageUrls), final_video_url, Number(is_bestseller) || 0]
    );

    res.status(201).json({ message: 'Product created', productId: result.lastID });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating product' });
  }
});

// Update Product (Admin Only)
router.put('/:id', authenticateAdmin, productUpload, async (req, res) => {
  try {
    const { name, description, price, category, stock, colors, sizes, existing_image_urls, video_url, is_bestseller } = req.body;
    
    // Parse any pre-existing URLs handed from frontend
    let imageUrls: string[] = [];
    if (existing_image_urls) {
      try {
        imageUrls = JSON.parse(existing_image_urls);
      } catch (e) {
        imageUrls = typeof existing_image_urls === 'string' ? [existing_image_urls] : existing_image_urls;
      }
    }

    // Add new uploaded files
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    if (files && files['images']) {
      files['images'].forEach((f: any) => {
        imageUrls.push(f.path);
      });
    }

    let final_video_url = video_url || '';
    if (files && files['video'] && files['video'].length > 0) {
      final_video_url = files['video'][0].path;
    }

    let primary_image_url = imageUrls.length > 0 ? imageUrls[0] : req.body.image_url;
    
    const db = await getDb();
    
    await db.run(
      'UPDATE products SET name = ?, description = ?, price = ?, category = ?, image_url = ?, stock = ?, colors = ?, sizes = ?, image_urls = ?, video_url = ?, is_bestseller = ? WHERE id = ?',
      [name, description, Number(price), category, primary_image_url, Number(stock) || 0, colors || '', sizes || '', JSON.stringify(imageUrls), final_video_url, Number(is_bestseller) || 0, req.params.id]
    );

    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error updating product' });
  }
});

// Delete Product (Admin Only)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    console.log('Attempting to delete product with ID:', req.params.id);
    const db = await getDb();
    const result = await db.run('DELETE FROM products WHERE id = ?', [req.params.id]);
    
    if (result && result.changes === 0) {
      console.warn('Product deletion attempt: No such ID found.');
      return res.status(404).json({ error: 'Product not found' });
    }
    
    console.log('Product deleted successfully');
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Error deleting product' });
  }
});

export default router;
