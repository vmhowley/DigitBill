import { buildECFXML, generateSecurityCode } from '../services/xmlService';

const runVerification = () => {
    console.log("🚀 Starting Final Delivery Verification...");

    // 1. Mock Invoice Data
    const mockInvoice = {
        emisor: { rnc: "101010101", nombre: "DIGITBILL SYSTEMS" },
        receptor: { rnc: "130000000", nombre: "CLIENTE DE PRUEBA" },
        fecha: "2026-01-13",
        fecha_vencimiento: "2026-02-13",
        tipo: "31", // Factura de Crédito Fiscal
        encf: "E3100000001",
        items: [
            { descripcion: "Servicio de Software", cantidad: "1", precio: "1000.00", monto: "1000.00", impuesto: "180.00", itbis_rate: "18" }
        ],
        subtotal: "1000.00",
        impuestototal: "180.00", // Fixed prop name matching interface
        total: "1180.00"
    };

    console.log("\n📋 Test Data Prepared:");
    console.log(`   - Emisor: ${mockInvoice.emisor.rnc}`);
    console.log(`   - e-NCF: ${mockInvoice.encf}`);
    console.log(`   - Total: ${mockInvoice.total}`);

    // 2. Generate Security Code Explicitly
    const code = generateSecurityCode(
        mockInvoice.emisor.rnc,
        mockInvoice.encf,
        mockInvoice.fecha,
        mockInvoice.fecha_vencimiento,
        mockInvoice.total,
        mockInvoice.impuestototal
    );

    console.log("\n🔒 Security Code Check:");
    console.log(`   - Generated Code: [${code}]`);

    if (code.length === 6) {
        console.log("   ✅ PASS: Code is exactly 6 characters.");
    } else {
        console.error(`   ❌ FAIL: Code length is ${code.length}, expected 6.`);
    }

    if (/^[0-9A-F]{6}$/.test(code)) {
        console.log("   ✅ PASS: Code is Uppercase Hex.");
    } else {
        console.error("   ❌ FAIL: Code format invalid (must be 0-9 A-F).");
    }

    // 3. Generate Full XML
    try {
        console.log("\n📄 XML Generation Check:");
        const xml = buildECFXML(mockInvoice);

        if (xml.includes("<CodigoSeguridad>" + code + "</CodigoSeguridad>")) {
            console.log("   ✅ PASS: XML contains the correct Security Code.");
        } else {
            console.error("   ❌ FAIL: XML missing correct Security Code.");
        }

        if (xml.includes("SHA1")) {
            // Just a sanity check if we were putting alg info, but we don't put explicit alg name in XML body often
            // ignore
        }

        if (xml.includes("<eCF") && xml.includes("</eCF>")) {
            console.log("   ✅ PASS: XML Root element exists.");
        }

        console.log("\n✨ XML Sample Snippet:");
        console.log(xml.substring(xml.indexOf("<CodigoSeguridad>"), xml.indexOf("</CodigoSeguridad>") + 25));

    } catch (e) {
        console.error("   ❌ FAIL: XML Generation crashed", e);
    }

    console.log("\n🏁 Verification Complete.");
};

runVerification();
