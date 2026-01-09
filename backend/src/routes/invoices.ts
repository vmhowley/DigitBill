import { Router } from "express";
import { pool, query } from "../db";
import { requireAuth } from "../middleware/auth";
import { issueInvoice } from "../services/invoiceService";
import { logger } from "../utils/logger";
import { getPlanLimits } from "../utils/planLimits";

const router = Router();

// Protect all routes
router.use(requireAuth);

// GET /api/invoices
// GET /api/invoices
router.get("/", async (req, res) => {
  try {
    const {
      page = "1",
      limit = "10",
      search = "",
      status = "all",
      startDate = "",
      endDate = "",
      all = "false",
    } = req.query;

    const returnAll = all === "true";

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const offset = (pageNum - 1) * limitNum;

    const queryParams: any[] = [req.tenantId];
    let whereClause = "WHERE i.tenant_id = $1";
    let paramIndex = 2;

    // Search Filter
    if (search) {
      whereClause += ` AND (
        i.sequential_number::text ILIKE $${paramIndex} OR 
        c.name ILIKE $${paramIndex} OR 
        i.total::text ILIKE $${paramIndex} OR
        i.ncf ILIKE $${paramIndex}
      )`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    // Status Filter
    if (status && status !== "all") {
      whereClause += ` AND i.status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }

    // Date Filters
    if (startDate) {
      whereClause += ` AND i.created_at >= $${paramIndex}::date`;
      queryParams.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      // Add time to include the full end day
      whereClause += ` AND i.created_at <= ($${paramIndex}::date + INTERVAL '1 day')`;
      queryParams.push(endDate);
      paramIndex++;
    }

    let sql = `
      SELECT 
        i.*, 
        c.name as client_name,
        COALESCE((SELECT SUM(amount) FROM payments WHERE invoice_id = i.id), 0) as total_paid,
        COUNT(*) OVER() as full_count
      FROM invoices i 
      LEFT JOIN clients c ON i.client_id = c.id 
      ${whereClause}
      ORDER BY i.sequential_number DESC
    `;

    if (!returnAll) {
      sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      queryParams.push(limitNum, offset);
    }

    const result = await query(sql, queryParams);

    const cleanedRows = result.rows.map((row) => {
      const { full_count, ...invoiceData } = row; // Remove internal count from item
      return invoiceData;
    });

    if (returnAll) {
      return res.json(cleanedRows);
    }

    const totalItems = parseInt(result.rows[0]?.full_count || "0");
    const totalPages = Math.ceil(totalItems / limitNum);

    res.json({
      data: cleanedRows,
      meta: {
        total: totalItems,
        page: pageNum,
        limit: limitNum,
        totalPages,
      },
    });
  } catch (err) {
    logger.error("Error fetching invoices:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// GET /api/invoices/:id/pdf
router.get("/:id/pdf", async (req, res) => {
  try {
    const { id } = req.params;

    // Check Storage Limits
    const limits = getPlanLimits(req.plan);
    if (limits.maxStorageMB < 99999) {
      // 99999 means unlimited essentially
      // Calculate current storage usage (sum of XML content length)
      const usageRes = await query(
        "SELECT SUM(LENGTH(xml_path)) as total_bytes FROM invoices WHERE tenant_id = $1",
        [req.tenantId]
      );

      const totalBytes = parseInt(usageRes.rows[0].total_bytes || "0");
      const totalMB = totalBytes / (1024 * 1024);

      if (totalMB >= limits.maxStorageMB) {
        return res.status(403).json({
          error: `Has alcanzado el límite de almacenamiento de ${
            limits.maxStorageMB
          }MB para tu plan ${req.plan?.toUpperCase()}. Por favor, actualiza tu plan para continuar generando facturas.`,
        });
      }
    }

    // 1. Fetch Invoice
    const invRes = await query(
      `
        SELECT i.*, c.name as client_name, c.rnc_ci as client_rnc, c.address as client_address, c.phone as client_phone
        FROM invoices i 
        JOIN clients c ON i.client_id = c.id 
        WHERE i.id = $1 AND i.tenant_id = $2
    `,
      [id, req.tenantId]
    );

    if (invRes.rows.length === 0)
      return res.status(404).json({ error: "Invoice not found" });

    const invoice = invRes.rows[0];

    // 2. Fetch Items
    const itemsRes = await query(
      `
        SELECT ii.*, p.description as product_description 
        FROM invoice_items ii 
        LEFT JOIN products p ON ii.product_id = p.id
        WHERE ii.invoice_id = $1
    `,
      [id]
    );
    const items = itemsRes.rows;

    // 3. Fetch Company Config
    const { getCompanyConfig } = require("../services/configService");
    const { generateInvoicePdf } = require("../services/pdfService");
    const config = await getCompanyConfig(req.tenantId);

    // 4. Generate PDF
    const filename = `factura-${
      invoice.e_ncf || invoice.sequential_number
    }.pdf`;

    res.setHeader("Content-disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-type", "application/pdf");

    generateInvoicePdf({ invoice, company: config, items }, res);
  } catch (err: any) {
    console.error("PDF Generation Error:", err);
    res.status(500).json({ error: "Error generating PDF" });
  }
});

// GET /api/invoices/:id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const invRes = await query(
      `
        SELECT i.*, c.name as client_name, c.rnc_ci as client_rnc 
        FROM invoices i 
        JOIN clients c ON i.client_id = c.id 
        WHERE i.id = $1 AND i.tenant_id = $2
    `,
      [id, req.tenantId]
    );

    if (invRes.rows.length === 0)
      return res.status(404).json({ error: "Invoice not found" });

    const itemsRes = await query(
      `
        SELECT ii.*, p.description as product_description 
        FROM invoice_items ii 
        LEFT JOIN products p ON ii.product_id = p.id
        WHERE ii.invoice_id = $1
    `,
      [id]
    );

    res.json({ ...invRes.rows[0], items: itemsRes.rows });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Database error" });
  }
});

// POST /api/invoices
router.post("/", async (req, res) => {
  const dbClient = await pool.connect();
  try {
    const { client_id, items, type_code, reference_ncf, immediate_issue } =
      req.body;

    // Check Plan Limits
    const limits = getPlanLimits(req.plan);
    if (limits.maxInvoicesPerMonth < 9999) {
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const countRes = await dbClient.query(
        "SELECT COUNT(*) as count FROM invoices WHERE tenant_id = $1 AND created_at >= $2",
        [req.tenantId, monthStart]
      );
      const currentCount = parseInt(countRes.rows[0].count);

      if (currentCount >= limits.maxInvoicesPerMonth) {
        return res.status(403).json({
          error: `Has alcanzado el límite de ${
            limits.maxInvoicesPerMonth
          } facturas mensuales para tu plan ${req.plan?.toUpperCase()}.`,
        });
      }
    }

    // Start transaction
    await dbClient.query("BEGIN");

    // Validate invoice type based on plan (reuse limits from above)
    const requestedType = type_code || "31";

    if (limits.features && !limits.features.includes("All")) {
      const allowedTypes = limits.features.filter((f) => f.startsWith("B"));

      // Map type codes to type names
      const typeMap: Record<string, string> = {
        "31": "B01", // Crédito Fiscal
        "32": "B02", // Consumo
        "33": "B03", // Gubernamental
        "34": "B04", // Exportación
        "41": "B11", // Proveedores Informales
        "43": "B13", // Gastos Menores
        "44": "B14", // Regímenes Especiales
        "45": "B15", // Comprobante Gubernamental
        "46": "B16", // Exportaciones
      };

      const requestedTypeName = typeMap[requestedType];
      if (requestedTypeName && !allowedTypes.includes(requestedTypeName)) {
        await dbClient.query("ROLLBACK");
        dbClient.release();
        return res.status(403).json({
          error: `Tu plan ${req.plan?.toUpperCase()} no permite crear facturas tipo ${requestedTypeName}. Tipos permitidos: ${allowedTypes.join(
            ", "
          )}. Actualiza tu plan para acceder a más tipos de comprobantes.`,
        });
      }
    }

    // Calculate totals (simplified)
    let net_total = 0;
    let tax_total = 0;

    // Insert invoice
    const invRes = await dbClient.query(
      "INSERT INTO invoices (tenant_id, client_id, net_total, tax_total, total, type_code, reference_ncf, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id",
      [
        req.tenantId,
        client_id,
        0,
        0,
        0,
        type_code || "31",
        reference_ncf || null,
        "draft", // Set initial status as draft
      ]
    );
    const invoiceId = invRes.rows[0].id;
    // Insert items and calc totals
    for (const item of items) {
      // Verify product existence and get tax rate
      let productId = item.product_id;
      let taxRate = item.tax_rate;

      if (productId === 0 || productId === "0") {
        productId = null;
      } else if (productId) {
        const prodCheck = await dbClient.query(
          "SELECT id, tax_rate FROM products WHERE id = $1",
          [productId]
        );
        if (prodCheck.rows.length === 0) {
          productId = null;
        } else if (taxRate === undefined || taxRate === null) {
          taxRate = parseFloat(prodCheck.rows[0].tax_rate);
        }
      }

      // Default to 18 if still not set
      if (taxRate === undefined || taxRate === null) {
        taxRate = 18.0;
      }

      const lineAmount = item.quantity * item.unit_price;
      const lineTax = (lineAmount * taxRate) / 100;
      net_total += lineAmount;
      tax_total += lineTax;

      await dbClient.query(
        "INSERT INTO invoice_items (tenant_id, invoice_id, product_id, quantity, unit_price, line_amount, line_tax, tax_rate, description) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
        [
          req.tenantId,
          invoiceId,
          productId,
          item.quantity,
          item.unit_price,
          lineAmount,
          lineTax,
          taxRate,
          item.description,
        ]
      );
    }

    const total = net_total + tax_total;
    await dbClient.query(
      "UPDATE invoices SET net_total=$1, tax_total=$2, total=$3 WHERE id=$4",
      [net_total, tax_total, total, invoiceId]
    );

    await dbClient.query("COMMIT");

    if (immediate_issue) {
      console.log(`Attempting immediate issuance for invoice ${invoiceId}`);
      try {
        const result = await issueInvoice(req.tenantId!, invoiceId);
        console.log(`Immediate issuance successful for invoice ${invoiceId}`);
        return res.json({ id: invoiceId, ...result });
      } catch (err) {
        console.error(
          `Immediate issuance FAILED for invoice ${invoiceId}:`,
          err
        );
        return res.json({
          id: invoiceId,
          status: "draft",
          error:
            "Invoice created as draft but failed to issue: " +
            (err as Error).message,
        });
      }
    }

    res.json({ id: invoiceId, status: "draft" });
  } catch (err) {
    await dbClient.query("ROLLBACK");
    logger.error("Error creating invoice", { error: err });
    res.status(500).json({ error: "Error creating invoice" });
  } finally {
    dbClient.release();
  }
});

// POST /api/invoices/:id/sign
router.post("/:id/sign", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await issueInvoice(req.tenantId!, parseInt(id));
    res.json({ message: "Invoice processed successfully", ...result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: (err as Error).message });
  }
});

// GET /api/invoices/:id/xml
router.get("/:id/xml", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      "SELECT xml_path, tenant_id FROM invoices WHERE id = $1 AND tenant_id = $2",
      [id, req.tenantId]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Invoice not found" });

    const { getCompanyConfig } = require("../services/configService");
    const config = await getCompanyConfig(result.rows[0].tenant_id);
    if (!config.electronic_invoicing) {
      return res
        .status(400)
        .json({ error: "XML is only available for electronic invoices" });
    }

    const xmlContent = result.rows[0].xml_path;

    if (!xmlContent || xmlContent === "stored_in_db") {
      return res.status(404).json({
        error:
          "XML content not available for this invoice. Please sign the invoice again or create a new one.",
      });
    }

    if (!xmlContent.trim().startsWith("<")) {
      // If it doesn't look like XML, send as text to avoid browser parsing errors
      res.header("Content-Type", "text/plain");
      return res.send(xmlContent);
    }

    res.header("Content-Type", "application/xml");
    res.send(xmlContent);
  } catch (err) {
    res.status(500).json({ error: "Error fetching XML" });
  }
});

// POST /api/invoices/:id/send
router.post("/:id/send", async (req, res) => {
  try {
    const { id } = req.params;
    const invRes = await query(
      "SELECT * FROM invoices WHERE id = $1 AND tenant_id = $2",
      [id, req.tenantId]
    );
    if (invRes.rows.length === 0)
      return res.status(404).json({ error: "Invoice not found" });

    const invoice = invRes.rows[0];

    const { getCompanyConfig } = require("../services/configService");
    const config = await getCompanyConfig(invoice.tenant_id);

    if (!config.electronic_invoicing) {
      return res
        .status(400)
        .json({ error: "Electronic invoicing is disabled" });
    }

    if (invoice.status !== "signed") {
      return res
        .status(400)
        .json({ error: "Invoice must be signed before sending" });
    }

    // Get XML content
    const xmlContent = invoice.xml_path;

    if (!xmlContent || !xmlContent.startsWith("<")) {
      return res.status(400).json({ error: "Invalid or missing XML content" });
    }

    // Send to DGII
    const { sendToDGII } = require("../services/dgiiService");
    const response = await sendToDGII(xmlContent, req.tenantId);

    // Update status
    await query("UPDATE invoices SET status=$1 WHERE id=$2 AND tenant_id=$3", [
      "sent",
      id,
      req.tenantId,
    ]);

    res.json({
      message: "Sent to DGII successfully",
      trackId: response.trackId || response,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Error sending to DGII: " + err.message });
  }
});

// POST /api/invoices/:id/email
router.post("/:id/email", async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email recipient is required" });
    }

    const invRes = await query(
      `SELECT i.*, c.name as client_name, c.email as client_email 
       FROM invoices i 
       JOIN clients c ON i.client_id = c.id 
       WHERE i.id = $1 AND i.tenant_id = $2`,
      [id, req.tenantId]
    );

    if (invRes.rows.length === 0)
      return res.status(404).json({ error: "Invoice not found" });

    const invoice = invRes.rows[0];

    if (invoice.status === "draft") {
      return res
        .status(400)
        .json({ error: "No se puede enviar una factura en borrador" });
    }

    const { getCompanyConfig } = require("../services/configService");
    const { sendInvoiceEmail } = require("../services/emailService");
    const config = await getCompanyConfig(req.tenantId);

    // Prepare company info for the email
    const company = {
      name: config.company_name,
      address: config.address || "Dominican Republic",
      phone: config.phone || "",
    };

    // Fetch tenant email for reply-to
    const tenantRes = await query("SELECT email FROM tenants WHERE id = $1", [
      req.tenantId,
    ]);
    const tenantEmail = tenantRes.rows[0]?.email;

    // Use Company Name as the Sender Name (e.g. "Hell Sec.Srl")
    const senderName = config.company_name || "DigitBill";

    // Reply-To should be the company email if available, otherwise the user email
    const replyToEmail = tenantEmail || req.user?.email;

    // Check Plan for Premium Email Features
    const planRes = await query("SELECT plan FROM tenants WHERE id = $1", [
      req.tenantId,
    ]);
    const plan = planRes.rows[0]?.plan;
    const isPremium = plan === "pyme" || plan === "enterprise";

    await sendInvoiceEmail(
      email,
      invoice,
      company,
      replyToEmail,
      senderName,
      tenantEmail,
      isPremium
    );

    res.json({ success: true, message: "Factura enviada correctamente" });
  } catch (err: any) {
    console.error("Email Send Error:", err);
    res
      .status(500)
      .json({ error: "Error al enviar el correo: " + err.message });
  }
});

// POST /api/invoices/:id/reminder
router.post("/:id/reminder", async (req, res) => {
  try {
    const { id } = req.params;

    const invRes = await query(
      `SELECT i.*, c.name as client_name, c.email as client_email 
       FROM invoices i 
       JOIN clients c ON i.client_id = c.id 
       WHERE i.id = $1 AND i.tenant_id = $2`,
      [id, req.tenantId]
    );

    if (invRes.rows.length === 0)
      return res.status(404).json({ error: "Invoice not found" });

    const invoice = invRes.rows[0];

    if (invoice.status === "paid" || invoice.status === "draft") {
      return res.status(400).json({
        error: "Solo se pueden enviar recordatorios de facturas pendientes",
      });
    }

    if (!invoice.client_email) {
      return res.status(400).json({
        error: "El cliente no tiene un correo electrónico registrado",
      });
    }

    const { getCompanyConfig } = require("../services/configService");
    const { sendPaymentReminderEmail } = require("../services/emailService");
    const config = await getCompanyConfig(req.tenantId);

    // Prepare company info for the email
    const company = {
      name: config.company_name,
      address: config.address || "Dominican Republic",
      phone: config.phone || "",
    };

    // Fetch tenant email for reply-to
    const tenantRes = await query("SELECT email FROM tenants WHERE id = $1", [
      req.tenantId,
    ]);
    const tenantEmail = tenantRes.rows[0]?.email;

    // Use Company Name as the Sender Name
    const senderName = config.company_name || "DigitBill";

    // Reply-To should be the company email if available
    const replyToEmail = tenantEmail || req.user?.email;

    // Construct Public URL if share_token exists
    let publicUrl;
    if (invoice.share_token) {
      // We need the frontend URL. Since we don't strictly have it in ENV for backend, assume standard or pass via req?
      // Let's assume standard production URL or localhost based on origin header if possible
      const origin = req.get("origin") || "https://app.digitbill.do";
      publicUrl = `${origin}/p/${invoice.share_token}`;
    }

    // Check Plan for Premium Email Features
    const planRes = await query("SELECT plan FROM tenants WHERE id = $1", [
      req.tenantId,
    ]);
    const plan = planRes.rows[0]?.plan;
    const isPremium = plan === "pyme" || plan === "enterprise";

    await sendPaymentReminderEmail(
      invoice.client_email,
      invoice,
      company,
      publicUrl,
      replyToEmail,
      senderName,
      tenantEmail,
      isPremium
    );

    res.json({
      success: true,
      message: "Recordatorio de pago enviado correctamente",
    });
  } catch (err: any) {
    console.error("Reminder Send Error:", err);
    res
      .status(500)
      .json({ error: "Error al enviar el recordatorio: " + err.message });
  }
});

export default router;
