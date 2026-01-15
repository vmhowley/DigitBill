import { getClient, query } from "../db";

export const recordMovement = async (tenantId: number, data: any) => {
  const client = await getClient();
  try {
    await client.query("BEGIN");

    // 1. Core Logic check: Prevent negative stock for tangible products
    if (data.type === "out") {
      const prodRes = await client.query(
        "SELECT type, stock_quantity, description FROM products WHERE id = $1",
        [data.product_id]
      );
      if (prodRes.rows.length > 0) {
        const product = prodRes.rows[0];
        if (
          product.type === "product" &&
          product.stock_quantity < data.quantity
        ) {
          await client.query("ROLLBACK");
          client.release();
          throw new Error(
            `Stock insuficiente para "${product.description}". disponible: ${product.stock_quantity}, solicitado: ${data.quantity}`
          );
        }
      }
    }

    // 2. Record movement
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
         AND type = 'product'
         ORDER BY stock_quantity ASC`,
    [tenantId]
  );
  return res.rows;
};
