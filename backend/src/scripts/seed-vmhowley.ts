
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

async function seedDemoData() {
    const client = await pool.connect();
    try {
        console.log(`Searching for user: ${TARGET_EMAIL}...`);

        // 1. Find User
        let userRes = await client.query('SELECT * FROM users WHERE username = $1', [TARGET_EMAIL]);

        if (userRes.rows.length === 0) {
            console.log(`User ${TARGET_EMAIL} NOT FOUND. Please ensure the user is registered first.`);
            process.exit(1);
        }

        const user = userRes.rows[0];
        const tenantId = user.tenant_id;
        console.log(`Found User ID: ${user.id}, Tenant ID: ${tenantId}`);

        // Random Date Helper (last N months)
        const randomDate = (monthsBack: number) => {
            const date = new Date();
            date.setMonth(date.getMonth() - Math.floor(Math.random() * monthsBack));
            date.setDate(Math.floor(Math.random() * 28) + 1);
            return date;
        };

        // 2. Insert Clients
        console.log('Seeding Clients...');
        const clients = [
            { name: 'Farmacia Tu Salud', rnc: '101010101', email: 'contacto@tusalud.com', type: 'juridico' },
            { name: 'Supermercado El Pueblo', rnc: '101010102', email: 'compras@elpueblo.com', type: 'juridico' },
            { name: 'Juan Pérez', rnc: '00112345678', email: 'juan.perez@gmail.com', type: 'fisico' },
            { name: 'Constructora Norte', rnc: '131010103', email: 'proyectos@cnorte.do', type: 'juridico' },
            { name: 'Laura García', rnc: '00187654321', email: 'laura.g@hotmail.com', type: 'fisico' },
            { name: 'Tech Solutions SRL', rnc: '130000001', email: 'info@techsolutions.do', type: 'juridico' },
            { name: 'Colegio San Mateo', rnc: '130000002', email: 'admin@sanmateo.edu.do', type: 'juridico' }
        ];

        for (const c of clients) {
            await client.query(`
            INSERT INTO clients (tenant_id, name, rnc_ci, email, type)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT DO NOTHING
        `, [tenantId, c.name, c.rnc, c.email, c.type]);
        }

        // 3. Insert Products
        console.log('Seeding Products...');
        const products = [
            { description: 'Consultoría IT (Hora)', price: 2500.00, tax: 18.00, type: 'service' },
            { description: 'Laptop Dell Latitude 5420', price: 65000.00, tax: 18.00, type: 'product' },
            { description: 'Licencia Microsoft 365', price: 8500.00, tax: 18.00, type: 'service' },
            { description: 'Mouse Inalámbrico Logitech', price: 1200.00, tax: 18.00, type: 'product' },
            { description: 'Mantenimiento Preventivo', price: 3500.00, tax: 18.00, type: 'service' },
            { description: 'Monitor IPS 27"', price: 15900.00, tax: 18.00, type: 'product' },
            { description: 'Cableado Estructurado (Punto)', price: 1800.00, tax: 18.00, type: 'service' }
        ];

        for (const p of products) {
            const sku = `DEMO-${Math.floor(Math.random() * 100000)}`;
            await client.query(`
            INSERT INTO products (tenant_id, description, unit_price, tax_rate, type, sku, stock_quantity)
            VALUES ($1, $2, $3, $4, $5, $6, 100)
            ON CONFLICT DO NOTHING
        `, [tenantId, p.description, p.price, p.tax, p.type, sku]);
        }

        // 4. Ensure Sequences
        await client.query(`
        INSERT INTO sequences (tenant_id, type_code, next_number, current_end_number)
        VALUES ($1, '31', 1, 10000)
        ON CONFLICT DO NOTHING
    `, [tenantId]);

        // 5. Generate Invoices (Historical & Recent)
        console.log('Seeding Invoices (Historical & Recent)...');

        // Refresh IDs
        const dbClients = (await client.query('SELECT id FROM clients WHERE tenant_id = $1', [tenantId])).rows;
        const dbProducts = (await client.query('SELECT id, unit_price, tax_rate FROM products WHERE tenant_id = $1', [tenantId])).rows;

        if (dbClients.length > 0 && dbProducts.length > 0) {
            // Create 40 invoices spread over 6 months
            for (let i = 0; i < 40; i++) {
                const randomClient = dbClients[Math.floor(Math.random() * dbClients.length)];
                const status = ['draft', 'sent', 'sent', 'paid'][Math.floor(Math.random() * 4)]; // More paid/sent
                const createdAt = randomDate(6); // Last 6 months

                try {
                    // Create Invoice Header
                    const invRes = await client.query(`
                    INSERT INTO invoices (tenant_id, client_id, status, type_code, net_total, tax_total, total, created_at)
                    VALUES ($1, $2, $3, '31', 0, 0, 0, $4)
                    RETURNING id
                `, [tenantId, randomClient.id, status, createdAt]);

                    const invoiceId = invRes.rows[0].id;

                    // Add Items
                    let netTotal = 0;
                    let taxTotal = 0;
                    const numItems = Math.floor(Math.random() * 4) + 1;

                    for (let j = 0; j < numItems; j++) {
                        const randomProduct = dbProducts[Math.floor(Math.random() * dbProducts.length)];
                        const qty = Math.floor(Math.random() * 3) + 1;
                        const price = parseFloat(randomProduct.unit_price);
                        const taxRate = parseFloat(randomProduct.tax_rate);

                        const lineAmount = price * qty;
                        const lineTax = lineAmount * (taxRate / 100);

                        await client.query(`
                        INSERT INTO invoice_items (tenant_id, invoice_id, product_id, quantity, unit_price, line_amount, line_tax)
                        VALUES ($1, $2, $3, $4, $5, $6, $7)
                    `, [tenantId, invoiceId, randomProduct.id, qty, price, lineAmount, lineTax]);

                        netTotal += lineAmount;
                        taxTotal += lineTax;
                    }

                    // Update Invoice Totals & Payments if paid
                    const total = netTotal + taxTotal;
                    await client.query(`
                    UPDATE invoices 
                    SET net_total = $1, tax_total = $2, total = $3
                    WHERE id = $4
                `, [netTotal, taxTotal, total, invoiceId]);
                } catch (err) {
                    console.error(`ERROR creating invoice ${i}:`, err);
                }
            }
        }

        // 6. Generate Expenses (Historical)
        console.log('Seeding Expenses compatibility...');
        try {
            const expenseCategories = ['Nomina', 'Alquiler', 'Servicios', 'Suministros', 'Internet'];
            for (let i = 0; i < 25; i++) {
                const category = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
                const amount = Math.floor(Math.random() * 15000) + 500;
                const date = randomDate(6);

                await client.query(`
                INSERT INTO expenses (tenant_id, description, amount, date, category)
                VALUES ($1, $2, $3, $4, $5)
            `, [tenantId, `Gasto de ${category}`, amount, date, category]);
            }
        } catch (e) {
            console.warn("Could not seed expenses (maybe table doesn't exist or different schema):", e);
        }

        console.log('✅ Demo Data Seeded for vmhowleyh@gmail.com');

    } catch (e) {
        console.error('Error seeding data:', e);
    } finally {
        client.release();
        await pool.end();
    }
}

seedDemoData();
