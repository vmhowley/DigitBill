import { pool } from "../src/db";

async function getUser() {
  const client = await pool.connect();
  try {
    // We saw Tenant ID 14 in the logs
    const tenantId = 14;

    // List all users
    const allUsersRes = await client.query(
      "SELECT id, username, role, tenant_id FROM users"
    );
    console.log("All Users in DB:");
    console.table(allUsersRes.rows);

    // List all Tenants
    const allTenants = await client.query("SELECT id, name FROM tenants");
    console.log("All Tenants in DB:");
    console.table(allTenants.rows);
  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    pool.end();
  }
}

getUser();
