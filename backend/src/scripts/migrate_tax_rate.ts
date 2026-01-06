import { query } from "../db";

async function migrate() {
  try {
    console.log("Adding tax_rate column to invoice_items...");
    await query(
      "ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5, 2) DEFAULT 18.00;"
    );
    console.log("Migration successful");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

migrate();
