const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // 1. Rename 'Men' to 'T-Shirt' in categories table
  db.run("UPDATE categories SET name = 'T-Shirt' WHERE name = 'Men'", function(err) {
    if (err) console.error('Error updating category:', err);
    else console.log('Renamed category Men to T-Shirt');
  });

  // 2. Update products in 'Men' category to 'T-Shirt'
  db.run("UPDATE products SET category = 'T-Shirt' WHERE category = 'Men'", function(err) {
    if (err) console.error('Error updating products:', err);
    else console.log('Updated products category from Men to T-Shirt');
  });

  // 3. Add some dummy T-Shirts if needed (optional but good for visibility)
  const tshirtProducts = [
    {
      name: 'Vortex Over-sized Tee',
      description: 'Heavyweight cotton with holographic print.',
      price: 1899,
      category: 'T-Shirt',
      image_url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1664&auto=format&fit=crop',
      stock: 50,
      is_bestseller: 1,
      sizes: 'S,M,L,XL',
      colors: 'White,Cream'
    },
    {
      name: 'Cyber Noir Boxy Tee',
      description: 'Matte black finish with minimalist embroidery.',
      price: 2199,
      category: 'T-Shirt',
      image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1760&auto=format&fit=crop',
      stock: 35,
      is_bestseller: 0,
      sizes: 'M,L,XL',
      colors: 'Black'
    }
  ];

  const stmt = db.prepare(`
    INSERT INTO products (name, description, price, category, image_url, stock, is_bestseller, sizes, colors) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  tshirtProducts.forEach(p => {
    stmt.run(p.name, p.description, p.price, p.category, p.image_url, p.stock, p.is_bestseller, p.sizes, p.colors);
  });

  stmt.finalize();
  console.log('Added dummy T-Shirt data.');
});

db.close();
