import { AlertCircle, ArrowRight, ArrowUpRight, BarChart3, CreditCard, DollarSign, FileText, Plus, TrendingUp, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api';
import { useAuth } from '../context/AuthContext';

export const Dashboard = () => {
    const { fetchProfile } = useAuth();
    const [stats, setStats] = useState({
        totalRevenue: 0,
        invoiceCount: 0,
        totalAR: 0,
        totalExpenses: 0,
        stockAlerts: 0,
        taxDue: 0,
        revenueTrend: 0 // NEW
    });
    const [recentInvoices, setRecentInvoices] = useState<any[]>([]);
    const [topClients, setTopClients] = useState<any[]>([]);
    const [weeklyData, setWeeklyData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
        const fetchData = async () => {
            try {
                const [invoicesRes, alertsRes, expensesRes, expenseStatsRes] = await Promise.all([
                    axios.get('/api/invoices', { params: { all: 'true' } }),
                    axios.get('/api/inventory/alerts'),
                    axios.get('/api/expenses'), // NEW
                    axios.get('/api/expenses/stats-by-date') // NEW
                ]);

                const invoices = invoicesRes.data;
                const alerts = alertsRes.data;
                const expenses = expensesRes.data || [];
                const expenseStats = expenseStatsRes.data || [];

                // 1. Basic Stats
                const revenue = invoices
                    .filter((i: any) => i.status !== 'draft')
                    .reduce((acc: number, curr: any) => acc + (curr.total_paid ? parseFloat(curr.total_paid) : 0), 0);

                const totalInvoiced = invoices
                    .filter((i: any) => i.status !== 'draft')
                    .reduce((acc: number, curr: any) => acc + parseFloat(curr.total), 0);

                const totalTax = invoices
                    .filter((i: any) => i.status !== 'draft')
                    .reduce((acc: number, curr: any) => acc + parseFloat(curr.tax_total || 0), 0);

                const totalAR = totalInvoiced - revenue;

                // 2. Weekly Data for Chart (Income vs Expenses)
                const last7Days = Array.from({ length: 7 }, (_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    return d.toISOString().split('T')[0];
                }).reverse();

                const chartData = last7Days.map(date => {
                    // Income
                    const dayIncome = invoices
                        .filter((i: any) => i.created_at.startsWith(date) && i.status !== 'draft')
                        .reduce((acc: number, curr: any) => acc + parseFloat(curr.total), 0);

                    // Expenses
                    const dayExpense = expenseStats.find((e: any) => e.date === date)?.total || 0;

                    return { date, income: dayIncome, expense: parseFloat(dayExpense) };
                });

                // Find max value for scaling (checking both income and expense)
                const maxVal = Math.max(...chartData.map(d => Math.max(d.income, d.expense)));

                const scaledChartData = chartData.map(d => ({
                    ...d,
                    incomeHeight: maxVal > 0 ? (d.income / maxVal) * 100 : 0,
                    expenseHeight: maxVal > 0 ? (d.expense / maxVal) * 100 : 0,
                    dayName: new Date(d.date).toLocaleDateString('es-DO', { weekday: 'short' })
                }));

                // 3. Top Clients
                const clientMap = new Map();
                invoices.forEach((inv: any) => {
                    if (inv.status !== 'draft') {
                        const clientName = inv.client_name || 'Cliente Final';
                        const current = clientMap.get(clientName) || 0;
                        clientMap.set(clientName, current + parseFloat(inv.total));
                    }
                });
                const sortedClients = Array.from(clientMap.entries())
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 4)
                    .map(([name, total]) => ({ name, total }));


                const totalExpenses = expenses.reduce((acc: number, curr: any) => acc + parseFloat(curr.amount), 0);

                // 4. Revenue Trend (Current Month vs Last Month)
                const now = new Date();
                const currentMonth = now.getMonth();
                const currentYear = now.getFullYear();

                let lastMonth = currentMonth - 1;
                let lastMonthYear = currentYear;
                if (lastMonth < 0) {
                    lastMonth = 11;
                    lastMonthYear = currentYear - 1;
                }

                const currentMonthRevenue = invoices
                    .filter((i: any) => {
                        const d = new Date(i.created_at);
                        return i.status !== 'draft' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
                    })
                    .reduce((acc: number, curr: any) => acc + (curr.total_paid ? parseFloat(curr.total_paid) : 0), 0);

                const lastMonthRevenue = invoices
                    .filter((i: any) => {
                        const d = new Date(i.created_at);
                        return i.status !== 'draft' && d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
                    })
                    .reduce((acc: number, curr: any) => acc + (curr.total_paid ? parseFloat(curr.total_paid) : 0), 0);

                let trendDiff = 0;
                if (lastMonthRevenue > 0) {
                    trendDiff = ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
                } else if (currentMonthRevenue > 0) {
                    trendDiff = 100;
                }

                setStats({
                    totalRevenue: revenue,
                    invoiceCount: invoices.length,
                    totalAR: totalAR,
                    totalExpenses: totalExpenses,
                    stockAlerts: alerts.length,
                    taxDue: totalTax,
                    revenueTrend: trendDiff
                });

                setWeeklyData(scaledChartData);
                setTopClients(sortedClients);
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
        return <div className="p-8 text-center text-gray-500 animate-pulse">Cargando estadísticas del negocio...</div>;
    }

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
                    <p className="text-gray-500 mt-1">Visión general y rendimiento financiero</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <Link to="/clients/new" className="px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium flex-1 md:flex-none text-center shadow-sm">
                        Nuevo Cliente
                    </Link>
                    <Link to="/create" className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md shadow-blue-600/20 flex-1 md:flex-none">
                        <Plus size={18} /> Nueva Factura
                    </Link>
                </div>
            </header>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard
                    title="Ingresos Totales"
                    value={`RD$ ${stats.totalRevenue.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`}
                    icon={<DollarSign size={24} />}
                    color="green"
                    trend={`${stats.revenueTrend > 0 ? '+' : ''}${stats.revenueTrend.toFixed(1)}% este mes`}
                />
                <KpiCard
                    title="Gastos Totales"
                    value={`RD$ ${stats.totalExpenses.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`}
                    icon={<ArrowUpRight size={24} />}
                    color="orange"
                    subtext="Acumulado del mes"
                />
                <KpiCard
                    title="Beneficio Neto"
                    value={`RD$ ${(stats.totalRevenue - stats.totalExpenses).toLocaleString('es-DO', { minimumFractionDigits: 2 })}`}
                    icon={<TrendingUp size={24} />}
                    color={stats.totalRevenue - stats.totalExpenses >= 0 ? "blue" : "red"}
                    subtext="Ingresos - Gastos"
                />
                <KpiCard
                    title="Por Cobrar (CXC)"
                    value={`RD$ ${stats.totalAR.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`}
                    icon={<CreditCard size={24} />}
                    color="red"
                />
            </div>

            {/* Middle Section: Chart & Quick Actions/Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <BarChart3 size={20} className="text-gray-400" />
                            Ingresos de la Semana
                        </h3>
                        <span className="text-xs text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded-full">Últimos 7 días</span>
                    </div>

                    <div className="h-64 flex items-end justify-between gap-3 sm:gap-6 mt-4 pb-2">
                        {weeklyData.map((d, i) => (
                            <div key={i} className="group relative w-full h-full flex flex-col justify-end gap-1">
                                {/* Tooltip */}
                                <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-2 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg text-center">
                                    <p className="font-bold border-b border-gray-700 pb-1 mb-1">{d.dayName}</p>
                                    <div className="flex gap-4">
                                        <p className="text-green-400">Ing: {d.income.toLocaleString()}</p>
                                        <p className="text-red-400">Gas: {d.expense.toLocaleString()}</p>
                                    </div>
                                </div>

                                {/* Bars Container */}
                                <div className="flex gap-1 items-end h-full w-full justify-center">
                                    {/* Income Bar (Green) */}
                                    <div
                                        className="w-1/2 bg-emerald-500 rounded-t-sm hover:bg-emerald-400 transition-all duration-500"
                                        style={{ height: `${d.incomeHeight || 2}%` }}
                                    ></div>
                                    {/* Expense Bar (Red) */}
                                    <div
                                        className="w-1/2 bg-rose-500 rounded-t-sm hover:bg-rose-400 transition-all duration-500"
                                        style={{ height: `${d.expenseHeight || 2}%` }}
                                    ></div>
                                </div>
                                <span className="text-xs text-gray-400 text-center mt-3 font-medium uppercase">{d.dayName}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Clients or Alerts */}
                <div className="space-y-6">
                    {/* Stock Alerts (if any) */}
                    {stats.stockAlerts > 0 && (
                        <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                            <div className="flex items-center gap-3 mb-2">
                                <AlertCircle className="text-red-500" />
                                <h3 className="font-bold text-red-800">Atención Requerida</h3>
                            </div>
                            <p className="text-red-600 text-sm mb-4">Tienes <strong>{stats.stockAlerts} productos</strong> con inventario bajo o agotado.</p>
                            <Link to="/inventory" className="text-xs font-bold text-white bg-red-500 px-4 py-2 rounded-lg inline-block hover:bg-red-600 transition-colors">Ver Inventario</Link>
                        </div>
                    )}

                    {/* Top Clients */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Users size={18} className="text-gray-400" /> Top Clientes
                        </h3>
                        <div className="space-y-4">
                            {topClients.length === 0 ? (
                                <p className="text-gray-400 text-sm">Aún no hay datos suficientes</p>
                            ) : topClients.map((client: any, i) => (
                                <div key={i} className="flex justify-between items-center pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                                            {client.name.charAt(0)}
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 truncate max-w-[120px]">{client.name}</span>
                                    </div>
                                    <span className="text-sm font-bold text-gray-900">RD$ {client.total.toLocaleString('es-DO', { compactDisplay: 'short', notation: 'compact' })}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Invoices Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                    <h3 className="font-bold text-gray-800">Facturas Recientes</h3>
                    <Link to="/invoices" className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1">
                        Ver todas <ArrowRight size={16} />
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">NCF / ID</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Cliente</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Fecha</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Total</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {recentInvoices.map((inv) => (
                                <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900 font-mono text-xs">
                                        {inv.reference_ncf || `#${inv.sequential_number.toString().padStart(6, '0')}`}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{inv.client_name || 'Cliente Final'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(inv.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 font-bold text-gray-900">RD$ {parseFloat(inv.total).toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={inv.status} />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link to={`/invoices/${inv.id}`} className="text-gray-400 hover:text-blue-600">
                                            <ArrowUpRight size={18} />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {recentInvoices.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                                                <FileText size={24} />
                                            </div>
                                            <p>No hay facturas recientes</p>
                                        </div>
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

// Sub-components for cleaner code
const KpiCard = ({ title, value, icon, color, trend, subtext }: any) => {
    const colorClasses: any = {
        green: 'bg-green-50 text-green-600',
        red: 'bg-red-50 text-red-600',
        blue: 'bg-blue-50 text-blue-600',
        indigo: 'bg-indigo-50 text-indigo-600',
        orange: 'bg-orange-50 text-orange-600',
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${colorClasses[color] || colorClasses.blue}`}>
                    {icon}
                </div>
                {trend && (
                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">{trend}</span>
                )}
            </div>
            <p className="text-gray-500 text-sm font-medium">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
            {subtext && <p className="text-xs text-gray-400 mt-2">{subtext}</p>}
        </div>
    );
};

const StatusBadge = ({ status }: { status: string }) => {
    const styles: any = {
        draft: 'bg-gray-100 text-gray-700',
        signed: 'bg-blue-50 text-blue-700',
        sent: 'bg-green-100 text-green-700',
        paid: 'bg-indigo-100 text-indigo-700'
    };

    const labels: any = {
        draft: 'Borrador',
        signed: 'Firmada',
        sent: 'Aceptada DGII',
        paid: 'Pagada'
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.draft}`}>
            {status === 'sent' && <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>}
            {labels[status] || status}
        </span>
    );
};
