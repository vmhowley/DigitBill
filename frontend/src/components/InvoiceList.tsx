import { Banknote, CheckCircle, FileText, Send } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import axios from '../api';
import { PaymentModal } from './PaymentModal';

interface Invoice {
    id: number;
    client_id: number;
    client_name?: string;
    total: string;
    total_paid: string | number;
    status: string;
    created_at: string;
}

export const InvoiceList: React.FC = () => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [isElectronicEnabled, setIsElectronicEnabled] = useState(true);
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    useEffect(() => {
        fetchInvoices();
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await axios.get('/api/settings/company');
            setIsElectronicEnabled(res.data.electronic_invoicing !== false);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchInvoices = async () => {
        try {
            const res = await axios.get('/api/invoices');
            setInvoices(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const signInvoice = async (id: number) => {
        try {
            await axios.post(`/api/invoices/${id}/sign`);
            toast?.success(isElectronicEnabled ? 'Factura firmada' : 'Factura completada');
            fetchInvoices();
        } catch (err) {
            alert(isElectronicEnabled ? 'Error signing invoice' : 'Error completing invoice');
        }
    };

    const sendToDGII = async (id: number) => {
        try {
            const conf = window.confirm('¿Estás seguro de enviar esta factura a la DGII?');
            if (!conf) return;

            await axios.post(`/api/invoices/${id}/send`);
            alert('Factura enviada correctamente');
            fetchInvoices();
        } catch (err: any) {
            console.error(err);
            alert('Error al enviar: ' + (err.response?.data?.error || 'Error desconocido'));
        }
    };

    const downloadXml = async (id: number) => {
        try {
            const res = await axios.get(`/api/invoices/${id}/xml`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice-${id}.xml`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert('Error downloading XML');
        }
    };

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredInvoices = invoices.filter(inv => {
        const matchesSearch =
            inv.id.toString().includes(searchTerm) ||
            inv.total.includes(searchTerm) ||
            (inv.client_name && inv.client_name.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Facturas</h2>
                    <p className="text-gray-500 mt-1">Gestiona y visualiza tus comprobantes fiscales</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Buscar por Cliente o ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">Todos</option>
                        <option value="draft">Borrador</option>
                        <option value="signed">Firmada</option>
                        <option value="sent">Enviada</option>
                    </select>
                    <button
                        onClick={fetchInvoices}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50 border border-gray-200"
                        title="Actualizar"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 16h5v5" /></svg>
                    </button>
                    <Link to="/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium whitespace-nowrap">
                        + Nueva
                    </Link>
                </div>
            </div>

            <div className="bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID Factura</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Saldo</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredInvoices.map((inv) => (
                                <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                                                <FileText size={18} />
                                            </div>
                                            <span className="font-medium text-gray-900">#{inv.id.toString().padStart(6, '0')}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                                        {inv.client_name || 'Desconocido'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(inv.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-semibold text-gray-900">RD$ {parseFloat(inv.total).toLocaleString('es-DO', { minimumFractionDigits: 2 })}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`font-medium ${parseFloat(inv.total) - parseFloat(inv.total_paid as string) <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            RD$ {(parseFloat(inv.total) - parseFloat(inv.total_paid as string)).toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${inv.status === 'sent'
                                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                                            : inv.status === 'signed' || inv.status === 'completed'
                                                ? 'bg-green-50 text-green-700 border-green-200'
                                                : inv.status === 'draft'
                                                    ? 'bg-gray-100 text-gray-700 border-gray-200'
                                                    : 'bg-orange-50 text-orange-700 border-orange-200'
                                            }`}>
                                            {inv.status === 'sent' ? <Send size={12} /> : (inv.status === 'signed' || inv.status === 'completed') ? <CheckCircle size={12} /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                                            {inv.status === 'sent' ? 'Enviada' : inv.status === 'completed' ? 'Completada' : inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                                        </span>
                                        {parseFloat(inv.total) - parseFloat(inv.total_paid as string) <= 0 && (
                                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                Pagada
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {inv.status === 'draft' && (
                                            <button
                                                onClick={() => signInvoice(inv.id)}
                                                className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                                            >
                                                {isElectronicEnabled ? 'Firmar' : 'Completar'}
                                            </button>
                                        )}
                                        {(inv.status === 'signed' || inv.status === 'completed') && (
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    to={`/invoices/${inv.id}`}
                                                    className="text-sm font-medium text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                                                >
                                                    Ver
                                                </Link>
                                                {inv.status === 'signed' && (
                                                    <>
                                                        <button
                                                            onClick={() => downloadXml(inv.id)}
                                                            className="text-sm font-medium text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                                                        >
                                                            XML
                                                        </button>
                                                        <button
                                                            onClick={() => sendToDGII(inv.id)}
                                                            className="flex items-center gap-1 text-sm font-medium text-purple-600 hover:text-purple-800 hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-colors"
                                                        >
                                                            <Send size={14} /> Enviar
                                                        </button>
                                                    </>
                                                )}
                                                {parseFloat(inv.total) - parseFloat(inv.total_paid as string) > 0 && (
                                                    <button
                                                        onClick={() => { setSelectedInvoice(inv); setIsPaymentModalOpen(true); }}
                                                        className="flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-800 hover:bg-green-50 px-3 py-1.5 rounded-lg transition-colors"
                                                    >
                                                        <Banknote size={14} /> Pagar
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                        {inv.status === 'sent' && (
                                            <div className="flex items-center justify-end gap-2">
                                                <span className="text-sm text-gray-400 font-medium px-3">Enviada</span>
                                                {parseFloat(inv.total) - parseFloat(inv.total_paid as string) > 0 && (
                                                    <button
                                                        onClick={() => { setSelectedInvoice(inv); setIsPaymentModalOpen(true); }}
                                                        className="flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-800 hover:bg-green-50 px-3 py-1.5 rounded-lg transition-colors"
                                                    >
                                                        <Banknote size={14} /> Pagar
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredInvoices.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <FileText size={48} className="text-gray-200" />
                                            <p>{searchTerm || statusFilter !== 'all' ? 'No se encontraron facturas con estos filtros' : 'No hay facturas registradas'}</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedInvoice && (
                <PaymentModal
                    isOpen={isPaymentModalOpen}
                    onClose={() => setIsPaymentModalOpen(false)}
                    invoice={selectedInvoice}
                    onSuccess={fetchInvoices}
                />
            )}
        </div>
    );
};
