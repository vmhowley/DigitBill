import { pool } from "../src/db";

async function migrate() {
  console.log("Starting migration: Adding share_token to invoices...");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Ensure UUID extension exists
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    // 2. Add column if not exists
    await client.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='share_token') THEN
          ALTER TABLE invoices ADD COLUMN share_token UUID DEFAULT uuid_generate_v4();
          CREATE INDEX idx_invoices_share_token ON invoices(share_token);
        END IF;
      END $$;
    `);

    // 3. Backfill existing NULLs (just in case default didn't catch them, though default usually applies to new rows)
    // Actually, adding column with DEFAULT fills existing rows in Postgres? Yes, usually.
    // But let's be safe.
    await client.query(
      "UPDATE invoices SET share_token = uuid_generate_v4() WHERE share_token IS NULL"
    );

    await client.query("COMMIT");
    console.log("Migration successful!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Migration failed:", err);
  } finally {
    client.release();
    pool.end();
  }
}

migrate();
