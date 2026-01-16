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
    csv += `${row.provider_rnc || ""},${row.ncf || ""},${row.amount},${row.tax_amount
      },${new Date(row.expense_date).toISOString().split("T")[0]}\n`;
  });
  return csv;
};

export const get607 = async (tenantId: number, month: string, year: string) => {
  // Basic CSV generation for 607 (Sales)
  const res = await query(
    `SELECT i.*, c.rnc_ci as client_rnc, c.name as client_name 
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
    csv += `${row.client_rnc || ""},${row.e_ncf || ""},${row.total},${row.tax_total || 0
      },${new Date(row.created_at).toISOString().split("T")[0]}\n`;
  });
  return csv;
};

export const get608 = async (tenantId: number, month: string, year: string) => {
  // 608: Comprobantes Anulados
  const res = await query(
    `SELECT i.* 
         FROM invoices i 
         WHERE i.tenant_id = $1 
         AND i.status = 'voided'
         AND EXTRACT(MONTH FROM i.created_at) = $2
         AND EXTRACT(YEAR FROM i.created_at) = $3`,
    [tenantId, month, year]
  );

  const data = res.rows;
  let csv = "NCF,Fecha Anulacion,Tipo Anulacion\n";
  data.forEach((row) => {
    const reason = "03"; // 03 = Deterioro de Factura / Error de Impresión (Default generic code)
    csv += `${row.e_ncf || ""},${new Date(row.created_at).toISOString().split("T")[0]
      },${reason}\n`;
  });
  return csv;
};

export const getIT1 = async (tenantId: number, month: string, year: string) => {
  // IT-1: ITBIS Declaration Summary
  const [salesRes, expensesRes] = await Promise.all([
    query(
      `SELECT SUM(net_total) as total_net, SUM(tax_total) as total_tax 
             FROM invoices 
             WHERE tenant_id = $1 
             AND status IN ('signed', 'sent', 'completed')
             AND EXTRACT(MONTH FROM created_at) = $2
             AND EXTRACT(YEAR FROM created_at) = $3`,
      [tenantId, month, year]
    ),
    query(
      `SELECT SUM(amount) as total_net, SUM(tax_amount) as total_tax 
             FROM expenses 
             WHERE tenant_id = $1 
             AND EXTRACT(MONTH FROM expense_date) = $2
             AND EXTRACT(YEAR FROM expense_date) = $3`,
      [tenantId, month, year]
    ),
  ]);

  const sales = salesRes.rows[0];
  const expenses = expensesRes.rows[0];

  return {
    period: `${month}/${year}`,
    sales: {
      net: parseFloat(sales.total_net || 0),
      tax: parseFloat(sales.total_tax || 0),
    },
    expenses: {
      net: parseFloat(expenses.total_net || 0),
      tax: parseFloat(expenses.total_tax || 0),
    },
    payable:
      parseFloat(sales.total_tax || 0) - parseFloat(expenses.total_tax || 0),
  };
};

// Official DGII TXT Format Helpers
// 606: RNC|ID_TYPE_RNC|COST_TYPE|NCF|NCF_MODIFIED|DATE|...|PAYMENT_TYPE|
// Simplified MVP Implementation for Pre-Validation
export const get606Txt = async (tenantId: number, month: string, year: string) => {
  const res = await query(
    `SELECT e.*, p.rnc as provider_rnc 
         FROM expenses e 
         LEFT JOIN providers p ON e.provider_id = p.id 
         WHERE e.tenant_id = $1 
         AND EXTRACT(MONTH FROM e.expense_date) = $2
         AND EXTRACT(YEAR FROM e.expense_date) = $3`,
    [tenantId, month, year]
  );

  let txt = "";
  res.rows.forEach(row => {
    const rnc = row.provider_rnc || "";
    const idType = rnc.length === 9 ? "1" : "2"; // 1=RNC, 2=Cedula
    const costType = row.cost_type || "02"; // Default Service
    const ncf = row.ncf || "";
    const ncfMod = ""; // Empty if not a note
    const date = new Date(row.expense_date).toISOString().replace(/-/g, "").substring(0, 6); // YYYYMM
    const fechaPago = new Date(row.expense_date).toISOString().replace(/-/g, "").substring(0, 8); // YYYYMMDD (Simplified: assuming paid same day)

    const serviceAmount = row.amount || 0;
    const goodsAmount = 0; // Simplified separator
    const total = row.amount || 0;
    const itbis = row.tax_amount || 0;
    const retained = 0;

    // Official 606 pipe structure (Partial representation for MVP)
    // RNC | IdType | CostType | NCF | NCF_Mod | YearMonth | Date | ServiceAmt | GoodsAmt | Total | ITBIS | Retained | ... | PayMethod
    txt += `${rnc}|${idType}|${costType}|${ncf}|${ncfMod}|${date}|${fechaPago}|${serviceAmount}|${goodsAmount}|${total}|${itbis}|${retained}||||||||01|\n`;
  });
  return txt;
};

export const get607Txt = async (tenantId: number, month: string, year: string) => {
  const res = await query(
    `SELECT i.*, c.rnc_ci as client_rnc 
         FROM invoices i 
         LEFT JOIN clients c ON i.client_id = c.id 
         WHERE i.tenant_id = $1 
         AND i.status IN ('signed', 'sent', 'completed')
         AND EXTRACT(MONTH FROM i.created_at) = $2
         AND EXTRACT(YEAR FROM i.created_at) = $3`,
    [tenantId, month, year]
  );

  let txt = "";
  res.rows.forEach(row => {
    const rnc = row.client_rnc || "000000000"; // Generic consumer if empty
    const idType = rnc.length === 9 ? "1" : "2";
    const ncf = row.e_ncf || "";
    const ncfMod = "";
    const incomeType = "01"; // Financial Income
    const date = new Date(row.created_at).toISOString().replace(/-/g, "").substring(0, 6); // YYYYMM
    const fechaRet = "";
    const total = row.total || 0;
    const itbis = row.tax_total || 0;

    // Official 607 pipe structure
    // RNC | IdType | NCF | NCF_Mod | IncomeType | YearMonth | DateRet | Total | ITBIS | ... | Cash | Check | Card | Credit | ...
    // We assume 100% Cash/Transfer (col 17) for now or similar simplified mapping
    txt += `${rnc}|${idType}|${ncf}|${ncfMod}|${incomeType}|${date}|${fechaRet}|${total}|${itbis}|||||||||${total}||||||\n`;
  });
  return txt;
};
