
import dotenv from 'dotenv';
import path from 'path';
import { Pool } from 'pg';
import fs from 'fs';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
});

const TARGET_EMAIL = 'vmhowleyh@gmail.com';

async function testInsert() {
    const client = await pool.connect();
    const logFile = path.resolve(__dirname, 'debug-error.log');

    try {
        const userRes = await client.query('SELECT tenant_id FROM users WHERE username = $1', [TARGET_EMAIL]);
        if (userRes.rows.length === 0) throw new Error("User not found");
        const tenantId = userRes.rows[0].tenant_id;

        // Get a client
        const clientRes = await client.query('SELECT id FROM clients WHERE tenant_id = $1 LIMIT 1', [tenantId]);
        if (clientRes.rows.length === 0) throw new Error("No clients found");
        const clientId = clientRes.rows[0].id;

        console.log(`Attempting insert for Tenant ${tenantId}, Client ${clientId}`);

        await client.query(`
        INSERT INTO invoices (tenant_id, client_id, status, type_code, net_total, tax_total, total, created_at)
        VALUES ($1, $2, 'draft', '31', 0, 0, 0, NOW())
    `, [tenantId, clientId]);

        fs.writeFileSync(logFile, "SUCCESS: Invoice inserted");
        console.log("SUCCESS");

    } catch (e: any) {
        const msg = `ERROR: ${e.message}\nSTACK: ${e.stack}`;
        fs.writeFileSync(logFile, msg);
        console.error("FAILED");
    } finally {
        client.release();
        await pool.end();
    }
}

testInsert();
