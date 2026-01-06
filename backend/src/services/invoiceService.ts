import { query } from "../db";
import { getCompanyConfig } from "./configService";
import * as inventoryService from "./inventoryService";
import { getNextNCF } from "./sequencesService";
import { loadP12, signXml } from "./signatureService";
import { buildECFXML } from "./xmlService";

export const issueInvoice = async (tenantId: number, invoiceId: number) => {
  // 1. Fetch invoice data
  const invRes = await query(
    "SELECT * FROM invoices WHERE id = $1 AND tenant_id = $2",
    [invoiceId, tenantId]
  );
  if (invRes.rows.length === 0) throw new Error("Invoice not found");
  const invoice = invRes.rows[0];

  if (invoice.status !== "draft")
    throw new Error("Invoice is not in draft status");

  // 2. Fetch dependencies
  const [clientRes, itemsRes, tenantRes, config] = await Promise.all([
    query("SELECT * FROM clients WHERE id = $1", [invoice.client_id]),
    query(
      "SELECT ii.*, p.description as product_description FROM invoice_items ii LEFT JOIN products p ON ii.product_id = p.id WHERE ii.invoice_id = $1",
      [invoiceId]
    ),
    query("SELECT name, rnc FROM tenants WHERE id = $1", [tenantId]),
    getCompanyConfig(tenantId),
  ]);

  const tenant = tenantRes.rows[0];
  const client = clientRes.rows[0];
  const items = itemsRes.rows;

  // 3. Determine NCF
  let ncf = invoice.e_ncf;
  if (!ncf) {
    ncf = await getNextNCF(
      tenantId,
      invoice.type_code || "31",
      config.electronic_invoicing
    );
    await query("UPDATE invoices SET e_ncf = $1 WHERE id = $2", [
      ncf,
      invoiceId,
    ]);
  }

  // 4. Handle Issuance Logic
  if (!config.electronic_invoicing) {
    // Traditional Invoice
    await query("UPDATE invoices SET status=$1, e_ncf=$2 WHERE id=$3", [
      "completed",
      ncf,
      invoiceId,
    ]);

    // Inventory
    for (const item of items) {
      if (item.product_id) {
        await inventoryService.recordMovement(tenantId, {
          product_id: item.product_id,
          type: "out",
          quantity: item.quantity,
          reference_id: invoiceId,
          reason: `Venta (Factura #${invoiceId})`,
        });
      }
    }
    return { status: "completed", ncf };
  } else {
    // Electronic Invoice
    const xmlData = {
      emisor: {
        rnc: tenant.rnc || config.company_rnc,
        nombre: tenant.name || config.company_name,
      },
      receptor: { rnc: client.rnc_ci, nombre: client.name },
      fecha: new Date().toISOString(),
      tipo: invoice.type_code || "31",
      encf: ncf,
      items: items.map((it: any) => ({
        descripcion:
          it.product_description ||
          it.description ||
          "Product " + it.product_id,
        cantidad: it.quantity,
        precio: it.unit_price,
        monto: it.line_amount,
        impuesto: it.line_tax,
        itbis_rate: it.tax_rate ? it.tax_rate.toString() : "18",
      })),
      subtotal: invoice.net_total,
      impuestototal: invoice.tax_total,
      total: invoice.total,
      fecha_vencimiento: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
      metodo_pago: "01",
    };

    const xml = buildECFXML(xmlData as any);
    const { privateKeyPem, certPem } = loadP12(
      config.certificate_path,
      config.certificate_password
    );
    const signedXml = signXml(xml, privateKeyPem, certPem);

    await query(
      "UPDATE invoices SET status=$1, xml_path=$2, e_ncf=$3 WHERE id=$4",
      ["signed", signedXml, ncf, invoiceId]
    );

    // Inventory for Electronic
    for (const item of items) {
      if (item.product_id) {
        await inventoryService.recordMovement(tenantId, {
          product_id: item.product_id,
          type: "out",
          quantity: item.quantity,
          reference_id: invoiceId,
          reason: `Venta (e-CF #${ncf})`,
        });
      }
    }
    return { status: "signed", ncf, xml: signedXml };
  }
};
