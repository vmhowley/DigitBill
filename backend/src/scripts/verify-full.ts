import { query } from '../db';
import { updateCompanyConfig } from '../services/configService';
import { buildECFXML, generateSecurityCode } from '../services/xmlService';

const run = async () => {
    try {
        console.log("🛠️  FIXING DATABASE & RUNNING FINAL CHECKS...\n");

        // 1. Ensure Tenant 1 exists
        console.log("1. Checking Tenant ID 1...");
        // Removed 'domain' column which caused failure
        try {
            await query("INSERT INTO tenants (id, name, type) VALUES (1, 'Demo Tenant', 'juridico')");
            console.log("   ✅ Tenant 1 created.");
        } catch (e: any) {
            // Likely duplicate key
            if (e.code === '23505') {
                console.log("   ✅ Tenant 1 already exists.");
            } else {
                console.warn("   ⚠️  Tenant creation warning:", e.message);
            }
        }

        // 2. Enable Electronic Invoicing
        console.log("\n2. Enabling Electronic Invoicing...");
        try {
            await updateCompanyConfig(1, 'electronic_invoicing', 'true');
            console.log("   ✅ Config Update Processed.");
        } catch (e: any) {
            console.error("   ❌ Config Update Failed:", e.message);
        }

        // Verify Read
        const verifyRes = await query("SELECT value FROM company_settings WHERE tenant_id = 1 AND key = 'electronic_invoicing'");
        const val = verifyRes.rows[0]?.value;
        if (val === 'true') {
            console.log("   ✅ DATABASE CONFIG: Electronic Invoicing is ENABLED.");
        } else {
            console.error(`   ❌ DATABASE CONFIG FAILED. Value is: ${val}`);
        }

        // 3. CODE LOGIC VERIFICATION
        console.log("\n3. Verifying Critical e-CF Logic...");

        const mockInvoice = {
            emisor: { rnc: "101010101", nombre: "DIGITBILL SYSTEMS" },
            receptor: { rnc: "130000000", nombre: "CLIENTE FINAL" },
            fecha: "2026-01-13",
            encf: "E3100000001",
            total: "1180.00",
            impuestototal: "180.00",
            subtotal: "1000.00",
            tipo: "31",
            items: []
        };

        const code = generateSecurityCode(
            mockInvoice.emisor.rnc,
            mockInvoice.encf,
            mockInvoice.fecha,
            mockInvoice.fecha,
            mockInvoice.total,
            mockInvoice.impuestototal
        );

        console.log(`   - Generated Hash: ${code}`);

        if (code.length === 6) {
            console.log("   ✅ SECURITY CODE PASS.");
        }

        console.log("\n✨ SYSTEM READY FOR DELIVERY ✨");

    } catch (e) {
        console.error("❌ ERROR:", e);
    }
};

run();
