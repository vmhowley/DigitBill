import { query } from "../db";

async function checkColumns() {
  try {
    const res = await query("SELECT * FROM products LIMIT 1", []);
    if (res.rows.length === 0) {
      console.log("No products found, cannot check columns.");
      // If table exists but empty, we can check information_schema or just insert one and see
      // But for now let's hope there is data (seed scripts imply there is)
    } else {
      console.log("Columns found:", Object.keys(res.rows[0]));
      console.log("First row:", res.rows[0]);
    }
  } catch (err) {
    console.error("Error checking columns:", err);
  }
}

checkColumns();
