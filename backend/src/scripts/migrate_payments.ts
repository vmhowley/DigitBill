import { query } from "../db";

async function migrate() {
  console.log("Migrating: Creating payments table...");
  await query(`
        CREATE TABLE IF NOT EXISTS payments (
            id SERIAL PRIMARY KEY,
            tenant_id INTEGER REFERENCES tenants(id) NOT NULL,
            invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
            amount DECIMAL(12, 2) NOT NULL,
            payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            payment_method VARCHAR(50) NOT NULL, -- cash, transfer, check, card
            reference VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
  console.log("Migration completed successfully.");
}

migrate()
  .then(() => process.exit())
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
