import axios from 'axios';
import fs from 'fs';
import path from 'path';

const TEST_INVOICE_ID = 1; // Assuming ID 1 exists
const OUTPUT_FILE = path.join(__dirname, 'test-conduce.pdf');

async function testDeliveryNote() {
    console.log("Testing Delivery Note PDF Generation...");
    try {
        // We can't use axios straight to localhost without running server context easily if we are just a script unless we invoke the internal function.
        // Better to invoke internal function directly to verify logic without needing HTTP for this script.

        // Mock Res
        const res: any = {
            on: (event: string, cb: any) => { },
            once: (event: string, cb: any) => { },
            emit: (event: string, ...args: any[]) => { },
            write: (chunk: any) => fs.appendFileSync(OUTPUT_FILE, chunk),
            end: () => console.log(`✅ PDF Saved to ${OUTPUT_FILE}`),
            pipe: (stream: any) => stream, // mock pipe
        };

        // Mock Data
        const mockData = {
            invoice: { sequential_number: 123, client_name: "Taller Juan", client_rnc_ci: "101-222-333", client_address: "Calle 123", issue_date: new Date() },
            company: { company_name: "DigitBill Auto", address: "Av Winston Churchill", phone: "809-555-5555" },
            items: [
                { description: "Toyota Corrolla 2020", quantity: 1, line_amount: "500000" },
                { description: "Cambio de Aceite", quantity: 1, line_amount: "2500" }
            ]
        };

        const { generateDeliveryNotePdf } = require('../services/pdfService');

        // Clear previous
        if (fs.existsSync(OUTPUT_FILE)) fs.unlinkSync(OUTPUT_FILE);

        // Generate
        // Note: fs.createWriteStream is better for piping
        const stream = fs.createWriteStream(OUTPUT_FILE);
        generateDeliveryNotePdf(mockData, stream);

        console.log("Mock generation triggered.");

    } catch (e) {
        console.error("Test Failed:", e);
    }
}

testDeliveryNote();
