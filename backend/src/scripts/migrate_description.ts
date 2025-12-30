import { query } from "../db";

async function migrate() {
  try {
    console.log("Adding description column to invoice_items...");
    await query(
      "ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS description TEXT;"
    );
    console.log("Migration successful");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

migrate();
