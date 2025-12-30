import { query } from '../db';
import dotenv from 'dotenv';
import path from 'path';

// Load env from root of backend
dotenv.config({ path: path.join(__dirname, '../../.env') });

const runMigration = async () => {
    try {
        console.log('Running migration: Add plan_type to tenants...');
        
        await query('BEGIN');

        // Check if column exists
        const checkRes = await query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='tenants' AND column_name='plan_type'
        `);

        if (checkRes.rows.length === 0) {
            console.log('Column plan_type does not exist. Adding it...');
            // Add column with default value 'pyme' (so existing users have access)
            await query(`
                ALTER TABLE tenants 
                ADD COLUMN plan_type VARCHAR(50) DEFAULT 'pyme'
            `);
            console.log('Column added successfully.');
        } else {
            console.log('Column plan_type already exists.');
        }

        await query('COMMIT');
        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (err) {
        await query('ROLLBACK');
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

runMigration();
