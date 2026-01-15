import { query } from "../db";
import * as inventoryService from "../services/inventoryService";

async function testStockFlow() {
  try {
    console.log("Starting stock flow test...");

    // 1. Create a dummy product directly in DB (simulating initial insert with 0 stock)
    const sku = `TEST-${Date.now()}`;
    // Assuming tenant_id 22 based on previous output, but we should probably fetch one or use a fixed one if we knew it.
    // Let's query for a valid tenant_id first.
    const tenantRes = await query("SELECT id FROM tenants LIMIT 1", []);
    if (tenantRes.rows.length === 0) {
      console.error("No tenants found to test with.");
      return;
    }
    const tenantId = tenantRes.rows[0].id;

    console.log(`Using Tenant ID: ${tenantId}`);

    const createRes = await query(
      `INSERT INTO products (tenant_id, sku, description, unit_price, tax_rate, unit, type, cost, stock_quantity, category)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, 'General') RETURNING *`,
      [tenantId, sku, "Test Product Logic", 100, 18, "Unidad", "product", 50]
    );
    const product = createRes.rows[0];
    console.log(
      "Created product:",
      product.id,
      "Stock:",
      product.stock_quantity
    );

    // 2. Perform inventory movement
    console.log("Recording movement of +10...");
    await inventoryService.recordMovement(tenantId, {
      product_id: product.id,
      type: "in",
      quantity: 10,
      reference_id: 99999,
      reason: "Testing Logic",
    });

    // 3. Verify stock
    const verifyRes = await query(
      "SELECT stock_quantity FROM products WHERE id = $1",
      [product.id]
    );
    const finalStock = verifyRes.rows[0].stock_quantity;
    console.log("Final Stock in DB:", finalStock);

    if (parseInt(finalStock) === 10) {
      console.log("SUCCESS: Stock updated correctly.");
    } else {
      console.error("FAILURE: Stock mismatch. Expected 10, got", finalStock);
    }

    // Cleanup
    await query("DELETE FROM inventory_movements WHERE product_id = $1", [
      product.id,
    ]);
    await query("DELETE FROM products WHERE id = $1", [product.id]);
    console.log("Cleanup done.");
  } catch (err) {
    console.error("Test failed:", err);
  }
}

testStockFlow();
