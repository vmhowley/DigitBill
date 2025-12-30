import { query } from "../db";

async function migrate() {
  console.log(
    "Migrating: Adding stock to products and creating inventory_movements table..."
  );
  await query(`
        -- Add stock to products if not exists
        DO $$ 
        BEGIN 
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='stock') THEN
                ALTER TABLE products ADD COLUMN stock DECIMAL(12, 2) DEFAULT 0;
            END IF;
        END $$;

        CREATE TABLE IF NOT EXISTS inventory_movements (
            id SERIAL PRIMARY KEY,
            tenant_id INTEGER REFERENCES tenants(id) NOT NULL,
            product_id INTEGER REFERENCES products(id) NOT NULL,
            type VARCHAR(20) NOT NULL, -- 'in', 'out', 'adjustment'
            quantity DECIMAL(12, 2) NOT NULL,
            reference_id INTEGER, -- invoice_id or expense_id
            reason VARCHAR(255), -- 'Sale', 'Purchase', 'Correction', etc.
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
