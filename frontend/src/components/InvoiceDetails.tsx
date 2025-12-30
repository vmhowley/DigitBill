import { ArrowLeft, Printer, ShoppingCart } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from '../api';

interface InvoiceDetail {
    id: number;
    client_name: string;
    client_rnc: string;
    issue_date: string;
    status: string;
    total: string;
    net_total: string;
    tax_total: string;
    e_ncf?: string;
    xml_path?: string;
    type_code: string;
    items: Array<{
        id: number;
        description: string;
        quantity: string;
        unit_price: string;
        line_amount: string;
        line_tax: string;
    }>;
}

export const InvoiceDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
    const [qrValue, setQrValue] = useState<string>('');
    const [company, setCompany] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [invoiceRes, companyRes] = await Promise.all([
                    axios.get(`/api/invoices/${id}`),
                    axios.get('/api/settings/company')
                ]);

                setInvoice(invoiceRes.data);
                setCompany(companyRes.data);

                const invData = invoiceRes.data;
                // Parse QR if exists
                if ((invData.status === 'signed' || invData.status === 'sent') && invData.xml_path?.includes('<UrlQR>')) {
                    const match = invData.xml_path.match(/<UrlQR>(.*?)<\/UrlQR>/);
                    if (match && match[1]) setQrValue(match[1]);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <div className="p-10 text-center">Cargando factura...</div>;
    if (!invoice) return <div className="p-10 text-center text-red-500">Factura no encontrada</div>;

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

    return (
        <div className="max-w-4xl mx-auto p-8">
            <div className="mb-6 flex justify-between items-center print:hidden">
                <Link to="/" className="flex items-center text-gray-500 hover:text-gray-800">
                    <ArrowLeft size={18} className="mr-2" /> Volver
                </Link>
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                >
                    <Printer size={18} /> Imprimir
                </button>
            </div>

            <div className="bg-white border border-gray-200 shadow-lg rounded-xl p-8 print:shadow-none print:border-none">
                {/* Header */}
                <div className="flex justify-between items-start border-b border-gray-100 pb-8 mb-8">
                    <div>
                        <div className="flex items-center gap-2 text-blue-600 mb-2">
                            <ShoppingCart className="w-6 h-6" />
                            <span className="font-bold text-xl tracking-tight">{company?.name || 'Cargando...'}</span>
                        </div>
                        <p className="text-sm text-gray-500">{company?.address}</p>
                        <p className="text-sm text-gray-500">RNC: {company?.rnc}</p>
                        <p className="text-sm text-gray-500">{company?.phone}</p>
                    </div>
                    <div className="text-right">
                        <h1 className="text-2xl font-bold text-gray-900">{getTypeName(invoice.type_code)}</h1>
                        {invoice.e_ncf ? (
                            <p className="text-lg font-mono text-gray-700 mt-1">
                                <span className="text-xs text-gray-400 mr-2">{company?.electronic_invoicing !== false ? 'e-NCF' : 'NCF'}:</span>
                                {invoice.e_ncf}
                            </p>
                        ) : (
                            <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded mt-1">Borrador</span>
                        )}
                        <p className="text-sm text-gray-500 mt-2">Fecha: {new Date(invoice.issue_date).toLocaleDateString()}</p>
                    </div>
                </div>

                {/* Client info */}
                <div className="mb-8">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Facturado a</h3>
                    <p className="text-lg font-medium text-gray-900">{invoice.client_name}</p>
                    <p className="text-gray-600">RNC/Cédula: {invoice.client_rnc}</p>
                </div>

                {/* Items */}
                <table className="w-full mb-8">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="text-left py-3 text-sm font-semibold text-gray-600">Descripción</th>
                            <th className="text-right py-3 text-sm font-semibold text-gray-600">Cant</th>
                            <th className="text-right py-3 text-sm font-semibold text-gray-600">Precio</th>
                            <th className="text-right py-3 text-sm font-semibold text-gray-600">ITBIS</th>
                            <th className="text-right py-3 text-sm font-semibold text-gray-600">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {invoice.items.map((item) => (
                            <tr key={item.id}>
                                <td className="py-3 text-gray-800">{item.description}</td>
                                <td className="py-3 text-right text-gray-600">{item.quantity}</td>
                                <td className="py-3 text-right text-gray-600">{parseFloat(item.unit_price).toFixed(2)}</td>
                                <td className="py-3 text-right text-gray-600">{parseFloat(item.line_tax).toFixed(2)}</td>
                                <td className="py-3 text-right font-medium text-gray-900">{parseFloat(item.line_amount).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Footer / Totals */}
                <div className="flex justify-between items-end border-t border-gray-100 pt-8">
                    <div>
                        {qrValue && company?.electronic_invoicing !== false && (
                            <div className="flex flex-col items-center">
                                <QRCodeSVG value={qrValue} size={128} />
                                <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-widest">Código QR e-CF</p>
                            </div>
                        )}
                    </div>
                    <div className="w-64 space-y-3">
                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal</span>
                            <span>RD$ {parseFloat(invoice.net_total).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>ITBIS Total</span>
                            <span>RD$ {parseFloat(invoice.tax_total).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t border-gray-100">
                            <span>Total</span>
                            <span>RD$ {parseFloat(invoice.total).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
