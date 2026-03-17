const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const phantsProducts = [
  {
    name: 'Stealth Phants v1',
    description: 'Blacked out urban techwear with multi-pocket system.',
    price: 3999,
    category: 'PHANTS',
    image_url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=1587&auto=format&fit=crop',
    stock: 25,
    is_bestseller: 1,
    sizes: 'S,M,L,XL',
    colors: 'Black'
  },
  {
    name: 'Cyber Jogger X',
    description: 'Reflective details with premium elastic fit.',
    price: 2499,
    category: 'PHANTS',
    image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1520&auto=format&fit=crop',
    stock: 30,
    is_bestseller: 0,
    sizes: 'M,L,XL',
    colors: 'Neon,Grey'
  },
  {
    name: 'Graphite Cargo',
    description: 'Industrial grade fabric with modular straps.',
    price: 4599,
    category: 'PHANTS',
    image_url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1587&auto=format&fit=crop',
    stock: 15,
    is_bestseller: 1,
    sizes: 'S,M,L',
    colors: 'Slate'
  },
  {
    name: 'Onyx Utility Phants',
    description: 'Seamless integration of comfort and utility.',
    price: 3299,
    category: 'PHANTS',
    image_url: 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?q=80&w=1611&auto=format&fit=crop',
    stock: 40,
    is_bestseller: 0,
    sizes: 'S,M,L,XL,XXL',
    colors: 'Black,Navy'
  }
];

db.serialize(() => {
  const stmt = db.prepare(`
    INSERT INTO products (name, description, price, category, image_url, stock, is_bestseller, sizes, colors) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  phantsProducts.forEach(p => {
    stmt.run(p.name, p.description, p.price, p.category, p.image_url, p.stock, p.is_bestseller, p.sizes, p.colors);
  });

  stmt.finalize();
  console.log('Added dummy PHANTS data successfully.');
});

db.close();
