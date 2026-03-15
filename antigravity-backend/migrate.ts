import { getDb } from './src/db';

async function migrate() {
  const db = await getDb();
  try {
    await db.run("ALTER TABLE products ADD COLUMN colors TEXT");
    console.log("Added colors column");
  } catch (e: any) {
    if (e.message.includes("duplicate column")) {
      console.log("colors column already exists");
    } else {
      console.error(e.message);
    }
  }

  try {
    await db.run("ALTER TABLE products ADD COLUMN sizes TEXT");
    console.log("Added sizes column");
  } catch (e: any) {
    if (e.message.includes("duplicate column")) {
      console.log("sizes column already exists");
    } else {
      console.error(e.message);
    }
  }
}

migrate().catch(console.error);
