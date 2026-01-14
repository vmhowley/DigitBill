import { updateCompanyConfig } from '../services/configService';

async function enableECF() {
    try {
        console.log("Enabling Electronic Invoicing for Tenant 1...");
        // Note: The config service expects a string value for the update
        await updateCompanyConfig(1, 'electronic_invoicing', 'true');
        console.log("SUCCESS: Electronic Invoicing is now ENABLED.");
    } catch (error) {
        console.error("Failed to enable ECF:", error);
    }
}

enableECF();
