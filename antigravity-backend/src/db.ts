import { Pool } from 'pg';
import sqlite3 from 'sqlite3';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import path from 'path';

dotenv.config();

let pool: Pool | null = null;
let sqliteDb: sqlite3.Database | null = null;

const databaseUrl = process.env.DATABASE_URL;

if (databaseUrl) {
  pool = new Pool({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });
  console.log('Using PostgreSQL database');
} else {
  const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'database.sqlite');
  sqliteDb = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('CRITICAL: SQLite connection error:', err);
      process.exit(1);
    }
  });
  console.log(`Using SQLite database at ${dbPath}`);
  
  // Try to write to the file to check permissions
  try {
    const fs = require('fs');
    fs.appendFileSync(dbPath, '');
    console.log('Database path is writable.');
  } catch (err) {
    console.error('WARNING: Database path might not be writable:', err);
  }
}

// Compatibility layer for a unified promise-based API
export const dbWrapper = {
  get: async (sql: string, params: any[] = []): Promise<any> => {
    if (pool) {
      let count = 1;
      const pgSql = sql.replace(/\?/g, () => `$${count++}`);
      const res = await pool.query(pgSql, params);
      return res.rows[0];
    } else {
      return new Promise((resolve, reject) => {
        sqliteDb!.get(sql, params, (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
    }
  },
  all: async (sql: string, params: any[] = []): Promise<any[]> => {
    if (pool) {
      let count = 1;
      const pgSql = sql.replace(/\?/g, () => `$${count++}`);
      const res = await pool.query(pgSql, params);
      return res.rows;
    } else {
      return new Promise((resolve, reject) => {
        sqliteDb!.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
    }
  },
  run: async (sql: string, params: any[] = []): Promise<any> => {
    if (pool) {
      let count = 1;
      let pgSql = sql.replace(/\?/g, () => `$${count++}`);
      if (pgSql.trim().toUpperCase().startsWith('INSERT')) {
        pgSql += ' RETURNING id';
      }
      const res = await pool.query(pgSql, params);
      return { lastID: (res.rows[0] as any)?.id || null };
    } else {
      return new Promise((resolve, reject) => {
        sqliteDb!.run(sql, params, function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ lastID: this.lastID, changes: this.changes });
          }
        });
      });
    }
  },
  exec: async (sql: string): Promise<any> => {
    if (pool) {
      return pool.query(sql);
    } else {
      return new Promise((resolve, reject) => {
        sqliteDb!.exec(sql, (err) => {
          if (err) reject(err);
          else resolve(null);
        });
      });
    }
  }
};

export async function getDb() {
  return dbWrapper;
}

export async function initDb() {
  console.log('Starting initDb...');
  const isPostgres = !!pool;
  
  // Use compatible types for both DBs
  const idType = isPostgres ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT';
  const timestampDefault = isPostgres ? 'CURRENT_TIMESTAMP' : "(datetime('now'))";

  await dbWrapper.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id ${idType},
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      phone TEXT,
      role TEXT DEFAULT 'user',
      created_at TIMESTAMP DEFAULT ${timestampDefault}
    );

    CREATE TABLE IF NOT EXISTS products (
      id ${idType},
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
      created_at TIMESTAMP DEFAULT ${timestampDefault}
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
      created_at TIMESTAMP DEFAULT ${timestampDefault}
    );

    CREATE TABLE IF NOT EXISTS categories (
      id ${idType},
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT ${timestampDefault}
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id ${idType},
      product_id INTEGER NOT NULL REFERENCES products(id),
      user_id INTEGER REFERENCES users(id),
      rating INTEGER NOT NULL,
      comment TEXT,
      user_name TEXT,
      created_at TIMESTAMP DEFAULT ${timestampDefault}
    );

    CREATE TABLE IF NOT EXISTS site_configs (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);
  console.log('Core tables created or verified.');

  // Auto-seed FAB section config if it doesn't exist
  const fabConfig = await dbWrapper.get("SELECT value FROM site_configs WHERE key = 'fab_section'");
  if (!fabConfig) {
    const defaultFab = JSON.stringify({
      title: 'WELCOME TO THE FLIPSIDE',
      stat1_title: '5 YEARS',
      stat1_subtitle: 'OF CREATING TRENDS',
      stat2_title: '2.5 MILLION+',
      stat2_subtitle: 'STYLISH CUSTOMERS',
      video_url: ''
    });
    await dbWrapper.run("INSERT INTO site_configs (key, value) VALUES ('fab_section', ?)", [defaultFab]);
  }
  console.log('Site configs checked.');

  // Auto-seed categories
  if (isPostgres) {
    await dbWrapper.exec(`
      INSERT INTO categories (name) VALUES ('T-Shirt'), ('PHANTS'), ('Accessories')
      ON CONFLICT (name) DO NOTHING;
    `);
  } else {
    await dbWrapper.exec(`
      INSERT OR IGNORE INTO categories (name) VALUES ('T-Shirt'), ('PHANTS'), ('Accessories');
    `);
  }
  console.log('Categories seeded.');

  // Auto-seed Admin User
  const hashedPassword = await bcrypt.hash('demo123', 10);
  if (isPostgres) {
    await dbWrapper.run(`
      INSERT INTO users (name, email, password, role) 
      VALUES (?, ?, ?, ?)
      ON CONFLICT (email) 
      DO UPDATE SET password = EXCLUDED.password, role = 'admin'
    `, ['Demo Admin', 'demo@gmail.com', hashedPassword, 'admin']);
  } else {
    // SQLite: Check if user exists first or use REPLACE (careful with IDs)
    const existing = await dbWrapper.get('SELECT id FROM users WHERE email = ?', ['demo@gmail.com']);
    if (existing) {
      await dbWrapper.run('UPDATE users SET password = ?, role = ? WHERE email = ?', [hashedPassword, 'admin', 'demo@gmail.com']);
    } else {
      await dbWrapper.run('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', ['Demo Admin', 'demo@gmail.com', hashedPassword, 'admin']);
    }
  }
  console.log('Seeded/Updated Admin User: demo@gmail.com / demo123');

  // Auto-seed Products if no products exist
  const productCount = await dbWrapper.get('SELECT COUNT(*) as count FROM products');
  if (parseInt(productCount.count) === 0) {
    const mockProducts = [
      { name: 'Vortex Over-sized Tee', description: 'Heavyweight cotton with holographic print.', price: 1899, category: 'T-Shirt', image_url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1664&auto=format&fit=crop', stock: 50, is_bestseller: 1, sizes: 'S,M,L,XL' },
      { name: 'Cyber Noir Boxy Tee', description: 'Matte black finish with minimalist embroidery.', price: 2199, category: 'T-Shirt', image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1760&auto=format&fit=crop', stock: 35, is_bestseller: 0, sizes: 'M,L,XL' },
      { name: 'Stealth Phants V1', description: 'Water-resistant tech fabric with modular pockets.', price: 3999, category: 'PHANTS', image_url: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?q=80&w=1587&auto=format&fit=crop', stock: 15, is_bestseller: 1, sizes: 'M,L,XL' },
      { name: 'Gravity Cargo', description: 'Reinforced knees and magnetic closures.', price: 4499, category: 'PHANTS', image_url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=1587&auto=format&fit=crop', stock: 10, is_bestseller: 1, sizes: 'L,XL' },
      { name: 'Nebula Hoodie', description: 'Engineered for zero gravity.', price: 2999, category: 'T-Shirt', image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1587&auto=format&fit=crop', stock: 15, is_bestseller: 1, sizes: 'S,M,L' }
    ];
    for (const p of mockProducts) {
      await dbWrapper.run(
        'INSERT INTO products (name, description, price, category, image_url, stock, is_bestseller, sizes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [p.name, p.description, p.price, p.category, p.image_url, p.stock, p.is_bestseller, p.sizes]
      );
    }
    console.log('Seeded Initial Mock Products.');
  }

  console.log('Database initialization complete.');
}
