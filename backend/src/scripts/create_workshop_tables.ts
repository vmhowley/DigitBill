
import { query } from '../db';

const migrate = async () => {
    try {
        console.log('Migrating database: Creating Workshop tables...');

        await query(`
            CREATE TABLE IF NOT EXISTS work_orders (
              id SERIAL PRIMARY KEY,
              tenant_id INTEGER REFERENCES tenants(id) NOT NULL,
              vehicle_id INTEGER REFERENCES vehicles(id) NOT NULL,
              status VARCHAR(20) CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
              start_date DATE DEFAULT CURRENT_DATE,
              end_date DATE,
              
              total_parts DECIMAL(12, 2) DEFAULT 0,
              total_labor DECIMAL(12, 2) DEFAULT 0,
              total_cost DECIMAL(12, 2) DEFAULT 0,
              
              notes TEXT,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await query(`
            CREATE TABLE IF NOT EXISTS work_order_items (
              id SERIAL PRIMARY KEY,
              work_order_id INTEGER REFERENCES work_orders(id) ON DELETE CASCADE,
              tenant_id INTEGER REFERENCES tenants(id) NOT NULL,
              description VARCHAR(255) NOT NULL,
              quantity DECIMAL(10, 2) DEFAULT 1,
              unit_cost DECIMAL(12, 2) NOT NULL,
              total_cost DECIMAL(12, 2) NOT NULL,
              type VARCHAR(20) CHECK (type IN ('part', 'labor', 'other')) DEFAULT 'part',
              vendor VARCHAR(100),
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('Migration successful: Workshop tables created.');
    } catch (error) {
        console.error('Migration failed:', error);
    }
    process.exit(0);
};

migrate();
