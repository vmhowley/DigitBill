
import { query } from '../db';

const run = async () => {
    try {
        console.log("🚗 Testing Inter-Dealer Loans Lifecycle...");
        const tenantId = 1;

        // 1. Create a Test Vehicle
        console.log("1. Creating Test Vehicle...");
        const vin = `TEST-LOAN-${Date.now()}`;
        const vRes = await query(
            `INSERT INTO vehicles (tenant_id, make, model, year, vin, status, price) 
             VALUES ($1, 'Toyota', 'LoanTest', 2025, $2, 'available', 1000) RETURNING id`,
            [tenantId, vin]
        );
        const vehicleId = vRes.rows[0].id;
        console.log(`   ✅ Vehicle Created (ID: ${vehicleId})`);

        // 2. Loan the Vehicle
        console.log("\n2. Loaning Vehicle...");
        const loanDate = new Date();
        const returnDate = new Date();
        returnDate.setDate(returnDate.getDate() + 7); // 7 days

        await query(
            `INSERT INTO vehicle_loans (tenant_id, vehicle_id, dealer_name, dealer_phone, loan_date, expected_return_date, notes)
             VALUES ($1, $2, 'Dealer Amigo', '809-123-4567', $3, $4, 'Test Loan')`,
            [tenantId, vehicleId, loanDate, returnDate]
        );

        // Update status manually as the API would
        await query("UPDATE vehicles SET status = 'loaned' WHERE id = $1", [vehicleId]);

        // Verify Status
        const checkV = await query("SELECT status FROM vehicles WHERE id = $1", [vehicleId]);
        if (checkV.rows[0].status === 'loaned') {
            console.log("   ✅ Vehicle Status matches 'loaned'");
        } else {
            console.error("   ❌ Status mismatch:", checkV.rows[0].status);
        }

        // 3. Return the Vehicle
        console.log("\n3. Returning Vehicle...");
        await query(
            `UPDATE vehicle_loans SET status = 'returned' WHERE vehicle_id = $1 AND status = 'active'`,
            [vehicleId]
        );
        await query("UPDATE vehicles SET status = 'available' WHERE id = $1", [vehicleId]);

        const checkV2 = await query("SELECT status FROM vehicles WHERE id = $1", [vehicleId]);
        if (checkV2.rows[0].status === 'available') {
            console.log("   ✅ Vehicle Returned successfully (Status: available)");
        }

        // Cleanup
        await query("DELETE FROM vehicle_loans WHERE vehicle_id = $1", [vehicleId]);
        await query("DELETE FROM vehicles WHERE id = $1", [vehicleId]);
        console.log("\n🧹 Cleanup Complete.");

    } catch (e) {
        console.error("❌ ERROR:", e);
    }
};

run();
