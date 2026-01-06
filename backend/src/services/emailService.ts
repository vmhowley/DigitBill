import nodemailer from "nodemailer";
import { logger } from "../utils/logger";

// Standard SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for others
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: any[];
  fromName?: string;
  replyTo?: string;
}

export const sendEmail = async ({
  to,
  subject,
  html,
  attachments,
  fromName,
  replyTo,
}: EmailOptions) => {
  try {
    const from = fromName
      ? `"${fromName}" <${process.env.SMTP_USER}>`
      : `"DigitBill" <${process.env.SMTP_USER}>`;

    const info = await transporter.sendMail({
      from,
      to,
      replyTo: replyTo || process.env.SMTP_USER,
      subject,
      html,
      attachments,
    });
    logger.info("Email sent", { messageId: info.messageId, to });
    return info;
  } catch (error) {
    logger.error("Error sending email", { error, to });
    console.log(error);
    throw new Error(
      "No se pudo enviar el correo electrónico. Verifica la configuración SMTP. " +
        (error as any).message
    );
  }
};

export const sendInvoiceEmail = async (
  clientEmail: string,
  invoice: any,
  company: any,
  senderEmail?: string,
  senderName?: string
) => {
  const formattedTotal = new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
  }).format(invoice.total);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
            .invoice-details { margin-bottom: 30px; }
            .invoice-details h2 { color: #1e40af; margin-top: 0; }
            .footer { font-size: 12px; color: #999; text-align: center; border-top: 1px solid #eee; padding-top: 15px; margin-top: 20px; }
            .btn { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #fff !important; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; }
            .highlight { color: #2563eb; font-weight: bold; }
        </style>
    </head>
    <body>
        <div className="container">
            <div className="header">
                <h1>Factura de Pago</h1>
            </div>
            <div className="invoice-details">
                <h2>Hola, ${invoice.client_name}</h2>
                <p>Te enviamos la factura correspondiente a tu reciente transacción con <span className="highlight">${
                  company.name
                }</span>.</p>
                
                <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                    <tr>
                        <td style="padding: 8px 0; color: #666;">NCF:</td>
                        <td style="padding: 8px 0; text-align: right; font-weight: bold;">${
                          invoice.e_ncf || "B00000000"
                        }</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #666;">Número:</td>
                        <td style="padding: 8px 0; text-align: right;">${invoice.sequential_number
                          .toString()
                          .padStart(6, "0")}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #666;">Fecha:</td>
                        <td style="padding: 8px 0; text-align: right;">${new Date(
                          invoice.issue_date
                        ).toLocaleDateString()}</td>
                    </tr>
                    <tr style="font-size: 18px; border-top: 2px solid #eee;">
                        <td style="padding: 15px 0; font-weight: bold;">Monto Total:</td>
                        <td style="padding: 15px 0; text-align: right; color: #2563eb; font-weight: bold;">${formattedTotal}</td>
                    </tr>
                </table>

                <p style="margin-top: 30px;">Puedes gestionar esta factura y muchas más a través de nuestro portal.</p>
            </div>
            
            <div className="footer">
                <p>Enviado automáticamente por DigitBill por encargo de ${
                  company.name
                }.</p>
                <p>${company.address} - ${company.phone}</p>
            </div>
        </div>
    </body>
    </html>
    `;

  return sendEmail({
    to: clientEmail,
    subject: `Factura ${invoice.e_ncf || "#" + invoice.sequential_number} - ${
      company.name
    }`,
    html,
    fromName: senderName || company.name,
    replyTo: senderEmail,
  });
};
