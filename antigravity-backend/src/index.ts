console.log('--- STARTUP SEQUENCE INITIATED ---');

process.on('uncaughtException', (err) => {
  console.error('CRITICAL UNCAUGHT EXCEPTION:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('CRITICAL UNHANDLED REJECTION at:', promise, 'reason:', reason);
  process.exit(1);
});

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { initDb } from './db';

import authRoutes from './routes/auth';
import productsRoutes from './routes/products';
import ordersRoutes from './routes/orders';
import adminRoutes from './routes/admin';
import reviewsRoutes from './routes/reviews';
import siteRoutes from './routes/site';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/site', siteRoutes);
const uploadsDir = process.env.UPLOAD_DIR 
  ? path.resolve(process.env.UPLOAD_DIR) 
  : path.join(process.cwd(), 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Antigravity API running' });
});

console.log('Attempting to initialize database...');
async function startServer() {
  try {
    await initDb();
    console.log('Database init successful.');
    const server = app.listen(port, () => {
      console.log(`Server fully operational on port ${port}`);
    });
  } catch (err) {
    console.error('CRITICAL STARTUP FAILURE:', err);
    process.exit(1);
  }
}

startServer();
