import dotenv from "dotenv";
import path from "path";
import { query } from "../src/db";

dotenv.config({ path: path.join(__dirname, "../.env") });

const checkSchema = async () => {
  try {
    console.log("Checking products table columns...");
    const res = await query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'products'
        `);
    console.log(
      "Columns:",
      res.rows.map((r) => r.column_name)
    );
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkSchema();
