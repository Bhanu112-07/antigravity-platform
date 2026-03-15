import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

const mockData = [
  { name: 'Nebula Hoodie', description: 'Engineered for zero gravity.', price: 2999, category: 'Men', image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1587&auto=format&fit=crop', stock: 15 },
  { name: 'Horizon Cargo Pants', description: 'Premium fit.', price: 3499, category: 'Men', image_url: 'https://images.unsplash.com/photo-1624378439575-d10c6d1774ac?q=80&w=1587&auto=format&fit=crop', stock: 20 },
  { name: 'Cosmic Oversized Tee', description: 'Loose and comfortable.', price: 1499, category: 'Women', image_url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1664&auto=format&fit=crop', stock: 10 },
  { name: 'Lunar Crop Top', description: 'Night sky design.', price: 1299, category: 'Women', image_url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1740&auto=format&fit=crop', stock: 12 },
  { name: 'Gravity Boots', description: 'Defy gravity itself.', price: 5999, category: 'Men', image_url: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=1587&auto=format&fit=crop', stock: 5 },
  { name: 'Orbit Chain', description: 'Silver loop.', price: 899, category: 'Accessories', image_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1587&auto=format&fit=crop', stock: 30 },
];

async function seed() {
  const db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  const count = await db.get('SELECT COUNT(*) as count FROM products');
  if (count.count === 0) {
    for (const p of mockData) {
      await db.run(
        'INSERT INTO products (name, description, price, category, image_url, stock) VALUES (?, ?, ?, ?, ?, ?)',
        [p.name, p.description, p.price, p.category, p.image_url, p.stock]
      );
    }
    console.log('Seeded database with mock products!');
  } else {
    console.log('Database already has products.');
  }
}

seed().catch(console.error);
