
import { query } from '../db';

const run = async () => {
    try {
        console.log("🛠️  Fixing Vehicle Status Constraint...");

        // Drop old constraint
        await query(`ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS vehicles_status_check`);

        // Add new constraint with 'loaned'
        await query(`ALTER TABLE vehicles ADD CONSTRAINT vehicles_status_check 
                     CHECK (status IN ('available', 'reserved', 'sold', 'maintenance', 'loaned'))`);

        console.log("   ✅ Constraint Updated.");

    } catch (e) {
        console.error("❌ ERROR:", e);
    }
};

run();
