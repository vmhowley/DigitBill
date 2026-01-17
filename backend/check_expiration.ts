
import { query } from './src/db';
import dotenv from 'dotenv';
dotenv.config();

const checkTenants = async () => {
    try {
        console.log("Checking Tenant Expiration Dates...");
        const res = await query(`
            SELECT id, name, plan, subscription_end_date, 
                   (subscription_end_date < CURRENT_DATE) as is_expired_db,
                   CURRENT_DATE as db_now
            FROM tenants 
            WHERE plan != 'free'
        `);
        const fs = require('fs');
        fs.writeFileSync('expiration_check.json', JSON.stringify(res.rows, null, 2));
        console.log("Written to expiration_check.json");
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
};

checkTenants();
