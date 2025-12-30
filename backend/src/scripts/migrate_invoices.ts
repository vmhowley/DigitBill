
import { query } from '../db';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const migrate = async () => {
    try {
        console.log('Starting migration for invoices...');
        
        await query(`
            DO $$ 
            BEGIN 
                BEGIN
                    ALTER TABLE invoices ADD COLUMN type_code VARCHAR(2) DEFAULT '31';
                EXCEPTION
                    WHEN duplicate_column THEN NULL;
                END;
                
                BEGIN
                    ALTER TABLE invoices ADD COLUMN reference_ncf VARCHAR(19);
                EXCEPTION
                    WHEN duplicate_column THEN NULL;
                END;
            END $$;
        `);

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
