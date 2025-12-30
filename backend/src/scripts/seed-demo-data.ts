
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

const TARGET_EMAIL = 'test@digitbill.com';

async function seedDemoData() {
  const client = await pool.connect();
  try {
    console.log(`Searching for user: ${TARGET_EMAIL}...`);
    
    // 1. Find User and Tenant
    let userRes = await client.query('SELECT * FROM users WHERE username = $1', [TARGET_EMAIL]);
    
    if (userRes.rows.length === 0) {
        console.log(`User ${TARGET_EMAIL} not found. Trying 'test@digitbill.com'...`);
        userRes = await client.query('SELECT * FROM users WHERE username = $1', ['test@digitbill.com']);
    }

    if (userRes.rows.length === 0) {
        console.log(`User 'test@digitbill.com' not found either. Listing all users...`);
        const allUsers = await client.query('SELECT id, username FROM users');
        console.table(allUsers.rows);
        process.exit(1);
    }

    const user = userRes.rows[0];
    const tenantId = user.tenant_id;
    console.log(`Found User ID: ${user.id}, Tenant ID: ${tenantId}`);

    // 2. Insert Clients
    console.log('Seeding Clients...');
    const clients = [
      { name: 'Farmacia Tu Salud', rnc: '101010101', email: 'contacto@tusalud.com', type: 'juridico' },
      { name: 'Supermercado El Pueblo', rnc: '101010102', email: 'compras@elpueblo.com', type: 'juridico' },
      { name: 'Juan Pérez', rnc: '00112345678', email: 'juan.perez@gmail.com', type: 'fisico' },
      { name: 'Constructora Norte', rnc: '131010103', email: 'proyectos@cnorte.do', type: 'juridico' },
      { name: 'Laura García', rnc: '00187654321', email: 'laura.g@hotmail.com', type: 'fisico' }
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
      { description: 'Consultoría IT', price: 2500.00, tax: 18.00, type: 'service' },
      { description: 'Laptop Dell Latitude', price: 45000.00, tax: 18.00, type: 'product' },
      { description: 'Licencia Software Anual', price: 12000.00, tax: 18.00, type: 'service' },
      { description: 'Mouse Inalámbrico', price: 850.00, tax: 18.00, type: 'product' },
      { description: 'Teclado Mecánico', price: 3500.00, tax: 18.00, type: 'product' },
      { description: 'Monitor 24 pulgadas', price: 8900.00, tax: 18.00, type: 'product' },
      { description: 'Soporte Técnico Mensual', price: 5000.00, tax: 18.00, type: 'service' }
    ];

    for (const p of products) {
        // Simple sku gen
        const sku = `PROD-${Math.floor(Math.random() * 10000)}`;
        await client.query(`
            INSERT INTO products (tenant_id, description, unit_price, tax_rate, type, sku, stock_quantity)
            VALUES ($1, $2, $3, $4, $5, $6, 100)
            ON CONFLICT DO NOTHING
        `, [tenantId, p.description, p.price, p.tax, p.type, sku]);
    }

    // 4. Ensure Sequences (for NCF)
    const seqCheck = await client.query('SELECT * FROM sequences WHERE tenant_id = $1 AND type_code = $2', [tenantId, '31']);
    if (seqCheck.rows.length === 0) {
         await client.query(`
            INSERT INTO sequences (tenant_id, type_code, next_number, current_end_number)
            VALUES ($1, '31', 1, 10000)
         `, [tenantId]);
    }

    // 5. Generate Invoices
    console.log('Seeding Invoices...');
    const clientRows = (await client.query('SELECT id FROM clients WHERE tenant_id = $1', [tenantId])).rows;
    const productRows = (await client.query('SELECT id, unit_price, tax_rate FROM products WHERE tenant_id = $1', [tenantId])).rows;

    if (clientRows.length > 0 && productRows.length > 0) {
        for (let i = 0; i < 15; i++) {
            const randomClient = clientRows[Math.floor(Math.random() * clientRows.length)];
            const status = ['draft', 'sent', 'accepted'][Math.floor(Math.random() * 3)];
            
            // Create Invoice Header
            const invRes = await client.query(`
                INSERT INTO invoices (tenant_id, client_id, status, type_code, net_total, tax_total, total)
                VALUES ($1, $2, $3, '31', 0, 0, 0)
                RETURNING id
            `, [tenantId, randomClient.id, status]);
            
            const invoiceId = invRes.rows[0].id;

            // Add Items
            let netTotal = 0;
            let taxTotal = 0;
            const numItems = Math.floor(Math.random() * 3) + 1;

            for (let j = 0; j < numItems; j++) {
                const randomProduct = productRows[Math.floor(Math.random() * productRows.length)];
                const qty = Math.floor(Math.random() * 5) + 1;
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

            // Update Invoice Totals
             await client.query(`
                UPDATE invoices 
                SET net_total = $1, tax_total = $2, total = $3
                WHERE id = $4
            `, [netTotal, taxTotal, netTotal + taxTotal, invoiceId]);
        }
    }

    console.log('✅ Demo Data Seeded Successfully!');

  } catch (e) {
    console.error('Error seeding demo data:', e);
  } finally {
    client.release();
    await pool.end();
  }
}

seedDemoData();
