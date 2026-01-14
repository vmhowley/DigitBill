
import { query } from "../db";

const migrate = async () => {
    try {
        console.log("Migrating vehicle_loans...");
        await query(`
            CREATE TABLE IF NOT EXISTS vehicle_loans (
              id SERIAL PRIMARY KEY,
              tenant_id INTEGER REFERENCES tenants(id) NOT NULL,
              vehicle_id INTEGER REFERENCES vehicles(id) NOT NULL,
              dealer_name VARCHAR(255) NOT NULL,
              dealer_phone VARCHAR(50),
              loan_date DATE NOT NULL,
              expected_return_date DATE,
              status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'returned')),
              notes TEXT,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `, []);
        console.log("Migration successful!");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
};

migrate();
