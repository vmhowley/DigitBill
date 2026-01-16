import { AlertCircle, ArrowLeft, Banknote, Copy, Download, Mail, MessageCircle, Printer, Send, ShoppingCart, Truck, XCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from '../api';
import { PaymentModal } from './PaymentModal';

interface InvoiceDetail {
    id: number;
    sequential_number: number;
    client_name: string;
    client_rnc: string;
    client_email: string;
    issue_date: string;
    status: string;
    share_token?: string;
    total: string;
    net_total: string;
    tax_total: string;
    total_paid: string | number; // Added
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
        tax_rate: string;
    }>;
}

export const InvoiceDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
    const [qrValue, setQrValue] = useState<string>('');
    const [company, setCompany] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [sendingEmail, setSendingEmail] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [sendingDGII, setSendingDGII] = useState(false);

    const getShareUrl = () => {
        if (!invoice?.share_token) return window.location.href;
        const baseUrl = window.location.protocol + '//' + window.location.host;
        return `${baseUrl}/p/${invoice.share_token}`;
    };

    const handleSendEmail = async () => {
        if (!invoice) return;

        const email = prompt('¿A qué correo deseas enviar esta factura?', invoice.client_email || '');
        if (!email) return;

        setSendingEmail(true);
        try {
            await axios.post(`/api/invoices/${id}/email`, { email });
            toast.success('Factura enviada por correo correctamente');
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.error || 'Error al enviar el correo');
        } finally {
            setSendingEmail(false);
        }
    };

    const handleDownloadPdf = async () => {
        try {
            const res = await axios.get(`/api/invoices/${id}/pdf`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `factura-${invoice!.e_ncf || invoice!.sequential_number}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error(err);
            toast.error('Error al descargar el PDF');
        }
    };

    const handleDownloadDeliveryNote = async () => {
        try {
            const res = await axios.get(`/api/delivery/${id}/pdf`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `conduce-${invoice!.sequential_number}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error(err);
            toast.error('Error al generar el Conduce');
        }
    };

    const navigate = useNavigate();

    const handleVoid = async () => {
        if (!invoice) return;
        const conf = window.confirm('¿Seguro que deseas anular esta factura? Se generará una Nota de Crédito automáticamente y se repondrá el inventario.');
        if (!conf) return;

        try {
            const res = await axios.post(`/api/invoices/${id}/void`);
            toast.success('Factura anulada correctamente');
            // Redirect to new credit note
            if (res.data.newInvoiceId) {
                navigate(`/invoices/${res.data.newInvoiceId}`);
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.error || 'Error al anular factura');
        }
    };

    const handleSendToDGII = async () => {
        if (!invoice) return;
        try {
            const conf = window.confirm('¿Estás seguro de enviar esta factura a la DGII?');
            if (!conf) return;

            setSendingDGII(true);
            await axios.post(`/api/invoices/${id}/send`);
            toast.success('Factura enviada correctamente');
            setRefreshTrigger(prev => prev + 1);
        } catch (err: any) {
            console.error(err);
            toast.error('Error al enviar: ' + (err.response?.data?.error || 'Error desconocido'));
        } finally {
            setSendingDGII(false);
        }
    };

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
                    if (match && match[1]) {
                        // Unescape &amp; to & for the QR code to be a valid URL
                        setQrValue(match[1].replace(/&amp;/g, '&'));
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, refreshTrigger]);

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
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
                <Link to="/invoices" className="flex items-center text-gray-500 hover:text-gray-800">
                    <ArrowLeft size={18} className="mr-2" /> Volver a Facturas
                </Link>
                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                    <button
                        onClick={handleSendEmail}
                        disabled={sendingEmail || invoice.status === 'draft'}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        {sendingEmail ? <Send size={18} className="animate-pulse" /> : <Mail size={18} />}
                        <span className="hidden sm:inline">{sendingEmail ? 'Enviando...' : 'Correo'}</span>
                    </button>

                    <button
                        onClick={() => {
                            const message = `Hola ${invoice.client_name}, aquí le envío su *${getTypeName(invoice.type_code)}* #${invoice.sequential_number || invoice.id}. Total: RD$ ${parseFloat(invoice.total).toLocaleString('es-DO', { minimumFractionDigits: 2 })}. Ver aquí: ${getShareUrl()}`;
                            window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                        }}
                        className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                        title="Enviar por WhatsApp"
                    >
                        <MessageCircle size={18} /> <span className="hidden sm:inline">WhatsApp</span>
                    </button>

                    <button
                        onClick={handleSendToDGII}
                        disabled={sendingDGII || invoice.status !== 'signed'}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${invoice.status === 'sent' ? 'bg-purple-100 text-purple-700' : 'bg-purple-600 text-white hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed'}`}
                        title="Enviar a DGII"
                    >
                        <Send size={18} className={sendingDGII ? 'animate-pulse' : ''} />
                        <span className="hidden sm:inline">
                            {sendingDGII ? 'Enviando...' : invoice.status === 'sent' ? 'Enviada' : 'DGII'}
                        </span>
                    </button>

                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(getShareUrl());
                            toast.success('Enlace público copiado al portapapeles');
                        }}
                        className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                        title="Copiar Enlace Público"
                    >
                        <Copy size={18} />
                    </button>

                    <button
                        onClick={handleDownloadPdf}
                        className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 border border-gray-200 disabled:opacity-50"
                        title="Descargar PDF"
                    >
                        <Download size={18} /> <span className="hidden sm:inline">PDF</span>
                    </button>

                    {company?.industry_type === 'automotive' && (
                        <button
                            onClick={handleDownloadDeliveryNote}
                            className="flex items-center gap-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-lg hover:bg-orange-200 border border-orange-200 disabled:opacity-50"
                            title="Imprimir Conduce de Salida"
                        >
                            <Truck size={18} /> <span className="hidden sm:inline">Conduce</span>
                        </button>
                    )}

                    <button
                        onClick={() => setIsPaymentModalOpen(true)}
                        className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                        title="Registrar Pago"
                    >
                        <Banknote size={18} /> <span className="hidden sm:inline">Pagar</span>
                    </button>

                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                    >
                        <Printer size={18} />
                    </button>

                    <button
                        onClick={handleVoid}
                        disabled={invoice.status === 'draft' || invoice.type_code === '33'}
                        className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Anular Factura (Nota de Crédito)"
                    >
                        <XCircle size={18} /> <span className="hidden sm:inline">Anular</span>
                    </button>
                </div>
            </div>

            <div className="bg-white border border-gray-200 shadow-lg rounded-xl p-6 md:p-8 print:shadow-none print:border-none">
                {invoice?.status === 'signed' && (
                    <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3 text-amber-800 print:hidden">
                        <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                        <div>
                            <p className="font-bold text-sm">Factura pendiente de envío a DGII</p>
                            <p className="text-xs opacity-90">Esta factura ya está firmada legalmente, pero el código QR solo podrá ser validado en el portal de la DGII después de que pulses el botón <strong>DGII</strong> para enviarla.</p>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start border-b border-gray-100 pb-8 mb-8 gap-6 md:gap-0">
                    <div>
                        <div className="flex items-center gap-2 text-blue-600 mb-2">
                            <ShoppingCart className="w-6 h-6" />
                            <span className="font-bold text-xl tracking-tight">{company?.name || 'Cargando...'}</span>
                        </div>
                        <p className="text-sm text-gray-500">{company?.address}</p>
                        <p className="text-sm text-gray-500">RNC: {company?.rnc}</p>
                        <p className="text-sm text-gray-500">{company?.phone}</p>
                    </div>
                    <div className="text-left md:text-right w-full md:w-auto">
                        <div className="flex flex-col md:items-end">
                            <h1 className="text-2xl font-bold text-gray-900">{getTypeName(invoice.type_code)}</h1>
                            <span className="text-blue-600 font-mono text-sm font-semibold">#{(invoice.sequential_number || invoice.id).toString().padStart(6, '0')}</span>
                        </div>
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
                <div className="overflow-x-auto mb-8">
                    <table className="w-full min-w-[600px] table-fixed">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 text-sm font-semibold text-gray-600 w-[40%]">Descripción</th>
                                <th className="text-right py-3 text-sm font-semibold text-gray-600 w-[10%]">Cant</th>
                                <th className="text-right py-3 text-sm font-semibold text-gray-600 w-[15%]">Precio</th>
                                <th className="text-right py-3 text-sm font-semibold text-gray-600 w-[15%]">ITBIS</th>
                                <th className="text-right py-3 text-sm font-semibold text-gray-600 w-[20%]">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {invoice.items.map((item) => (
                                <tr key={item.id} className="align-top">
                                    <td className="py-3 text-gray-800 wrap-break-word pr-2">{item.description}</td>
                                    <td className="py-3 text-right text-gray-600 whitespace-nowrap">{item.quantity}</td>
                                    <td className="py-3 text-right text-gray-600 whitespace-nowrap">{parseFloat(item.unit_price).toFixed(2)}</td>
                                    <td className="py-3 text-right text-gray-600 whitespace-nowrap">
                                        <span className="text-xs text-gray-500 mr-1">({parseFloat(item.tax_rate || '18').toFixed(0)}%)</span>
                                        {parseFloat(item.line_tax).toFixed(2)}
                                    </td>
                                    <td className="py-3 text-right font-medium text-gray-900 whitespace-nowrap">{parseFloat(item.line_amount).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer / Totals */}
                <div className="flex flex-col md:flex-row justify-between md:items-end border-t border-gray-100 pt-8 gap-6 md:gap-0">
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
            {invoice && (
                <PaymentModal
                    isOpen={isPaymentModalOpen}
                    onClose={() => setIsPaymentModalOpen(false)}
                    invoice={invoice}
                    onSuccess={() => setRefreshTrigger(prev => prev + 1)}
                />
            )}
        </div>
    );
};
