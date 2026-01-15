
import axios from 'axios';
import { Printer, ShoppingCart } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

// Define API URL from env since we might not use the verified 'api' instance which has auth interceptors
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const PublicInvoice = () => {
    const { token } = useParams<{ token: string }>();
    const [invoice, setInvoice] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                // Use raw axios to avoid auth headers being required/checked
                const res = await axios.get(`${API_URL}/api/public/invoices/${token}`);
                setInvoice(res.data);
            } catch (err: any) {
                console.error(err);
                setError(err.response?.data?.error || 'No se pudo cargar la factura. El enlace podría ser inválido o haber caducado.');
            } finally {
                setLoading(false);
            }
        };
        if (token) fetchInvoice();
    }, [token]);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Cargando documento...</div>;

    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-xl shadow-sm text-center max-w-md">
                <div className="text-red-500 mb-4 text-5xl">😕</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Lo sentimos</h3>
                <p className="text-gray-600">{error}</p>
            </div>
        </div>
    );

    if (!invoice) return null;

    const getTypeName = (code: string) => {
        switch (code) {
            case '31': return 'Factura de Crédito Fiscal';
            case '32': return 'Factura de Consumo';
            case '33': return 'Nota de Crédito';
            case '34': return 'Nota de Débito';
            case '43': return 'Gastos Menores';
            case '44': return 'Regímenes Especiales';
            case '45': return 'Gubernamental';
            default: return 'Factura';
        }
    }

    // Attempt to parse QR from XML if available
    let qrValue = '';
    if (invoice.xml_path && invoice.xml_path.includes('<UrlQR>')) {
        const match = invoice.xml_path.match(/<UrlQR>(.*?)<\/UrlQR>/);
        if (match && match[1]) qrValue = match[1];
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 print:bg-white print:py-0">
            <div className="max-w-4xl mx-auto px-4 print:px-0">
                {/* Public Header Actions */}
                <div className="mb-6 flex justify-between items-center print:hidden">
                    <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
                        Vista Pública
                    </div>
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-colors font-medium shadow-sm"
                    >
                        <Printer size={18} /> Imprimir Comprobante
                    </button>
                </div>

                <div className="bg-white border border-gray-200 shadow-xl rounded-2xl p-8 md:p-12 print:shadow-none print:border-none print:p-0 print:rounded-none">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start border-b border-gray-100 pb-8 mb-8 gap-8 md:gap-0">
                        <div>
                            <div className="flex items-center gap-3 text-blue-600 mb-3">
                                <div className="bg-blue-50 p-2 rounded-lg">
                                    <ShoppingCart className="w-6 h-6" />
                                </div>
                                <span className="font-bold text-2xl tracking-tight text-gray-900">{invoice.company_name}</span>
                            </div>
                            <div className="text-sm text-gray-500 space-y-1 ml-1">
                                <p>{invoice.company_address}</p>
                                <p>RNC: {invoice.company_rnc}</p>
                                <p>{invoice.company_phone}</p>
                                <p>{invoice.company_email}</p>
                            </div>
                        </div>
                        <div className="text-left md:text-right w-full md:w-auto">
                            <div className="flex flex-col md:items-end">
                                <h1 className="text-2xl font-bold text-gray-900">{getTypeName(invoice.type_code)}</h1>
                                <span className="text-blue-600 font-mono text-base font-semibold bg-blue-50 px-2 py-1 rounded mt-2 inline-block">
                                    #{(invoice.sequential_number || invoice.id).toString().padStart(6, '0')}
                                </span>
                            </div>
                            {invoice.e_ncf ? (
                                <p className="text-lg font-mono text-gray-700 mt-3 md:mt-2">
                                    <span className="text-xs text-gray-400 mr-2 font-sans uppercase tracking-wider">e-NCF:</span>
                                    {invoice.e_ncf}
                                </p>
                            ) : null}
                            <p className="text-sm text-gray-500 mt-2">Emisión: {new Date(invoice.issue_date).toLocaleDateString()}</p>
                            {invoice.status === 'paid' && (
                                <div className="mt-3 inline-block border border-green-200 bg-green-50 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                                    Pagada
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Client info */}
                    <div className="mb-10 bg-gray-50 p-6 rounded-xl border border-gray-100">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Facturado a</h3>
                        <p className="text-xl font-bold text-gray-900 mb-1">{invoice.client_name || 'Cliente Final'}</p>
                        {invoice.client_rnc && <p className="text-gray-600">RNC/Cédula: {invoice.client_rnc}</p>}
                        {invoice.client_phone && <p className="text-gray-600">{invoice.client_phone}</p>}
                    </div>

                    {/* Items */}
                    <div className="overflow-x-auto">
                        <table className="w-full mb-8 table-fixed">
                            <thead>
                                <tr className="border-b-2 border-gray-100">
                                    <th className="text-left py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-[40%]">Descripción</th>
                                    <th className="text-right py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-[10%]">Cant</th>
                                    <th className="text-right py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-[15%]">Precio</th>
                                    <th className="text-right py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-[15%]">ITBIS</th>
                                    <th className="text-right py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-[20%]">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {invoice.items.map((item: any, idx: number) => (
                                    <tr key={idx} className="align-top">
                                        <td className="py-4 text-gray-800 font-medium break-words pr-2">{item.description}</td>
                                        <td className="py-4 text-right text-gray-600 whitespace-nowrap">{parseFloat(item.quantity).toFixed(2)}</td>
                                        <td className="py-4 text-right text-gray-600 whitespace-nowrap">{parseFloat(item.unit_price).toFixed(2)}</td>
                                        <td className="py-4 text-right text-gray-500 text-xs whitespace-nowrap">({parseFloat(item.tax_rate || '18').toFixed(0)}%) {parseFloat(item.line_tax).toFixed(2)}</td>
                                        <td className="py-4 text-right font-bold text-gray-900 whitespace-nowrap">{parseFloat(item.line_amount).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer / Totals */}
                    <div className="flex flex-col md:flex-row justify-between items-end border-t border-gray-100 pt-8 gap-8 md:gap-0">
                        <div className="w-full md:w-auto flex justify-center md:justify-start">
                            {qrValue && (
                                <div className="flex flex-col items-center">
                                    <div className="bg-white p-2 rounded-lg border border-gray-100">
                                        <QRCodeSVG value={qrValue} size={120} />
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-widest font-medium">Código QR e-CF</p>
                                </div>
                            )}
                        </div>
                        <div className="w-full md:w-72 space-y-3">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>RD$ {parseFloat(invoice.net_total).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>ITBIS Total</span>
                                <span>RD$ {parseFloat(invoice.tax_total).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-2xl font-bold text-gray-900 pt-4 border-t border-gray-100 mt-2">
                                <span>Total</span>
                                <span>RD$ {parseFloat(invoice.total).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 text-center border-t border-gray-100 pt-8 print:hidden">
                        <p className="text-gray-400 text-sm">Documento generado electrónicamente por <strong>DigitBill</strong></p>
                    </div>
                </div>
            </div>
        </div>
    );
};
