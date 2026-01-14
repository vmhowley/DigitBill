
import { updateCompanyConfig } from '../services/configService';

async function disableECF() {
    try {
        console.log("Disabling Electronic Invoicing for Tenant 1...");
        await updateCompanyConfig(1, 'electronic_invoicing', 'false');
        console.log("SUCCESS: Electronic Invoicing is now DISABLED. Traditional invoicing is active.");
    } catch (error) {
        console.error("Failed to disable ECF:", error);
    }
}

disableECF();
