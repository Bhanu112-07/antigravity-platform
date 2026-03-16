import { Pool } from 'pg';
import dotenv from 'dotenv';

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

    -- Insert default categories if they don't exist
    INSERT INTO categories (name) VALUES ('Men'), ('Women'), ('Accessories')
    ON CONFLICT (name) DO NOTHING;

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
  console.log('Database initialized.');
}
