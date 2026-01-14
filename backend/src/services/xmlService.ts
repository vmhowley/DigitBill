import { create } from 'xmlbuilder2';
import crypto from 'crypto';

interface InvoiceData {
  emisor: { rnc: string; nombre: string };
  receptor: { rnc: string; nombre: string };
  fecha: string;
  tipo: string;
  encf: string;
  items: Array<{
    descripcion: string;
    cantidad: string;
    precio: string;
    monto: string;
    impuesto: string;
    itbis_rate?: string; // Add rate for calculations
  }>;
  subtotal: string;
  impuestototal: string;
  total: string;
  fecha_vencimiento?: string;
  metodo_pago?: string;
}

// Helper to generate 6-char Security Code (standard e-CF logic)
// Algorithm: SHA1(RNC_Emisor + e-NCF + FechaEmision(ddMMyyyy) + FechaVencimiento(ddMMyyyy) + MontoTotal + ImpuestoTotal)
// Returns first 6 characters in uppercase
export const generateSecurityCode = (
  rnc: string,
  encf: string,
  fechaEmision: string,
  fechaVencimiento: string,
  montoTotal: string,
  impuestoTotal: string
): string => {
  // Ensure dates are correctly formatted if needed, for this implementation we assume standard string concatenation
  // as provided by the data object, but typically it cleans hyphens/slashes.
  // Let's normalize to ddMMyyyy just to be safe if input is YYYY-MM-DD
  const formatDate = (d: string) => {
    if (d.includes('-')) {
      const [y, m, day] = d.split('-'); // 2023-01-30
      return `${day}${m}${y}`;
    }
    return d.replace(/[^0-9]/g, '');
  };

  const fmtFecha = formatDate(fechaEmision);
  const fmtVenc = formatDate(fechaVencimiento);

  // Concatenate in specific order
  const input = `${rnc}${encf}${fmtFecha}${fmtVenc}${montoTotal}${impuestoTotal}`;

  console.log('Security Code Input String:', input); // For debug

  const hash = crypto.createHash('sha1').update(input).digest('hex');
  return hash.substring(0, 6).toUpperCase();
};

export const buildECFXML = (data: InvoiceData): string => {
  // Ensure we have valid defaults
  const fechaVenc = data.fecha_vencimiento || data.fecha;
  const impuestoTotal = data.impuestototal || '0.00';

  const securityCode = generateSecurityCode(
    data.emisor.rnc,
    data.encf,
    data.fecha,
    fechaVenc,
    data.total,
    impuestoTotal
  );

  const qrUrl = `https://ecf.dgii.gov.do/consulta/qr?Rnc=${data.emisor.rnc}&EncF=${data.encf}&CodSeg=${securityCode}&Monto=${data.total}`;

  const root = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('eCF', { xmlns: 'http://www.dgii.gov.do/ecf/schema', version: '1.0' })
    .ele('Encabezado')
    .ele('Emisor')
    .ele('RNCEmisor').txt(data.emisor.rnc).up()
    .ele('RazonSocialEmisor').txt(data.emisor.nombre).up()
    .up()
    .ele('Receptor')
    .ele('RNCReceptor').txt(data.receptor.rnc).up()
    .ele('RazonSocialReceptor').txt(data.receptor.nombre).up()
    .up()
    .ele('IdDoc')
    .ele('TipoeCF').txt(data.tipo).up()
    .ele('eNCF').txt(data.encf).up()
    .ele('FechaEmision').txt(data.fecha).up()
    .ele('FechaVencimientoSecuencia').txt(fechaVenc).up()
    .ele('IndicadorMontoGravado').txt('1').up() // 1 = Has taxed items
    .ele('TipoIngresos').txt('01').up() // 01 = Ingresos por operaciones 
    .up()
    .ele('Totales')
    .ele('MontoTotal').txt(String(data.total)).up()
    .ele('MontoGravadoTotal').txt(String(data.subtotal)).up()
    .ele('MontoImpuestoAdicional').txt('0.00').up()
    .ele('ImpuestoTotal').txt(String(impuestoTotal)).up()
    .up()
    .ele('CodigoSeguridad').txt(securityCode).up()
    .ele('DatosExtras')
    .ele('UrlQR').txt(qrUrl).up()
    .up()
    .up() // Encabezado
    .ele('DetallesItems');

  let lineNum = 1;
  data.items.forEach(it => {
    root.ele('Item')
      .ele('NumeroLinea').txt(String(lineNum++)).up()
      .ele('TablaCodigoItem')
      .ele('TipoCodigo').txt('internal').up()
      .ele('CodigoItem').txt('P-001').up()
      .up()
      .ele('IndicadorFacturacion').txt('1').up()
      .ele('NombreItem').txt(it.descripcion).up()
      .ele('CantidadItem').txt(String(it.cantidad)).up()
      .ele('PrecioUnitarioItem').txt(String(it.precio)).up()
      .ele('MontoItem').txt(String(it.monto)).up()
      .ele('MontoGravado').txt(String(it.monto)).up() // Assuming all taxed for now
      .ele('TasaITBIS').txt(it.itbis_rate || '18').up()
      .ele('ImpuestoITBIS').txt(String(it.impuesto)).up()
      .up();
  });

  const xml = root.end({ prettyPrint: true });
  return xml;
};
