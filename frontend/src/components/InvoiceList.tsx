import { Banknote, Bell, CheckCircle, FileText, Send } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import axios from '../api';
import { PaymentModal } from './PaymentModal';

interface Invoice {
    id: number;
    sequential_number: number;
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

    // Filters & Pagination State
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(5);
    const [totalPages, setTotalPages] = useState(1);
    const [totalDocs, setTotalDocs] = useState(0);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1);
            setDebouncedSearch(searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Reset page on filter change
    useEffect(() => {
        setPage(1);
    }, [statusFilter, startDate, endDate]);

    useEffect(() => {
        fetchInvoices();
        fetchSettings();
    }, [page, limit, debouncedSearch, statusFilter, startDate, endDate]);

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
            const params = {
                page,
                limit,
                search: debouncedSearch,
                status: statusFilter,
                startDate,
                endDate
            };

            const res = await axios.get('/api/invoices', { params });

            if (res.data.meta) {
                setInvoices(res.data.data);
                setTotalPages(res.data.meta.totalPages);
                setTotalDocs(res.data.meta.total);
            } else {
                setInvoices(res.data);
            }
        } catch (err) {
            console.error(err);
            toast.error('Error cargando facturas');
        }
    };

    const signInvoice = async (id: number) => {
        try {
            await axios.post(`/api/invoices/${id}/sign`);
            toast?.success(isElectronicEnabled ? 'Factura firmada' : 'Factura completada');
            fetchInvoices();
        } catch (err) {
            toast.error(isElectronicEnabled ? 'Error al firmar la factura' : 'Error al completar la factura');
        }
    };

    const sendToDGII = async (id: number) => {
        try {
            const conf = window.confirm('¿Estás seguro de enviar esta factura a la DGII?');
            if (!conf) return;

            await axios.post(`/api/invoices/${id}/send`);
            toast.success('Factura enviada correctamente');
            fetchInvoices();
        } catch (err: any) {
            console.error(err);
            toast.error('Error al enviar: ' + (err.response?.data?.error || 'Error desconocido'));
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
            toast.error('Error al descargar el XML');
        }
    };

    const sendReminder = async (id: number) => {
        try {
            await axios.post(`/api/invoices/${id}/reminder`);
            toast.success('Recordatorio enviado correctamente');
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Error al enviar recordatorio');
        }
    };

    // Use server-side filtered data directly
    const filteredInvoices = invoices;

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white tracking-tight">Facturas</h2>
                    <p className="text-gray-500 dark:text-slate-400 mt-1">
                        {totalDocs > 0 ? `${totalDocs} comprobantes encontrados` : 'Gestiona y visualiza tus comprobantes fiscales'}
                    </p>
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-3 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Buscar por cliente, # o monto..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2 border border-gray-200 dark:border-border-dark bg-white dark:bg-card-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:text-white dark:placeholder:text-slate-500 w-full md:w-64"
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-200 dark:border-border-dark bg-white dark:bg-card-dark text-gray-700 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
                    >
                        <option value="all">Todos</option>
                        <option value="draft">Borrador</option>
                        <option value="signed">Firmada</option>
                        <option value="sent">Enviada</option>
                    </select>
                    <div className="flex gap-2 items-center">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="px-3 py-2 border border-gray-200 dark:border-border-dark bg-white dark:bg-card-dark text-gray-700 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                            title="Fecha Inicial"
                        />
                        <span className="text-gray-400">al</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="px-3 py-2 border border-gray-200 dark:border-border-dark bg-white dark:bg-card-dark text-gray-700 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                            title="Fecha Final"
                        />
                        {(startDate || endDate) && (
                            <button
                                onClick={() => { setStartDate(''); setEndDate(''); }}
                                className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 font-medium"
                            >
                                Limpiar
                            </button>
                        )}
                    </div>
                    <button
                        onClick={fetchInvoices}
                        className="p-2 text-gray-400 hover:text-primary transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 border border-gray-200 dark:border-border-dark"
                        title="Actualizar"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 16h5v5" /></svg>
                    </button>
                    <Link to="/create" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium whitespace-nowrap shadow-md shadow-blue-500/20">
                        + Nueva
                    </Link>
                </div>
            </div>

            {/* Mobile View - Cards */}
            <div className="md:hidden grid grid-cols-1 gap-4">
                {filteredInvoices.map((inv) => (
                    <div key={inv.id} className="bg-white dark:bg-card-dark p-4 rounded-xl shadow-sm border border-gray-200 dark:border-border-dark flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                                <div className="bg-blue-50 dark:bg-blue-500/10 p-1.5 rounded-lg text-primary dark:text-blue-400">
                                    <FileText size={16} />
                                </div>
                                <span className="font-bold text-gray-900 dark:text-white font-mono">#{(inv.sequential_number || inv.id).toString().padStart(6, '0')}</span>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${inv.status === 'sent'
                                    ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20'
                                    : inv.status === 'signed' || inv.status === 'completed'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                                        : inv.status === 'draft'
                                            ? 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700/30 dark:text-slate-400 dark:border-slate-600'
                                            : 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20'
                                    }`}>
                                    {inv.status === 'sent' ? <Send size={12} /> : (inv.status === 'signed' || inv.status === 'completed') ? <CheckCircle size={12} /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                                    {inv.status === 'sent' ? 'Enviada' : inv.status === 'completed' ? 'Completada' : inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                                </span>
                                {parseFloat(inv.total) - parseFloat(inv.total_paid as string) <= 0 && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400">
                                        Pagada
                                    </span>
                                )}
                            </div>
                        </div>

                        <div>
                            <p className="font-bold text-gray-900 dark:text-white">{inv.client_name || 'Desconocido'}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(inv.created_at).toLocaleDateString()}</p>
                        </div>

                        <div className="flex justify-between items-center border-t border-gray-100 dark:border-border-dark pt-3">
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Total</p>
                                <p className="font-bold text-gray-900 dark:text-white">RD$ {parseFloat(inv.total).toLocaleString('es-DO', { minimumFractionDigits: 2 })}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-500 dark:text-slate-400">Saldo</p>
                                <span className={`font-bold ${parseFloat(inv.total) - parseFloat(inv.total_paid as string) <= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                    RD$ {(parseFloat(inv.total) - parseFloat(inv.total_paid as string)).toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-border-dark">
                            {inv.status === 'draft' && (
                                <button
                                    onClick={() => signInvoice(inv.id)}
                                    className="text-sm font-bold text-primary hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-500/10 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                    {isElectronicEnabled ? 'Firmar' : 'Completar'}
                                </button>
                            )}
                            {(inv.status === 'signed' || inv.status === 'completed') && (
                                <div className="flex items-center justify-end gap-2 flex-wrap">
                                    <Link
                                        to={`/invoices/${inv.id}`}
                                        className="text-sm font-bold text-primary hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 px-3 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                                    >
                                        Ver
                                    </Link>
                                    {inv.status === 'signed' && (
                                        <>
                                            <button
                                                onClick={() => downloadXml(inv.id)}
                                                className="text-sm font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                title="Descargar XML para Firma Externa"
                                            >
                                                XML
                                            </button>
                                            <button
                                                onClick={() => sendToDGII(inv.id)}
                                                className="flex items-center gap-1 text-sm font-bold text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-500/10 px-3 py-1.5 rounded-lg transition-colors"
                                            >
                                                <Send size={14} /> Enviar
                                            </button>
                                        </>
                                    )}
                                    {parseFloat(inv.total) - parseFloat(inv.total_paid as string) > 0 && (
                                        <>
                                            <button
                                                onClick={() => sendReminder(inv.id)}
                                                className="flex items-center gap-1 text-sm font-bold text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-500/10 px-3 py-1.5 rounded-lg transition-colors"
                                                title="Enviar Recordatorio de Pago"
                                            >
                                                <Bell size={14} />
                                            </button>
                                            <button
                                                onClick={() => { setSelectedInvoice(inv); setIsPaymentModalOpen(true); }}
                                                className="flex items-center gap-1 text-sm font-bold text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 px-3 py-1.5 rounded-lg transition-colors"
                                            >
                                                <Banknote size={14} /> Pagar
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                            {inv.status === 'sent' && (
                                <div className="flex items-center justify-end gap-2">
                                    <span className="text-sm text-slate-400 dark:text-slate-500 font-bold px-3">Enviada</span>
                                    {parseFloat(inv.total) - parseFloat(inv.total_paid as string) > 0 && (
                                        <>
                                            <button
                                                onClick={() => sendReminder(inv.id)}
                                                className="flex items-center gap-1 text-sm font-bold text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-500/10 px-3 py-1.5 rounded-lg transition-colors"
                                                title="Enviar Recordatorio de Pago"
                                            >
                                                <Bell size={14} />
                                            </button>
                                            <button
                                                onClick={() => { setSelectedInvoice(inv); setIsPaymentModalOpen(true); }}
                                                className="flex items-center gap-1 text-sm font-bold text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 px-3 py-1.5 rounded-lg transition-colors"
                                            >
                                                <Banknote size={14} /> Pagar
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {filteredInvoices.length === 0 && (
                    <div className="flex flex-col items-center gap-2 p-8 text-center bg-gray-50 dark:bg-card-dark rounded-xl border border-dashed border-gray-200 dark:border-border-dark text-gray-500 dark:text-slate-400">
                        <FileText size={32} className="text-gray-300 dark:text-slate-600" />
                        <p>{searchTerm || statusFilter !== 'all' ? 'No se encontraron facturas con estos filtros' : 'No hay facturas registradas'}</p>
                    </div>
                )}
            </div>

            {/* Desktop View - Table */}
            <div className="hidden md:block bg-white dark:bg-card-dark shadow-sm border border-slate-200 dark:border-border-dark rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-background-dark/30 border-b border-slate-100 dark:border-border-dark">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID Factura</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Cliente</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Saldo</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-border-dark">
                            {filteredInvoices.map((inv) => (
                                <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                    <td className="p-2 pl-6">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-50 dark:bg-blue-500/10 p-2 rounded-lg text-primary dark:text-blue-400">
                                                <FileText size={18} />
                                            </div>
                                            <span className="font-bold text-slate-900 dark:text-white font-mono">#{(inv.sequential_number || inv.id).toString().padStart(6, '0')}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-200 font-bold">
                                        {inv.client_name || 'Desconocido'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                                        {new Date(inv.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-slate-900 dark:text-white">RD$ {parseFloat(inv.total).toLocaleString('es-DO', { minimumFractionDigits: 2 })}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`font-bold ${parseFloat(inv.total) - parseFloat(inv.total_paid as string) <= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                            RD$ {(parseFloat(inv.total) - parseFloat(inv.total_paid as string)).toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${inv.status === 'sent'
                                            ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20'
                                            : inv.status === 'signed' || inv.status === 'completed'
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                                                : inv.status === 'draft'
                                                    ? 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700/30 dark:text-slate-400 dark:border-slate-600'
                                                    : 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20'
                                            }`}>
                                            {inv.status === 'sent' ? <Send size={12} /> : (inv.status === 'signed' || inv.status === 'completed') ? <CheckCircle size={12} /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                                            {inv.status === 'sent' ? 'Enviada' : inv.status === 'completed' ? 'Completada' : inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                                        </span>
                                        {parseFloat(inv.total) - parseFloat(inv.total_paid as string) <= 0 && (
                                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400">
                                                Pagada
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {inv.status === 'draft' && (
                                            <button
                                                onClick={() => signInvoice(inv.id)}
                                                className="text-sm font-bold text-primary hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-500/10 px-3 py-1.5 rounded-lg transition-colors"
                                            >
                                                {isElectronicEnabled ? 'Firmar' : 'Completar'}
                                            </button>
                                        )}
                                        {(inv.status === 'signed' || inv.status === 'completed') && (
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    to={`/invoices/${inv.id}`}
                                                    className="text-sm font-bold text-primary hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 px-3 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                                                >
                                                    Ver
                                                </Link>
                                                <>
                                                    <button
                                                        onClick={() => downloadXml(inv.id)}
                                                        className="text-sm font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                        title="Descargar XML"
                                                    >
                                                        XML
                                                    </button>
                                                    {inv.status === 'signed' && (
                                                        <button
                                                            onClick={() => sendToDGII(inv.id)}
                                                            className="flex items-center gap-1 text-sm font-bold text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-500/10 px-3 py-1.5 rounded-lg transition-colors"
                                                        >
                                                            <Send size={14} /> Enviar
                                                        </button>
                                                    )}
                                                </>
                                                {parseFloat(inv.total) - parseFloat(inv.total_paid as string) > 0 && (
                                                    <>
                                                        <button
                                                            onClick={() => sendReminder(inv.id)}
                                                            className="flex items-center gap-1 text-sm font-bold text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-500/10 px-3 py-1.5 rounded-lg transition-colors"
                                                            title="Enviar Recordatorio de Pago"
                                                        >
                                                            <Bell size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => { setSelectedInvoice(inv); setIsPaymentModalOpen(true); }}
                                                            className="flex items-center gap-1 text-sm font-bold text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 px-3 py-1.5 rounded-lg transition-colors"
                                                        >
                                                            <Banknote size={14} /> Pagar
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                        {inv.status === 'sent' && (
                                            <div className="flex items-center justify-end gap-2">
                                                <span className="text-sm text-slate-400 dark:text-slate-500 font-bold px-3">Enviada</span>
                                                {parseFloat(inv.total) - parseFloat(inv.total_paid as string) > 0 && (
                                                    <>
                                                        <button
                                                            onClick={() => sendReminder(inv.id)}
                                                            className="flex items-center gap-1 text-sm font-bold text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-500/10 px-3 py-1.5 rounded-lg transition-colors"
                                                            title="Enviar Recordatorio de Pago"
                                                        >
                                                            <Bell size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => { setSelectedInvoice(inv); setIsPaymentModalOpen(true); }}
                                                            className="flex items-center gap-1 text-sm font-bold text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 px-3 py-1.5 rounded-lg transition-colors"
                                                        >
                                                            <Banknote size={14} /> Pagar
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredInvoices.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <FileText size={48} className="text-slate-200 dark:text-slate-700" />
                                            <p>{searchTerm || statusFilter !== 'all' ? 'No se encontraron facturas con estos filtros' : 'No hay facturas registradas'}</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination & Limit Controls */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-8 pt-4 border-t border-slate-100 dark:border-border-dark bg-white dark:bg-card-dark p-4 rounded-xl shadow-sm">

                    {/* Rows per page */}
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <span>Mostrar</span>
                        <select
                            value={limit}
                            onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                            className="bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark text-slate-700 dark:text-slate-200 text-sm rounded-lg focus:ring-primary focus:border-primary block p-1.5 focus:outline-none"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                        <span>por página</span>
                    </div>

                    {/* Pagination Buttons */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Anterior
                            </button>
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                Página {page} de {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages || page >= totalPages}
                                className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Siguiente
                            </button>
                        </div>
                    )}
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
