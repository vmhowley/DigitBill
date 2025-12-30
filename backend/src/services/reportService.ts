import { query } from "../db";

export const get606 = async (tenantId: number, month: string, year: string) => {
  // Basic CSV generation for 606 (Expenses)
  const res = await query(
    `SELECT e.*, p.rnc as provider_rnc, p.name as provider_name 
         FROM expenses e 
         LEFT JOIN providers p ON e.provider_id = p.id 
         WHERE e.tenant_id = $1 
         AND EXTRACT(MONTH FROM e.expense_date) = $2
         AND EXTRACT(YEAR FROM e.expense_date) = $3`,
    [tenantId, month, year]
  );

  const data = res.rows;
  let csv =
    "RNC/Cédula,NCF,Monto Facturado,ITBIS Facturado,Fecha Comprobante\n";
  data.forEach((row) => {
    csv += `${row.provider_rnc || ""},${row.ncf || ""},${row.amount},${
      row.tax_amount
    },${new Date(row.expense_date).toISOString().split("T")[0]}\n`;
  });
  return csv;
};

export const get607 = async (tenantId: number, month: string, year: string) => {
  // Basic CSV generation for 607 (Sales)
  const res = await query(
    `SELECT i.*, c.rnc as client_rnc, c.name as client_name 
         FROM invoices i 
         LEFT JOIN clients c ON i.client_id = c.id 
         WHERE i.tenant_id = $1 
         AND i.status IN ('signed', 'sent', 'completed')
         AND EXTRACT(MONTH FROM i.created_at) = $2
         AND EXTRACT(YEAR FROM i.created_at) = $3`,
    [tenantId, month, year]
  );

  const data = res.rows;
  let csv =
    "RNC/Cédula,NCF,Monto Facturado,ITBIS Facturado,Fecha Comprobante\n";
  data.forEach((row) => {
    csv += `${row.client_rnc || ""},${row.e_ncf || ""},${row.total},${
      row.itbis || 0
    },${new Date(row.created_at).toISOString().split("T")[0]}\n`;
  });
  return csv;
};
