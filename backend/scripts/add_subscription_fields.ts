import dotenv from "dotenv";
import path from "path";
import { query } from "../src/db";

// Load env vars from backend/.env
dotenv.config({ path: path.join(__dirname, "../.env") });

const runMigration = async () => {
  try {
    console.log("Adding subscription columns to tenants table...");

    await query(`
            ALTER TABLE tenants 
            ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ,
            ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
            ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active';
        `);

    console.log("Migration completed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
};

runMigration();
