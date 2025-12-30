import { query } from '../db';

async function migrate() {
    console.log('Migrating tenants table...');
    try {
        await query('BEGIN');

        await query(`
            DO $$ 
            BEGIN 
                BEGIN
                    ALTER TABLE tenants ADD COLUMN address TEXT;
                EXCEPTION
                    WHEN duplicate_column THEN NULL;
                END;

                BEGIN
                    ALTER TABLE tenants ADD COLUMN phone VARCHAR(20);
                EXCEPTION
                    WHEN duplicate_column THEN NULL;
                END;

                BEGIN
                    ALTER TABLE tenants ADD COLUMN email VARCHAR(255);
                EXCEPTION
                    WHEN duplicate_column THEN NULL;
                END;

                BEGIN
                    ALTER TABLE tenants ADD COLUMN type VARCHAR(20);
                    -- We can't easily add the CHECK constraint on existing data if it violates, 
                    -- so we'll skip the constraint for now or assume data is clean.
                    -- Adding constraint:
                    -- ALTER TABLE tenants ADD CONSTRAINT tenants_type_check CHECK (type IN ('juridico', 'fisico'));
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
