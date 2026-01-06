import { pool } from "../db";
import { logger } from "../utils/logger";

export const getNextNCF = async (
  tenantId: number,
  typeCode: string,
  isElectronic: boolean = true
): Promise<string> => {
  const dbClient = await pool.connect();
  try {
    await dbClient.query("BEGIN");

    // 1. Get the current sequence for this tenant and type
    let res = await dbClient.query(
      `SELECT * FROM sequences 
       WHERE tenant_id = $1 AND type_code = $2 
       FOR UPDATE`,
      [tenantId, typeCode]
    );

    if (res.rows.length === 0) {
      // Auto-create a default sequence
      await dbClient.query(
        "INSERT INTO sequences (tenant_id, type_code, next_number) VALUES ($1, $2, $3)",
        [tenantId, typeCode, 1]
      );
      res = await dbClient.query(
        `SELECT * FROM sequences 
         WHERE tenant_id = $1 AND type_code = $2 
         FOR UPDATE`,
        [tenantId, typeCode]
      );
    }

    const sequence = res.rows[0];
    const currentDate = new Date();

    // 2. Validate dates
    if (sequence.start_date && new Date(sequence.start_date) > currentDate) {
      throw new Error("Sequence not yet active");
    }
    if (sequence.end_date && new Date(sequence.end_date) < currentDate) {
      throw new Error("Sequence expired");
    }

    // 3. Validate numeric range
    if (
      sequence.current_end_number &&
      sequence.next_number > sequence.current_end_number
    ) {
      throw new Error("Sequence exhausted");
    }

    // 4. Generate NCF
    const seqStr = sequence.next_number.toString().padStart(10, "0");
    const prefix = isElectronic ? "E" : "B";
    const ncf = `${prefix}${typeCode}${seqStr}`;

    // 5. Increment sequence
    await dbClient.query(
      `UPDATE sequences 
       SET next_number = next_number + 1 
       WHERE id = $1`,
      [sequence.id]
    );

    await dbClient.query("COMMIT");
    return ncf;
  } catch (error) {
    await dbClient.query("ROLLBACK");
    logger.error("Error generating NCF", { tenantId, typeCode, error });
    throw error;
    } finally {
        dbClient.release();
    }
};

