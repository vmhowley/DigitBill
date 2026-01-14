
import { query } from '../db';

const migrate = async () => {
    try {
        console.log('Migrating database: Creating vehicle_sales table...');
        await query(`
            CREATE TABLE IF NOT EXISTS vehicle_sales (
              id SERIAL PRIMARY KEY,
              tenant_id INTEGER REFERENCES tenants(id) NOT NULL,
              vehicle_id INTEGER REFERENCES vehicles(id) NOT NULL,
              client_id INTEGER REFERENCES clients(id) NOT NULL,
              sale_date DATE DEFAULT CURRENT_DATE,
              
              sale_price DECIMAL(12, 2) NOT NULL,
              down_payment DECIMAL(12, 2) DEFAULT 0,
              trade_in_amount DECIMAL(12, 2) DEFAULT 0,
              financed_amount DECIMAL(12, 2) DEFAULT 0,
              
              interest_rate DECIMAL(5, 2),
              term_months INTEGER,
              monthly_payment DECIMAL(10, 2),
              
              status VARCHAR(20) CHECK (status IN ('pending', 'completed', 'cancelled')) DEFAULT 'pending',
              notes TEXT,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Migration successful: vehicle_sales table created.');
    } catch (error) {
        console.error('Migration failed:', error);
    }
    process.exit(0);
};

migrate();
