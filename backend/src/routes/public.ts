import { Router } from "express";
import { query } from "../db";

const router = Router();

// GET /api/public/invoices/:token
router.get("/invoices/:token", async (req, res) => {
  try {
    const { token } = req.params;

    // 1. Get Invoice & Tenant Info
    const invRes = await query(
      `
            SELECT 
                i.id, i.sequential_number, i.issue_date, i.status, 
                i.net_total, i.tax_total, i.total, 
                i.e_ncf, i.type_code, i.reference_ncf,
                i.xml_path, -- Needed for QR
                t.name as company_name, t.rnc as company_rnc, t.address as company_address, 
                t.phone as company_phone, t.email as company_email,
                c.name as client_name, c.rnc_ci as client_rnc, c.email as client_email, c.phone as client_phone
            FROM invoices i
            JOIN tenants t ON i.tenant_id = t.id
            LEFT JOIN clients c ON i.client_id = c.id
            WHERE i.share_token::text = $1
        `,
      [token]
    );

    if (invRes.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Factura no encontrada o enlace inválido" });
    }

    const invoice = invRes.rows[0];

    // 2. Get Items
    const itemsRes = await query(
      `
            SELECT 
                description, quantity, unit_price, line_amount, line_tax, tax_rate
            FROM invoice_items
            WHERE invoice_id = $1
        `,
      [invoice.id]
    );

    res.json({
      ...invoice,
      items: itemsRes.rows,
    });
  } catch (err) {
    console.error("Public Invoice Error:", err);
    res.status(500).json({ error: "Error al cargar la factura" });
  }
});

export default router;
