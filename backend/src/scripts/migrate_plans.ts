import { query } from '../db';

async function migrate() {
    console.log('Migrating tenants table (adding plans)...');
    try {
        await query('BEGIN');

        await query(`
            DO $$ 
            BEGIN 
                BEGIN
                    ALTER TABLE tenants ADD COLUMN plan VARCHAR(20) DEFAULT 'free';
                    -- We can try to add the check constraint if data is clean
                    -- ALTER TABLE tenants ADD CONSTRAINT tenants_plan_check CHECK (plan IN ('free', 'pro', 'enterprise'));
                EXCEPTION
                    WHEN duplicate_column THEN NULL;
                END;
            END $$;
        `);

        await query('COMMIT');
        console.log('Migration completed successfully');
    } catch (error) {
        await query('ROLLBACK');
        console.error('Migration failed:', error);
    }
}

migrate();
