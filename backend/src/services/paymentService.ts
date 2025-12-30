import { query } from "../db";
import { logger } from "../utils/logger";

export const recordPayment = async (
  tenantId: number,
  data: {
    invoice_id: number;
    amount: number;
    payment_method: string;
    reference?: string;
    payment_date?: string;
  }
) => {
  try {
    const res = await query(
      `INSERT INTO payments (tenant_id, invoice_id, amount, payment_method, reference, payment_date)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
      [
        tenantId,
        data.invoice_id,
        data.amount,
        data.payment_method,
        data.reference,
        data.payment_date || new Date().toISOString(),
      ]
    );

    logger.info("Payment recorded", {
      paymentId: res.rows[0].id,
      invoiceId: data.invoice_id,
    });
    return res.rows[0];
  } catch (error) {
    logger.error("Error recording payment", { tenantId, error });
    throw error;
  }
};

export const getPaymentsByInvoice = async (
  tenantId: number,
  invoiceId: number
) => {
  const res = await query(
    "SELECT * FROM payments WHERE tenant_id = $1 AND invoice_id = $2 ORDER BY payment_date DESC",
    [tenantId, invoiceId]
  );
  return res.rows;
};

export const getPaymentsByClient = async (
  tenantId: number,
  clientId: number
) => {
  const res = await query(
    `SELECT p.* 
         FROM payments p
         JOIN invoices i ON p.invoice_id = i.id
         WHERE p.tenant_id = $1 AND i.client_id = $2
         ORDER BY p.payment_date DESC`,
    [tenantId, clientId]
  );
  return res.rows;
};

export const getClientBalance = async (tenantId: number, clientId: number) => {
  // Total invoiced minus total paid for a specific client
  const res = await query(
    `SELECT 
            (SELECT COALESCE(SUM(total), 0) FROM invoices WHERE tenant_id = $1 AND client_id = $2 AND status != 'draft') as total_invoiced,
            (SELECT COALESCE(SUM(p.amount), 0) 
             FROM payments p 
             JOIN invoices i ON p.invoice_id = i.id 
             WHERE p.tenant_id = $1 AND i.client_id = $2) as total_paid`,
    [tenantId, clientId]
  );

  const { total_invoiced, total_paid } = res.rows[0];
  return parseFloat(total_invoiced) - parseFloat(total_paid);
};

export const getTotalAR = async (tenantId: number) => {
  // Total Accounts Receivable for the tenant
  const res = await query(
    `SELECT 
            (SELECT COALESCE(SUM(total), 0) FROM invoices WHERE tenant_id = $1 AND status != 'draft') as total_invoiced,
            (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE tenant_id = $1) as total_paid`,
    [tenantId]
  );

  const { total_invoiced, total_paid } = res.rows[0];
  return parseFloat(total_invoiced) - parseFloat(total_paid);
};
