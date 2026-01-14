
import { query } from '../db';

const migrate = async () => {
    try {
        console.log('Migrating database: Adding notes column to invoices...');
        await query(`
            ALTER TABLE invoices ADD COLUMN IF NOT EXISTS notes TEXT;
        `);
        console.log('Migration successful: notes column added.');
    } catch (error) {
        console.error('Migration failed:', error);
    }
    process.exit(0);
};

migrate();
