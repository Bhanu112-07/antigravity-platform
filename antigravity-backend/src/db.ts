import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function getDb() {
  return open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });
}

export async function initDb() {
  const db = await getDb();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      description TEXT,
      price REAL,
      category TEXT,
      image_url TEXT,
      stock INTEGER DEFAULT 0,
      colors TEXT,
      sizes TEXT,
      image_urls TEXT,
      video_url TEXT,
      is_bestseller INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      total_amount REAL,
      status TEXT DEFAULT 'pending',
      items TEXT,
      customer_name TEXT,
      customer_email TEXT,
      customer_phone TEXT,
      shipping_address TEXT,
      city TEXT,
      pin_code TEXT,
      payment_method TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Insert default categories if they don't exist
    INSERT OR IGNORE INTO categories (name) VALUES ('Men'), ('Women'), ('Accessories');

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      user_id INTEGER,
      rating INTEGER NOT NULL,
      comment TEXT,
      user_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(product_id) REFERENCES products(id),
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `);
  console.log('Database initialized.');
}
