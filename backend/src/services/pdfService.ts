import path from "path";
import PDFDocument from "pdfkit";

interface InvoiceData {
  invoice: any;
  company: any;
  items: any[];
}

export const generateInvoicePdf = (
  { invoice, company, items }: InvoiceData,
  res: any
) => {
  const doc = new PDFDocument({ margin: 50 });

  // Stream to response
  doc.pipe(res);

  generateHeader(doc, company);
  generateCustomerInformation(doc, invoice);
  generateInvoiceTable(doc, items, invoice);
  generateFooter(doc, company);

  doc.end();
};

function generateHeader(doc: PDFKit.PDFDocument, company: any) {
  const logoPath = path.join(__dirname, "../../assets/logo.png"); // Make sure this exists or fallback

  // Draw Logo if exists, else text
  // For now simpler header
  doc
    .fillColor("#444444")
    .fontSize(20)
    .text(company.company_name || company.name, 50, 57)
    .fontSize(10)
    .text(company.company_name || company.name, 200, 50, { align: "right" })
    .text(company.address || "", 200, 65, { align: "right" })
    .text(company.phone || "", 200, 80, { align: "right" })
    .moveDown();

  // Line separator
  doc.moveTo(50, 100).lineTo(550, 100).strokeColor("#aaaaaa").stroke();
}

function generateCustomerInformation(doc: PDFKit.PDFDocument, invoice: any) {
  doc.fillColor("#444444").fontSize(20).text("Factura", 50, 160);

  generateHr(doc, 185);

  const customerInformationTop = 200;

  doc
    .fontSize(10)
    .text("No. Factura:", 50, customerInformationTop)
    .font("Helvetica-Bold")
    .text(
      invoice.sequential_number.toString().padStart(6, "0"),
      150,
      customerInformationTop
    )
    .font("Helvetica")
    .text("Fecha Emisión:", 50, customerInformationTop + 15)
    .text(
      new Date(invoice.issue_date).toLocaleDateString(),
      150,
      customerInformationTop + 15
    )
    .text("NCF:", 50, customerInformationTop + 30)
    .text(invoice.e_ncf || "N/A", 150, customerInformationTop + 30)

    .font("Helvetica-Bold")
    .text(invoice.client_name, 300, customerInformationTop)
    .font("Helvetica")
    .text(invoice.client_rnc_ci || "", 300, customerInformationTop + 15)
    .text(invoice.client_address || "", 300, customerInformationTop + 30)
    .moveDown();

  generateHr(doc, 252);
}

function generateInvoiceTable(
  doc: PDFKit.PDFDocument,
  items: any[],
  invoice: any
) {
  let i;
  const invoiceTableTop = 330;

  doc.font("Helvetica-Bold");
  generateTableRow(
    doc,
    invoiceTableTop,
    "Item",
    "Descripción",
    "Precio Unit.",
    "Cant.",
    "Total"
  );
  generateHr(doc, invoiceTableTop + 20);
  doc.font("Helvetica");

  let position = 0;
  for (i = 0; i < items.length; i++) {
    const item = items[i];
    position = invoiceTableTop + (i + 1) * 30;
    generateTableRow(
      doc,
      position,
      (i + 1).toString(),
      item.description, // Product Name usually
      formatCurrency(item.unit_price),
      item.quantity.toString(),
      formatCurrency(item.line_amount)
    );

    generateHr(doc, position + 20);
  }

  const subtotalPosition = invoiceTableTop + (i + 1) * 30;

  doc.font("Helvetica-Bold");
  generateTableRow(
    doc,
    subtotalPosition,
    "",
    "",
    "Subtotal",
    "",
    formatCurrency(invoice.net_total)
  );

  generateTableRow(
    doc,
    subtotalPosition + 20,
    "",
    "",
    "ITBIS (18%)",
    "",
    formatCurrency(invoice.tax_total)
  );

  generateTableRow(
    doc,
    subtotalPosition + 40,
    "",
    "",
    "Total",
    "",
    formatCurrency(invoice.total)
  );
  doc.font("Helvetica");
}

function generateFooter(doc: PDFKit.PDFDocument, company: any) {
  doc
    .fontSize(10)
    .text("Gracias por su confianza.", 50, 780, {
      align: "center",
      width: 500,
    });
}

function generateTableRow(
  doc: PDFKit.PDFDocument,
  y: number,
  item: string,
  description: string,
  unitCost: string,
  quantity: string,
  lineTotal: string
) {
  doc
    .fontSize(10)
    .text(item, 50, y)
    .text(description, 150, y, { width: 190, lineGap: 2 }) // Limited width for desc
    .text(unitCost, 280, y, { width: 90, align: "right" })
    .text(quantity, 370, y, { width: 90, align: "right" })
    .text(lineTotal, 0, y, { align: "right" });
}

function generateHr(doc: PDFKit.PDFDocument, y: number) {
  doc.strokeColor("#aaaaaa").lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
}

function formatCurrency(cents: number | string) {
  if (!cents) return "RD$ 0.00";
  const amount = typeof cents === "string" ? parseFloat(cents) : cents;
  return "RD$ " + amount.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}
