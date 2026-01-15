import { query } from "../db";
import * as inventoryService from "../services/inventoryService";

async function testNullReference() {
  try {
    console.log("Testing NULL reference_id...");

    // Get tenant
    const tenantRes = await query("SELECT id FROM tenants LIMIT 1", []);
    const tenantId = tenantRes.rows[0].id;

    // Create dummy product
    const sku = `TEST-NULL-${Date.now()}`;
    const createRes = await query(
      `INSERT INTO products (tenant_id, sku, description, unit_price, tax_rate, unit, type, cost, stock_quantity, category)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, 'General') RETURNING *`,
      [tenantId, sku, "Test Null Ref", 100, 18, "Unidad", "product", 50]
    );
    const product = createRes.rows[0];

    // Try movement with NULL reference_id
    await inventoryService.recordMovement(tenantId, {
      product_id: product.id,
      type: "in",
      quantity: 5,
      reference_id: null,
      reason: "Testing Null Reference",
    });

    console.log("Movement recorded successfully with NULL reference_id.");

    // Verify stock
    const verifyRes = await query(
      "SELECT stock_quantity FROM products WHERE id = $1",
      [product.id]
    );
    const finalStock = verifyRes.rows[0].stock_quantity;
    console.log("Final Stock:", finalStock);

    // Cleanup
    await query("DELETE FROM inventory_movements WHERE product_id = $1", [
      product.id,
    ]);
    await query("DELETE FROM products WHERE id = $1", [product.id]);
  } catch (err) {
    console.error("Test failed:", err);
  }
}

testNullReference();
