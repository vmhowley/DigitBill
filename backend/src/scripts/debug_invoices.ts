
import { query } from '../db';

async function run() {
    try {
        console.log("Checking invoices...");
        const res = await query(`
            SELECT i.id, i.client_id, c.id as joined_client_id, c.name as client_name 
            FROM invoices i 
            LEFT JOIN clients c ON i.client_id = c.id
        `);
        console.log("Found " + res.rows.length + " invoices.");
        console.table(res.rows);
    } catch (e) {
        console.error(e);
    }
}

run();
