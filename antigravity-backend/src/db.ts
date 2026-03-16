import { Pool } from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Compatibility layer for SQLite-like API
export const dbWrapper = {
  get: async (sql: string, params: any[] = []) => {
    let count = 1;
    const pgSql = sql.replace(/\?/g, () => `$${count++}`);
    const res = await pool.query(pgSql, params);
    return res.rows[0];
  },
  all: async (sql: string, params: any[] = []) => {
    let count = 1;
    const pgSql = sql.replace(/\?/g, () => `$${count++}`);
    const res = await pool.query(pgSql, params);
    return res.rows;
  },
  run: async (sql: string, params: any[] = []) => {
    let count = 1;
    // For INSERTs, append RETURNING id to get lastID behavior
    let pgSql = sql.replace(/\?/g, () => `$${count++}`);
    if (pgSql.trim().toUpperCase().startsWith('INSERT')) {
      pgSql += ' RETURNING id';
    }
    const res = await pool.query(pgSql, params);
    return { lastID: res.rows[0]?.id || null };
  },
  exec: async (sql: string) => {
    return pool.query(sql);
  }
};

export async function getDb() {
  return dbWrapper;
}

export async function initDb() {
  await dbWrapper.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      phone TEXT,
      role TEXT DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT,
      description TEXT,
      price DECIMAL,
      category TEXT,
      image_url TEXT,
      stock INTEGER DEFAULT 0,
      colors TEXT,
      sizes TEXT,
      image_urls TEXT,
      video_url TEXT,
      is_bestseller INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id VARCHAR(255) PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      total_amount DECIMAL,
      status TEXT DEFAULT 'pending',
      items TEXT,
      customer_name TEXT,
      customer_email TEXT,
      customer_phone TEXT,
      shipping_address TEXT,
      city TEXT,
      pin_code TEXT,
      payment_method TEXT,
      shiprocket_order_id TEXT,
      shiprocket_shipment_id TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      product_id INTEGER NOT NULL REFERENCES products(id),
      user_id INTEGER REFERENCES users(id),
      rating INTEGER NOT NULL,
      comment TEXT,
      user_name TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Auto-seed categories
  await dbWrapper.exec(`
    INSERT INTO categories (name) VALUES ('Men'), ('Women'), ('Accessories')
    ON CONFLICT (name) DO NOTHING;
  `);

  // Auto-seed Admin User if no users exist
  const userCount = await dbWrapper.get('SELECT COUNT(*) as count FROM users');
  if (parseInt(userCount.count) === 0) {
    const hashedPassword = await bcrypt.hash('demo123', 10);
    await dbWrapper.run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Demo Admin', 'Demo@gmail.com', hashedPassword, 'admin']
    );
    console.log('Seeded Admin User: Demo@gmail.com / demo123');
  }

  // Auto-seed Products if no products exist
  const productCount = await dbWrapper.get('SELECT COUNT(*) as count FROM products');
  if (parseInt(productCount.count) === 0) {
    const mockProducts = [
      { name: 'Nebula Hoodie', description: 'Engineered for zero gravity.', price: 2999, category: 'Men', image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1587&auto=format&fit=crop', stock: 15, is_bestseller: 1 },
      { name: 'Horizon Cargo', description: 'Premium cyber fit.', price: 3499, category: 'Men', image_url: 'https://images.unsplash.com/photo-1624378439575-d10c6d1774ac?q=80&w=1587&auto=format&fit=crop', stock: 20 },
      { name: 'Lunar Crop Top', description: 'Night sky design.', price: 1299, category: 'Women', image_url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1740&auto=format&fit=crop', stock: 12, is_bestseller: 1 }
    ];
    for (const p of mockProducts) {
      await dbWrapper.run(
        'INSERT INTO products (name, description, price, category, image_url, stock, is_bestseller) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [p.name, p.description, p.price, p.category, p.image_url, p.stock, p.is_bestseller]
      );
    }
    console.log('Seeded Initial Mock Products.');
  }

  console.log('Database initialization complete.');
}
