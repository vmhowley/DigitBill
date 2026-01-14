
import { query } from '../db';

const migrate = async () => {
    try {
        console.log('Migrating database: Creating vehicles table...');
        await query(`
            CREATE TABLE IF NOT EXISTS vehicles (
              id SERIAL PRIMARY KEY,
              tenant_id INTEGER REFERENCES tenants(id) NOT NULL,
              make VARCHAR(50) NOT NULL,
              model VARCHAR(50) NOT NULL,
              year INTEGER NOT NULL,
              trim VARCHAR(50),
              vin VARCHAR(50),
              color VARCHAR(30),
              mileage INTEGER DEFAULT 0,
              condition VARCHAR(20) CHECK (condition IN ('new', 'used')) DEFAULT 'used',
              status VARCHAR(20) CHECK (status IN ('available', 'reserved', 'sold', 'maintenance')) DEFAULT 'available',
              cost DECIMAL(12, 2) DEFAULT 0.00,
              price DECIMAL(12, 2) NOT NULL,
              description TEXT,
              photo_url TEXT,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              UNIQUE(tenant_id, vin)
            );
        `);
        console.log('Migration successful: vehicles table created.');
    } catch (error) {
        console.error('Migration failed:', error);
    }
    process.exit(0);
};

migrate();
