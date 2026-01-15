import { query } from "../db";

async function checkInventoryColumns() {
  try {
    const res = await query("SELECT * FROM inventory_movements LIMIT 1", []);
    if (res.rows.length === 0) {
      // If empty, we can't easily see types from JS, but let's assume reference_id might be int?
      // Let's try to insert a dummy to see error or just check schema if we can.
      // Actually, let's just make the test script use an integer 0 or 1 for reference_id and see.
      // But wait, "reference_id" usually refers to an invoice or purchase order ID which are ints.
      console.log("No movements found.");
    } else {
      console.log("Movement sample:", res.rows[0]);
    }
  } catch (err) {
    console.error("Error checking columns:", err);
  }
}

checkInventoryColumns();
