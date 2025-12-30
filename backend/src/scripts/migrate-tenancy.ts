import dotenv from 'dotenv';
import path from 'path';
import { Pool } from 'pg';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'facturacion_electronica',
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

const migrate = async () => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        console.log('Starting migration to Multi-Tenancy...');

        // 1. Create Tenants Table
        console.log('Creating tenants table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS tenants (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                rnc VARCHAR(20),
                status VARCHAR(20) DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 2. Create Default Tenant
        console.log('Creating default tenant...');
        const tenantRes = await client.query(`
            INSERT INTO tenants (name, rnc) 
            VALUES ('Default Company', '000000000') 
            RETURNING id;
        `);
        const defaultTenantId = tenantRes.rows[0].id; // Likely 1
        console.log(`Default Tenant ID: ${defaultTenantId}`);

        // Helper to migrate a table
        const migrateTable = async (tableName: string, hasUniqueCols: string[] = []) => {
            console.log(`Migrating table: ${tableName}...`);
            
            // Check if column exists
            const checkCol = await client.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name=$1 AND column_name='tenant_id'
            `, [tableName]);

            if (checkCol.rows.length === 0) {
                // Add column
                await client.query(`ALTER TABLE ${tableName} ADD COLUMN tenant_id INTEGER`);
                
                // Populate default tenant
                await client.query(`UPDATE ${tableName} SET tenant_id = $1`, [defaultTenantId]);
                
                // Set Not Null
                await client.query(`ALTER TABLE ${tableName} ALTER COLUMN tenant_id SET NOT NULL`);
                
                // Add FK
                await client.query(`
                    ALTER TABLE ${tableName} 
                    ADD CONSTRAINT fk_${tableName}_tenant 
                    FOREIGN KEY (tenant_id) REFERENCES tenants(id);
                `);

                // Handle Unique Constraints (Drop old, Add composite with tenant_id)
                if (hasUniqueCols.length > 0) {
                    // Try to drop standard unique constraint if exists (e.g., users_username_key)
                    // We iterate over cols to guess constraint names or query them, 
                    // simplifying by assuming standard naming or manual fix later if it fails.
                    // Actually, let's just create the NEW unique index with tenant_id because dropping the old one 
                    // might break if names vary. But we strictly need to drop strictly unique globals like 'username'.
                    
                     for (const col of hasUniqueCols) {
                        try {
                            // Attempt to drop standard named constraint: tablename_colname_key
                            const constraintName = `${tableName}_${col}_key`;
                            await client.query(`ALTER TABLE ${tableName} DROP CONSTRAINT IF EXISTS ${constraintName}`);
                            console.log(`Dropped constraint ${constraintName}`);
                        } catch (e) {
                           console.log(`Warning dropping constraint on ${col}:`, e);
                        }
                        
                        // Add new composite unique
                        await client.query(`
                            ALTER TABLE ${tableName} 
                            ADD CONSTRAINT ${tableName}_tenant_${col}_key UNIQUE (tenant_id, ${col});
                        `);
                    }
                }
            } else {
                console.log(`Table ${tableName} already has tenant_id. Skipping specific migration.`);
            }
        };

        // 3. Migrate all tables
        // Order matters for Foreign keys? No, because we added the column nullable first then filled it.
        await migrateTable('users', ['username']);
        await migrateTable('clients'); 
        await migrateTable('products', ['sku']);
        await migrateTable('invoices');
        await migrateTable('invoice_items');
        await migrateTable('sequences');
        await migrateTable('invoice_logs');
        await migrateTable('certificates');
        
        // Config settings specific
        console.log('Migrating company_settings...');
        // settings has 'key' unique
        await migrateTable('company_settings', ['key']);

        // 4. Enable RLS (Optional/Future proofing)
        console.log('Enabling RLS on tables...');
        const tables = ['tenants', 'users', 'clients', 'products', 'invoices', 'invoice_items', 'sequences', 'invoice_logs', 'certificates', 'company_settings'];
        for (const t of tables) {
             await client.query(`ALTER TABLE ${t} ENABLE ROW LEVEL SECURITY`);
        }

        await client.query('COMMIT');
        console.log('Migration completed successfully!');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
};

migrate();
