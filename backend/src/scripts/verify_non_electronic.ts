import {
  getCompanyConfig,
  updateCompanyConfig,
} from "../services/configService";
import { getNextNCF } from "../services/sequencesService";

async function testNonElectronicFlow() {
  const tenantId = 14; // Using existing tenant ID

  console.log("--- Testing Non-Electronic Flow ---");

  try {
    // 1. Disable electronic invoicing
    console.log("1. Disabling electronic invoicing...");
    await updateCompanyConfig(tenantId, "electronic_invoicing", "false");

    // 2. Refresh config
    const config = await getCompanyConfig(tenantId);
    console.log("Config electronic_invoicing:", config.electronic_invoicing);
    if (config.electronic_invoicing !== false)
      throw new Error("Failed to disable electronic invoicing");

    // 3. Test NCF generation (should start with B)
    console.log("2. Testing NCF generation...");
    const ncf = await getNextNCF(tenantId, "31", false);
    console.log("Generated NCF:", ncf);
    if (!ncf.startsWith("B"))
      throw new Error(
        "NCF should start with B when electronic invoicing is disabled"
      );

    // 4. Test NCF generation with electronic enabled (should start with E)
    console.log("3. Testing NCF generation (electronic enabled)...");
    const ncfE = await getNextNCF(tenantId, "31", true);
    console.log("Generated NCF (E):", ncfE);
    if (!ncfE.startsWith("E"))
      throw new Error(
        "NCF should start with E when electronic invoicing is enabled"
      );

    console.log("--- All Backend Tests Passed ---");

    // Restore default
    await updateCompanyConfig(tenantId, "electronic_invoicing", "true");
  } catch (err) {
    console.error("Test Failed:", err);
  }
}

testNonElectronicFlow().then(() => process.exit());
