import { getDb } from './src/db';

async function migrate() {
  const db = await getDb();
  try {
    await db.run("ALTER TABLE products ADD COLUMN image_urls TEXT");
    console.log("Added image_urls column");
  } catch (e: any) {
    if (e.message.includes("duplicate column")) {
      console.log("image_urls column already exists");
    } else {
      console.error(e.message);
    }
  }
}

migrate().catch(console.error);
