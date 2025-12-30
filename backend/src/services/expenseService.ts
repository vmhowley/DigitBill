import { query } from "../db";

// Providers
export const createProvider = async (tenantId: number, data: any) => {
  const res = await query(
    `INSERT INTO providers (tenant_id, name, rnc, phone, email)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [tenantId, data.name, data.rnc, data.phone, data.email]
  );
  return res.rows[0];
};

export const getProviders = async (tenantId: number) => {
  const res = await query(
    "SELECT * FROM providers WHERE tenant_id = $1 ORDER BY name",
    [tenantId]
  );
  return res.rows;
};

// Expenses
export const createExpense = async (tenantId: number, data: any) => {
  const res = await query(
    `INSERT INTO expenses (tenant_id, provider_id, ncf, description, amount, tax_amount, category, expense_date, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [
      tenantId,
      data.provider_id,
      data.ncf,
      data.description,
      data.amount,
      data.tax_amount || 0,
      data.category,
      data.expense_date,
      data.status || "paid",
    ]
  );
  return res.rows[0];
};

export const getExpenses = async (tenantId: number) => {
  const res = await query(
    `SELECT e.*, p.name as provider_name 
         FROM expenses e 
         LEFT JOIN providers p ON e.provider_id = p.id 
         WHERE e.tenant_id = $1 
         ORDER BY e.expense_date DESC`,
    [tenantId]
  );
  return res.rows;
};

export const getExpenseStats = async (tenantId: number) => {
  const res = await query(
    `SELECT category, SUM(amount) as total 
         FROM expenses 
         WHERE tenant_id = $1 
         GROUP BY category`,
    [tenantId]
  );
  return res.rows;
};
