import { query } from "../db";

async function migrate() {
  console.log("Migrating: Creating providers and expenses tables...");
  await query(`
        CREATE TABLE IF NOT EXISTS providers (
            id SERIAL PRIMARY KEY,
            tenant_id INTEGER REFERENCES tenants(id) NOT NULL,
            name VARCHAR(255) NOT NULL,
            rnc VARCHAR(20),
            phone VARCHAR(20),
            email VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS expenses (
            id SERIAL PRIMARY KEY,
            tenant_id INTEGER REFERENCES tenants(id) NOT NULL,
            provider_id INTEGER REFERENCES providers(id),
            ncf VARCHAR(20), -- For reporting (606)
            description TEXT,
            amount DECIMAL(12, 2) NOT NULL,
            tax_amount DECIMAL(12, 2) DEFAULT 0,
            category VARCHAR(50), -- Electricity, Rent, etc.
            expense_date DATE DEFAULT CURRENT_DATE,
            status VARCHAR(20) DEFAULT 'paid', -- paid, pending
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
