import { AlertCircle, ArrowRight, FileText, Package, Plus, TrendingUp, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api';

// Dashboard handles its own loading state for data fetching.
export const Dashboard = () => {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        invoiceCount: 0,
        totalAR: 0,
        clientCount: 0,
        stockAlerts: 0
    });
    const [recentInvoices, setRecentInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // In a real app, we'd have a dedicated /stats endpoint.
                // For now, we'll fetch all invoices and clients to calculate.
                const [invoicesRes, clientsRes, alertsRes] = await Promise.all([
                    axios.get('/api/invoices'),
                    axios.get('/api/clients'),
                    axios.get('/api/inventory/alerts')
                ]);

                const invoices = invoicesRes.data;
                const clients = clientsRes.data;
                const alerts = alertsRes.data;

                const revenue = invoices
                    .filter((i: any) => i.status !== 'draft')
                    .reduce((acc: number, curr: any) => acc + (curr.total_paid ? parseFloat(curr.total_paid) : 0), 0);

                const totalInvoiced = invoices
                    .filter((i: any) => i.status !== 'draft')
                    .reduce((acc: number, curr: any) => acc + parseFloat(curr.total), 0);

                const totalAR = totalInvoiced - revenue;

                setStats({
                    totalRevenue: revenue,
                    invoiceCount: invoices.length,
                    totalAR: totalAR,
                    clientCount: clients.length,
                    stockAlerts: alerts.length
                });

                setRecentInvoices(invoices.slice(0, 5));
            } catch (error) {
                console.error("Error loading dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Cargando estadísticas...</div>;
    }

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
                    <p className="text-gray-500 mt-1">Resumen general de tu negocio</p>
                </div>
                <div className="flex gap-3">
                    <Link to="/clients/new" className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Nuevo Cliente">
                        <Users size={20} />
                    </Link>
                    <Link to="/create" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                        <Plus size={18} /> Nueva Factura
                    </Link>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-green-50 p-3 rounded-xl text-green-600">
                            <TrendingUp size={24} />
                        </div>
                        <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span>
                    </div>
                    <p className="text-gray-500 text-sm font-medium">Ingresos Totales</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">
                        RD$ {stats.totalRevenue.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                    </h3>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                            <FileText size={24} />
                        </div>
                    </div>
                    <p className="text-gray-500 text-sm font-medium">Facturas Emitidas</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.invoiceCount}</h3>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-red-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-red-50 p-3 rounded-xl text-red-600">
                            <AlertCircle size={24} />
                        </div>
                    </div>
                    <p className="text-gray-500 text-sm font-medium">Total por Cobrar</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">
                        RD$ {stats.totalAR.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                    </h3>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-orange-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-orange-50 p-3 rounded-xl text-orange-600">
                            <Package size={24} />
                        </div>
                        {stats.stockAlerts > 0 && (
                            <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
                        )}
                    </div>
                    <p className="text-gray-500 text-sm font-medium">Alertas de Stock</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.stockAlerts}</h3>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">Facturas Recientes</h3>
                    <Link to="/invoices" className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1">
                        Ver todas <ArrowRight size={16} />
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">ID</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Fecha</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Total</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {recentInvoices.map((inv) => (
                                <tr key={inv.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">#{inv.id}</td>
                                    <td className="px-6 py-4 text-gray-500">{new Date(inv.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">RD$ {parseFloat(inv.total).toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${inv.status === 'sent' ? 'bg-green-100 text-green-700' :
                                            inv.status === 'signed' ? 'bg-blue-50 text-blue-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {recentInvoices.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                        No hay actividad reciente.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
