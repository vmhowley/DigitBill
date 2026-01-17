
import { query } from './src/db';
import dotenv from 'dotenv';
dotenv.config();

const checkTable = async () => {
    try {
        console.log("Checking inventory_movements table...");

        // Check Constraints
        const constraints = await query(`
            SELECT concurrency.conname as constraint_name, 
                   pg_get_constraintdef(concurrency.oid) as definition
            FROM pg_constraint concurrency
            JOIN pg_class klass ON klass.oid = concurrency.conrelid
            WHERE klass.relname = 'inventory_movements';
        `);
        console.log("Constraints:", JSON.stringify(constraints.rows, null, 2));

        // Check columns for tenants
        const cols = await query(`
            SELECT column_name, column_default, is_nullable, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'tenants' AND column_name = 'subscription_end_date';
        `);
        console.log("Tenant Subscription Column:", JSON.stringify(cols.rows, null, 2));

    } catch (err: any) {
        console.error("Error checking table:", err);
    }
    process.exit(0);
};

checkTable();
