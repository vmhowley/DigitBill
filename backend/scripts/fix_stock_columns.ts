import dotenv from "dotenv";
import path from "path";
import { query } from "../src/db";

dotenv.config({ path: path.join(__dirname, "../.env") });

const runMigration = async () => {
  try {
    console.log("Unifying stock columns...");

    // 1. Copy data from 'stock' to 'stock_quantity' if 'stock' has value (prioritizing inventory Service updates)
    await query(`
            UPDATE products 
            SET stock_quantity = stock 
            WHERE stock IS NOT NULL AND stock > 0;
        `);

    // 2. Drop the redundant 'stock' column
    await query(`
            ALTER TABLE products 
            DROP COLUMN IF EXISTS stock;
        `);

    console.log('Migration completed. "stock" column dropped.');
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
};

runMigration();
