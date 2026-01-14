import express from "express";
import { query } from "../db";
// @ts-ignore
import { generateDeliveryNotePdf } from "../services/pdfService";

const router = express.Router();

// Middleware to inject tenantId (should be applied globally or here)
// Assuming standard middleware sets req.tenantId

// GET /api/delivery/:invoiceId/pdf
// Generates a "Conduce" PDF for the given invoice
router.get("/:invoiceId/pdf", async (req: any, res) => {
    try {
        const { invoiceId } = req.params;
        const tenantId = req.tenantId || 1; // Fallback or use auth middleware

        // 1. Fetch Invoice
        const invRes = await query(
            `SELECT i.*, c.name as client_name, c.rnc_ci as client_rnc_ci, c.address as client_address 
       FROM invoices i 
       JOIN clients c ON i.client_id = c.id 
       WHERE i.id = $1 AND i.tenant_id = $2`,
            [invoiceId, tenantId]
        );

        if (invRes.rows.length === 0) {
            return res.status(404).json({ error: "Invoice not found" });
        }
        const invoice = invRes.rows[0];

        // 2. Fetch Items
        const itemsRes = await query(
            "SELECT * FROM invoice_items WHERE invoice_id = $1 AND tenant_id = $2",
            [invoiceId, tenantId]
        );
        const items = itemsRes.rows;

        // 3. Fetch Company Info
        const { getCompanyConfig } = require("../services/configService");
        const config = await getCompanyConfig(tenantId);

        // Prepare Data
        const pdfData = {
            invoice,
            company: config,
            items
        };

        // 4. Stream PDF
        const filename = `conduce-${invoice.sequential_number || invoice.id}.pdf`;
        res.setHeader("Content-disposition", `attachment; filename="${filename}"`);
        res.setHeader("Content-type", "application/pdf");

        generateDeliveryNotePdf(pdfData, res);

    } catch (err: any) {
        console.error("Error generating Delivery PDF:", err);
        res.status(500).json({ error: "Failed to generate Delivery Note" });
    }
});

export default router;
