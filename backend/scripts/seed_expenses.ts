import { pool } from "../src/db";

async function seedExpenses() {
  console.log("Seeding expenses...");
  const client = await pool.connect();

  try {
    // We know the user 'vmhowleyh@gmail.com' is in Tenant ID 20
    const tenantId = 20;

    // Verify tenant exists
    const tenantRes = await client.query(
      "SELECT id FROM tenants WHERE id = $1",
      [tenantId]
    );
    if (tenantRes.rows.length === 0) {
      console.log(
        `Tenant ${tenantId} not found. Ensure it exists before seeding.`
      );
      return;
    }
    console.log(`Seeding for Tenant ID: ${tenantId}`);

    // 2. Create Providers
    const providersData = [
      {
        name: "CDEEE - Edesur",
        rnc: "101000000",
        email: "facturacion@edesur.com.do",
      },
      {
        name: "Claro Dominicana",
        rnc: "101000001",
        email: "pagos@claro.com.do",
      },
      {
        name: "Supermercado Bravo",
        rnc: "101000002",
        email: "ventas@bravo.com.do",
      },
    ];

    const providerIds: number[] = [];

    for (const p of providersData) {
      // Check if exists
      const check = await client.query(
        "SELECT id FROM providers WHERE tenant_id=$1 AND name=$2",
        [tenantId, p.name]
      );
      if (check.rows.length > 0) {
        providerIds.push(check.rows[0].id);
      } else {
        const res = await client.query(
          "INSERT INTO providers (tenant_id, name, rnc, email) VALUES ($1, $2, $3, $4) RETURNING id",
          [tenantId, p.name, p.rnc, p.email]
        );
        providerIds.push(res.rows[0].id);
        console.log(`Created provider: ${p.name}`);
      }
    }

    // 3. Create Expenses (Distributed over last 7 days)
    // We want some reds in the chart!
    const today = new Date();

    // Day 0 (Today) - High Expense
    await createExpense(
      client,
      tenantId,
      providerIds[0],
      "Pago Electricidad Oficina",
      15000,
      "Servicios",
      today
    );

    // Day 1 (Yesterday) - Small
    const d1 = new Date();
    d1.setDate(d1.getDate() - 1);
    await createExpense(
      client,
      tenantId,
      providerIds[2],
      "Café y Suministros",
      2500,
      "Insumos",
      d1
    );

    // Day 3 (3 days ago) - Rent?
    const d3 = new Date();
    d3.setDate(d3.getDate() - 3);
    await createExpense(
      client,
      tenantId,
      null,
      "Alquiler Local Mensual",
      45000,
      "Alquiler",
      d3
    ); // No provider link necessary

    // Day 5 (5 days ago) - Internet
    const d5 = new Date();
    d5.setDate(d5.getDate() - 5);
    await createExpense(
      client,
      tenantId,
      providerIds[1],
      "Internet Fibra Óptica",
      3800,
      "Servicios",
      d5
    );

    console.log("Expenses seeded successfully!");
  } catch (err) {
    console.error("Error seeding:", err);
  } finally {
    client.release();
    pool.end();
  }
}

async function createExpense(
  client: any,
  tenantId: number,
  providerId: number | null,
  desc: string,
  amount: number,
  cat: string,
  date: Date
) {
  await client.query(
    `INSERT INTO expenses (tenant_id, provider_id, description, amount, category, expense_date, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'paid')`,
    [tenantId, providerId, desc, amount, cat, date]
  );
}

seedExpenses();
