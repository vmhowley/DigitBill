import { Router } from "express";
import { query } from "../db";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", requireAuth, async (req: any, res) => {
  const { q } = req.query;
  if (!q || typeof q !== "string" || q.length < 2) {
    return res.json([]);
  }

  const searchTerm = `%${q}%`;
  const tenantId = req.tenantId;

  try {
    // Search Invoices
    const invoicesRes = await query(
      `SELECT i.id, i.sequential_number, i.e_ncf, i.status, i.total, c.name as client_name
             FROM invoices i
             LEFT JOIN clients c ON i.client_id = c.id
             WHERE i.tenant_id = $1 AND (i.e_ncf LIKE $2 OR CAST(i.sequential_number AS TEXT) LIKE $3 OR c.name LIKE $4)
             LIMIT 5`,
      [tenantId, searchTerm, searchTerm, searchTerm]
    );

    // Search Clients
    const clientsRes = await query(
      `SELECT id, name, rnc_ci, email
             FROM clients
             WHERE tenant_id = $1 AND (name LIKE $2 OR rnc_ci LIKE $3 OR email LIKE $4)
             LIMIT 5`,
      [tenantId, searchTerm, searchTerm, searchTerm]
    );

    // Search Products
    const productsRes = await query(
      `SELECT id, description, sku, unit_price
             FROM products
             WHERE tenant_id = $1 AND (description LIKE $2 OR sku LIKE $3)
             LIMIT 5`,
      [tenantId, searchTerm, searchTerm]
    );

    const results = [
      ...invoicesRes.rows.map((i: any) => ({
        type: "invoice",
        id: i.id,
        title: `Factura #${i.sequential_number}`,
        subtitle: i.client_name,
        extra: i.e_ncf,
        url: `/invoices/${i.id}`,
      })),
      ...clientsRes.rows.map((c: any) => ({
        type: "client",
        id: c.id,
        title: c.name,
        subtitle: c.rnc_ci,
        extra: c.email,
        url: `/clients`,
      })),
      ...productsRes.rows.map((p: any) => ({
        type: "product",
        id: p.id,
        title: p.description,
        subtitle: p.sku,
        extra: `RD$ ${p.unit_price}`,
        url: `/inventory`,
      })),
    ];

    res.json(results);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
