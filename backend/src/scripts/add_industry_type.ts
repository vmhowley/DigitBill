
import { query } from '../db';

const migrate = async () => {
    try {
        console.log('Migrating database...');
        await query(`
            ALTER TABLE tenants 
            ADD COLUMN IF NOT EXISTS industry_type VARCHAR(20) DEFAULT 'retail' 
            CHECK (industry_type IN ('retail', 'automotive', 'service'));
        `);
        console.log('Migration successful: industry_type added to tenants.');
    } catch (error) {
        console.error('Migration failed:', error);
    }
    process.exit(0);
};

migrate();
