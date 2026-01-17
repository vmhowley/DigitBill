
import { query } from './src/db';
import dotenv from 'dotenv';

dotenv.config();

const testDb = async () => {
    try {
        console.log("Checking notifications table...");
        const res = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'notifications';
    `);

        if (res.rows.length === 0) {
            console.log("CRITICAL: 'notifications' table does not exist!");
        } else {
            console.log("Table 'notifications' exists with columns:");
            res.rows.forEach(r => console.log(` - ${r.column_name} (${r.data_type})`));
        }

        // Also check tenants to get a valid ID
        const tenants = await query('SELECT id, name FROM tenants LIMIT 1');
        if (tenants.rows.length > 0) {
            console.log("Found tenant:", tenants.rows[0]);
        } else {
            console.log("No tenants found.");
        }

    } catch (err) {
        console.error("Database check failed:", err);
    }
    process.exit(0);
};

testDb();
