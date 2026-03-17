import express from 'express';
import { getDb } from '../db';
import { authenticateAdmin } from '../middleware/auth';
import multer from 'multer';
import path from 'path';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_DIR || 'uploads/';
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => cb(null, 'fab_' + Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Get FAB section config (Public)
router.get('/fab', async (req, res) => {
  try {
    const db = await getDb();
    const result = await db.get("SELECT value FROM site_configs WHERE key = 'fab_section'");
    if (!result) return res.status(404).json({ error: 'Config not found' });
    res.json(JSON.parse(result.value));
  } catch (err) {
    res.status(500).json({ error: 'Error fetching FAB config' });
  }
});

// Update FAB section config (Admin Only)
router.post('/fab', authenticateAdmin, upload.single('video'), async (req, res) => {
  try {
    const { title, stat1_title, stat1_subtitle, stat2_title, stat2_subtitle, existing_video_url } = req.body;
    const db = await getDb();
    
    let video_url = existing_video_url || '';
    if (req.file) {
      video_url = `/uploads/${req.file.filename}`;
    }

    const value = JSON.stringify({
      title,
      stat1_title,
      stat1_subtitle,
      stat2_title,
      stat2_subtitle,
      video_url
    });

    await db.run("INSERT INTO site_configs (key, value) VALUES ('fab_section', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value", [value]);
    
    // Fallback for SQLite without ON CONFLICT (if needed, but our dbWrapper handles Pg/SQLite)
    // Actually sqlite3 doesn't support ON CONFLICT(key) DO UPDATE natively in this exact syntax in all versions, 
    // but the wrapper might handle it if we are using Postgres. 
    // Let's check SQLite compatibility.
    
    res.json({ message: 'FAB section updated successfully', video_url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating FAB config' });
  }
});

// For SQLite compatibility in the route since we don't know the DB type here easily
router.post('/fab/sqlite', authenticateAdmin, upload.single('video'), async (req, res) => {
    try {
      const { title, stat1_title, stat1_subtitle, stat2_title, stat2_subtitle, existing_video_url } = req.body;
      const db = await getDb();
      
      let video_url = existing_video_url || '';
      if (req.file) {
        video_url = `/uploads/${req.file.filename}`;
      }
  
      const value = JSON.stringify({
        title,
        stat1_title,
        stat1_subtitle,
        stat2_title,
        stat2_subtitle,
        video_url
      });
  
      const existing = await db.get("SELECT key FROM site_configs WHERE key = 'fab_section'");
      if (existing) {
          await db.run("UPDATE site_configs SET value = ? WHERE key = 'fab_section'", [value]);
      } else {
          await db.run("INSERT INTO site_configs (key, value) VALUES ('fab_section', ?)", [value]);
      }
      
      res.json({ message: 'FAB section updated successfully', video_url });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error updating FAB config' });
    }
  });

export default router;
