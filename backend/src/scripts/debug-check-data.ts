
import dotenv from 'dotenv';
import path from 'path';
import { Pool } from 'pg';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
});

const TARGET_EMAIL = 'vmhowleyh@gmail.com';

async function checkData() {
    const client = await pool.connect();
    try {
        console.log(`Checking data for: ${TARGET_EMAIL}...`);

        const userRes = await client.query('SELECT id, tenant_id FROM users WHERE username = $1', [TARGET_EMAIL]);
        if (userRes.rows.length === 0) {
            console.log('User not found!');
            return;
        }
        const tenantId = userRes.rows[0].tenant_id;
        console.log(`Tenant ID: ${tenantId}`);

        const clientCount = await client.query('SELECT COUNT(*) FROM clients WHERE tenant_id = $1', [tenantId]);
        console.log(`Clients: ${clientCount.rows[0].count}`);

        const productCount = await client.query('SELECT COUNT(*) FROM products WHERE tenant_id = $1', [tenantId]);
        console.log(`Products: ${productCount.rows[0].count}`);

        const invoiceCount = await client.query('SELECT COUNT(*) FROM invoices WHERE tenant_id = $1', [tenantId]);
        console.log(`Invoices: ${invoiceCount.rows[0].count}`);

        if (parseInt(invoiceCount.rows[0].count) > 0) {
            const lastInvoice = await client.query('SELECT * FROM invoices WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT 1', [tenantId]);
            console.log('Most recent invoice:', lastInvoice.rows[0]);
        }

    } catch (e) {
        console.error(e);
    } finally {
        client.release();
        await pool.end();
    }
}

checkData();
