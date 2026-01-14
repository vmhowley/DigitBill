
import { query } from '../db';

const migrate = async () => {
    try {
        console.log('Migrating database: Adding plate column to vehicles...');
        await query(`
            ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS plate VARCHAR(20);
        `);
        console.log('Migration successful: plate column added.');
    } catch (error) {
        console.error('Migration failed:', error);
    }
    process.exit(0);
};

migrate();
