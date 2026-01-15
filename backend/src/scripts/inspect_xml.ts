import { query } from "../db";

async function inspectInvoiceXML() {
  try {
    const res = await query(
      "SELECT id, e_ncf, xml_path FROM invoices WHERE status = 'signed' OR status = 'sent' LIMIT 1",
      []
    );
    if (res.rows.length === 0) {
      console.log("No signed/sent invoices found.");
      return;
    }
    const inv = res.rows[0];
    console.log("Invoice ID:", inv.id, "e-NCF:", inv.e_ncf);
    console.log(
      "XML Content (first 1000 chars):",
      inv.xml_path.substring(0, 1000)
    );

    const qrMatch = inv.xml_path.match(/<UrlQR>(.*?)<\/UrlQR>/);
    const segMatch = inv.xml_path.match(
      /<CodigoSeguridad>(.*?)<\/CodigoSeguridad>/
    );

    console.log("Current UrlQR:", qrMatch ? qrMatch[1] : "NOT FOUND");
    console.log(
      "Current CodigoSeguridad:",
      segMatch ? segMatch[1] : "NOT FOUND"
    );
  } catch (err) {
    console.error("Error inspecting XML:", err);
  }
}

inspectInvoiceXML();
