import { getClient, query } from "../db";

export const recordMovement = async (tenantId: number, data: any) => {
  const client = await getClient();
  try {
    await client.query("BEGIN");

    // 1. Record movement
    const moveRes = await client.query(
      `INSERT INTO inventory_movements (tenant_id, product_id, type, quantity, reference_id, reason)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        tenantId,
        data.product_id,
        data.type,
        data.quantity,
        data.reference_id,
        data.reason,
      ]
    );

    // 2. Update product stock
    const multiplier = data.type === "in" ? 1 : -1;
    await client.query(
      `UPDATE products SET stock_quantity = stock_quantity + $1 WHERE id = $2 AND tenant_id = $3`,
      [data.quantity * multiplier, data.product_id, tenantId]
    );

    await client.query("COMMIT");
    return moveRes.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

export const getMovementsByProduct = async (
  tenantId: number,
  productId: number
) => {
  const res = await query(
    `SELECT * FROM inventory_movements 
         WHERE tenant_id = $1 AND product_id = $2 
         ORDER BY created_at DESC`,
    [tenantId, productId]
  );
  return res.rows;
};

export const getStockAlerts = async (tenantId: number) => {
  // Products with stock < 5
  const res = await query(
    `SELECT * FROM products 
         WHERE tenant_id = $1 AND stock_quantity < 5 
         ORDER BY stock_quantity ASC`,
    [tenantId]
  );
  return res.rows;
};
