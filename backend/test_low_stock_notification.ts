
import { query } from './src/db';
import * as inventoryService from './src/services/inventoryService';
import dotenv from 'dotenv';
dotenv.config();

async function testNotification() {
    try {
        console.log("Starting Low Stock Notification Test...");

        // 1. Get Valid Tenant
        const tenantRes = await query("SELECT id FROM tenants LIMIT 1", []);
        if (tenantRes.rows.length === 0) throw new Error("No tenants found");
        const tenantId = tenantRes.rows[0].id;
        console.log(`Using Tenant ID: ${tenantId}`);

        const sku = `TEST-NOTIF-${Date.now()}`;

        // 2. Create Product with stock 6
        const createRes = await query(
            `INSERT INTO products (tenant_id, sku, description, unit_price, tax_rate, unit, type, cost, stock_quantity, category)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 6, 'Test') RETURNING *`,
            [tenantId, sku, "Notification Test Product", 100, 18, "Unit", "product", 50]
        );
        const product = createRes.rows[0];
        console.log(`Created product ${product.id} with stock 6`);

        // 3. Reduce stock by 2 (Result: 4, Threshold: 5)
        await inventoryService.recordMovement(tenantId, {
            product_id: product.id,
            type: "out",
            quantity: 2,
            reference_id: 8888,
            reason: "Trigger Notification"
        });
        console.log("Recorded movement -2");

        // 4. Verify Notification
        const notifRes = await query(
            `SELECT * FROM notifications WHERE tenant_id = $1 AND title = 'Alerta de Stock Bajo' ORDER BY created_at DESC LIMIT 1`,
            [tenantId]
        );

        if (notifRes.rows.length > 0) {
            const notif = notifRes.rows[0];
            if (notif.message.includes(product.description)) {
                console.log("SUCCESS: Notification created!", notif);
            } else {
                console.warn("WARNING: Notification found but message mismatch", notif);
            }
        } else {
            console.error("FAILURE: No notification found in DB.");
        }

        // Cleanup
        await query("DELETE FROM inventory_movements WHERE product_id = $1", [product.id]);
        await query("DELETE FROM products WHERE id = $1", [product.id]);
        if (notifRes.rows[0]) {
            await query("DELETE FROM notifications WHERE id = $1", [notifRes.rows[0].id]);
        }

    } catch (e: any) {
        const fs = require('fs');
        fs.writeFileSync('test_error.json', JSON.stringify(e, Object.getOwnPropertyNames(e), 2));
        console.error("Error written to test_error.json");
    }
    process.exit(0);
}

testNotification();
