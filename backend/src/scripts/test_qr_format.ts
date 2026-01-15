import { buildECFXML } from "../services/xmlService";

const testData: any = {
  emisor: { rnc: "131063198", nombre: "DIGITBILL SRL" },
  receptor: { rnc: "101010101", nombre: "CLIENTE TEST" },
  fecha: "2024-01-15", // YYYY-MM-DD
  tipo: "31",
  encf: "E310000000001",
  items: [
    {
      descripcion: "Test Item",
      cantidad: 1,
      precio: 100,
      monto: 100,
      impuesto: 18,
    },
  ],
  subtotal: 100,
  impuestototal: 18,
  total: 118,
  fecha_vencimiento: "2024-02-14",
};

try {
  console.log("Generating XML for Test...");
  const xml = buildECFXML(testData);

  const qrMatch = xml.match(/<UrlQR>(.*?)<\/UrlQR>/);
  const securityMatch = xml.match(/<CodigoSeguridad>(.*?)<\/CodigoSeguridad>/);
  const fechaMatch = xml.match(/<FechaEmision>(.*?)<\/FechaEmision>/);

  console.log("--- RESULTS ---");
  console.log(
    "Generated FechaEmision:",
    fechaMatch ? fechaMatch[1] : "NOT FOUND"
  );
  console.log(
    "Generated CodigoSeguridad:",
    securityMatch ? securityMatch[1] : "NOT FOUND"
  );
  console.log("Generated URL:", qrMatch ? qrMatch[1] : "NOT FOUND");

  if (
    qrMatch &&
    qrMatch[1].includes("RNCEmisor=131063198") &&
    qrMatch[1].includes("FechaEmision=15-01-2024")
  ) {
    console.log("SUCCESS: URL format looks correct.");
  } else {
    console.log("FAILURE: URL format mismatch.");
  }
} catch (err) {
  console.error(err);
}
