
import { query } from './src/db';
import dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

const checkTenants = async () => {
    try {
        console.log("Checking tenants table columns...");
        const res = await query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'tenants';
        `);
        console.log("Columns:", res.rows);
        fs.writeFileSync('tenant_cols.txt', JSON.stringify(res.rows, null, 2));
    } catch (err: any) {
        console.error("Error checking columns:", err);
    }
    process.exit(0);
};

checkTenants();
