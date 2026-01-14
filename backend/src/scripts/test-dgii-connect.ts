
import axios from 'axios';
import { signXml, loadP12 } from '../services/signatureService';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

// MOCK CONFIG
const TEST_CERT_PATH = path.join(__dirname, '../certs/test-cert.p12'); // Adjust if needed
const TEST_CERT_PASS = 'password'; // Standard mock password
const DGII_TEST_URL = 'https://ecf.dgii.gov.do/testecf';

async function testDGIIConnection() {
    try {
        console.log("1. Requesting SEMILLA (Seed) from DGII...");
        console.log(`Endpoint: ${DGII_TEST_URL}/autenticacion/api/semilla`);

        const seedResp = await axios.get(`${DGII_TEST_URL}/autenticacion/api/semilla`);
        const seedXml = seedResp.data;

        console.log("\n[SUCCESS] Semilla Received:");
        console.log(seedXml.substring(0, 100) + "... (truncated)");

        console.log("\n2. Signing Semilla locally...");
        const { privateKeyPem, certPem } = loadP12(TEST_CERT_PATH, TEST_CERT_PASS);

        // The seed root is usually <SemillaModel>
        const signedSeed = signXml(seedXml, privateKeyPem, certPem, "//*[local-name(.)='SemillaModel']");
        console.log("[SUCCESS] Semilla Signed.");

        console.log("\n3. Sending Signed Semilla to get Verification Token...");
        const tokenResp = await axios.post(`${DGII_TEST_URL}/autenticacion/api/validarsemilla`, signedSeed, {
            headers: { 'Content-Type': 'application/xml' }
        });

        console.log("\n[SUCCESS] Authentication SUCCESSFUL!");
        console.log("Token Received:", tokenResp.data.token || "No token field in response, check raw:");
        console.log(tokenResp.data);

    } catch (error: any) {
        console.error("\n[FAILED] Connection Test Failed.");
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error(`Data:`, error.response.data);
        } else {
            console.error(error.message);
        }

        console.log("\nNOTE: Failure is EXPECTED if the certificate is not authorized in DGII Sandbox.");
    }
}

testDGIIConnection();
