import { pool } from "../db";

async function migrate() {
  const client = await pool.connect();
  try {
    console.log("Starting migration: Adding sequential_number to invoices...");

    // 1. Add the column if it doesn't exist
    await client.query(`
      ALTER TABLE invoices 
      ADD COLUMN IF NOT EXISTS sequential_number INTEGER;
    `);

    // 2. Populate existing records
    // We'll number them based on their creation order per tenant
    const tenantsRes = await client.query("SELECT id FROM tenants");
    for (const tenant of tenantsRes.rows) {
      const invoicesRes = await client.query(
        "SELECT id FROM invoices WHERE tenant_id = $1 ORDER BY created_at ASC, id ASC",
        [tenant.id]
      );
      
      let seq = 1;
      for (const inv of invoicesRes.rows) {
        await client.query(
          "UPDATE invoices SET sequential_number = $1 WHERE id = $2",
          [seq++, inv.id]
        );
      }
      console.log(`Updated ${invoicesRes.rows.length} invoices for tenant ${tenant.id}`);
    }

    // 3. Add NOT NULL and UNIQUE constraints
    // First, verify no nulls (should be handled by step 2)
    await client.query(`
      ALTER TABLE invoices 
      ALTER COLUMN sequential_number SET NOT NULL;
    `);

    await client.query(`
      ALTER TABLE invoices 
      ADD CONSTRAINT unique_tenant_sequential UNIQUE (tenant_id, sequential_number);
    `);

    console.log("Migration completed successfully!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    client.release();
    process.exit();
  }
}

migrate();
