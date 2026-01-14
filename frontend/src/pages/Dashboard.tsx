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
        revenueTrend: 0
    });
    const [recentInvoices, setRecentInvoices] = useState<any[]>([]);
    const [weeklyData, setWeeklyData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
        const fetchData = async () => {
            try {
                const [invoicesRes, alertsRes, expensesRes, expenseStatsRes] = await Promise.all([
                    axios.get('/api/invoices', { params: { all: 'true' } }),
                    axios.get('/api/inventory/alerts'),
                    axios.get('/api/expenses'),
                    axios.get('/api/expenses/stats-by-date')
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
                    const dayIncome = invoices
                        .filter((i: any) => i.created_at.startsWith(date) && i.status !== 'draft')
                        .reduce((acc: number, curr: any) => acc + parseFloat(curr.total), 0);

                    const dayExpense = expenseStats.find((e: any) => e.date === date)?.total || 0;

                    return { date, income: dayIncome, expense: parseFloat(dayExpense) };
                });

                const maxVal = Math.max(...chartData.map(d => Math.max(d.income, d.expense)));

                const scaledChartData = chartData.map(d => ({
                    ...d,
                    incomeHeight: maxVal > 0 ? (d.income / maxVal) * 100 : 0,
                    expenseHeight: maxVal > 0 ? (d.expense / maxVal) * 100 : 0,
                    dayName: new Date(d.date).toLocaleDateString('es-DO', { weekday: 'short' })
                }));



                const totalExpenses = expenses.reduce((acc: number, curr: any) => acc + parseFloat(curr.amount), 0);

                // Revenue Trend logic
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
        return <div className="p-8 text-center text-slate-500 animate-pulse">Cargando dashboard...</div>;
    }

    return (
        <div className="space-y-8">
            {/* KPI Section */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <KpiCard
                    title="Balance Total"
                    value={`RD$ ${stats.totalRevenue.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`}
                    trendValue={stats.revenueTrend.toFixed(1) + "%"}
                    trendPositive={stats.revenueTrend > 0}
                    subtext="Disponible en cuentas"
                />
                <KpiCard
                    title="Ingresos Mensuales"
                    value={`RD$ ${stats.totalRevenue.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`}
                    trendValue="-1.2%" // Dummy for design match
                    trendPositive={false}
                    subtext="Proyectado fin de mes"
                />
                <KpiCard
                    title="Facturas Pendientes"
                    value={`RD$ ${stats.totalAR.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`}
                    statusTag={`${stats.invoiceCount} Activas`}
                    subtext="Vencen en 7 días"
                />
                <KpiCard
                    title="Gastos Mensuales"
                    value={`RD$ ${stats.totalExpenses.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`}
                    trendValue="-5.0%"
                    trendPositive={true}
                    subtext="32% del ingreso total"
                />
            </div>

            {/* Middle Content: Charts and Feed */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Revenue Chart Area */}
                <div className="xl:col-span-2 bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-border-dark p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold">Rendimiento</h3>
                            <p className="text-sm text-slate-500">Comparación anual</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="px-3 py-1.5 text-xs font-bold bg-slate-100 dark:bg-background-dark rounded-lg hover:bg-primary/10 transition-colors">6 Meses</button>
                            <button className="px-3 py-1.5 text-xs font-bold bg-primary text-white rounded-lg">12 Meses</button>
                        </div>
                    </div>
                    <div className="w-full">
                        <div className="flex items-end gap-2 mb-4">
                            <span className="text-4xl font-bold tracking-tight">RD$ {stats.totalRevenue.toLocaleString('es-DO', { compactDisplay: 'short' })}</span>
                            <span className="text-emerald-500 font-bold mb-1 flex items-center">
                                <span className="material-symbols-outlined text-sm">trending_up</span>
                                {stats.revenueTrend.toFixed(1)}%
                            </span>
                        </div>

                        {/* Simplified Chart (Bar representation for now to match data structure) */}
                        <div className="h-64 flex items-end justify-between gap-2 mt-6">
                            {weeklyData.map((d, i) => (
                                <div key={i} className="group relative w-full h-full flex flex-col justify-end gap-1">
                                    <div className="flex gap-1 items-end h-full w-full justify-center">
                                        <div className="w-1/2 bg-primary/80 rounded-t-sm" style={{ height: `${d.incomeHeight}%` }}></div>
                                        <div className="w-1/2 bg-slate-200 dark:bg-slate-700 rounded-t-sm" style={{ height: `${d.expenseHeight}%` }}></div>
                                    </div>
                                    <span className="text-xs text-slate-400 text-center mt-3 font-medium uppercase">{d.dayName}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-border-dark p-6 shadow-sm overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Actividad Reciente</h3>
                        <button className="text-primary text-sm font-bold hover:underline">Ver Todo</button>
                    </div>
                    <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {recentInvoices.slice(0, 3).map((inv) => (
                            <div key={inv.id} className="flex gap-4">
                                <div className="size-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-blue-500 text-xl">description</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">Nueva Factura Creada</p>
                                        <span className="text-[10px] text-slate-400 font-medium">Hace 1h</span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Factura #{inv.sequential_number}</p>
                                    <p className="text-primary text-sm font-bold mt-1">RD$ {parseFloat(inv.total).toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                        {stats.stockAlerts > 0 && (
                            <div className="flex gap-4">
                                <div className="size-10 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-rose-500 text-xl">warning</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <p className="text-sm font-bold text-rose-500">Alerta de Inventario</p>
                                        <span className="text-[10px] text-slate-400 font-medium">Ahora</span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{stats.stockAlerts} productos bajos en stock</p>
                                    <Link to="/inventory" className="text-rose-500 text-xs font-bold mt-1 block hover:underline">Revisar</Link>
                                </div>
                            </div>
                        )}
                        <div className="flex gap-4">
                            <div className="size-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-emerald-500 text-xl">add_shopping_cart</span>
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">Nuevo Pago</p>
                                    <span className="text-[10px] text-slate-400 font-medium">Ayer</span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Transferencia recibida</p>
                                <p className="text-emerald-500 text-sm font-bold mt-1">+RD$ 4,250.00</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer/Bottom List section */}
            <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-border-dark shadow-sm">
                <div className="p-6 border-b border-slate-200 dark:border-border-dark flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Transacciones Recientes</h3>
                    <Link to="/invoices">
                        <button className="flex items-center gap-1 text-primary text-sm font-bold hover:underline">
                            Ver todas
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-background-dark/30 text-xs text-slate-500 uppercase font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Transacción / Cliente</th>
                                <th className="px-6 py-4">Categoría</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4">Fecha</th>
                                <th className="px-6 py-4 text-right">Monto</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-border-dark">
                            {recentInvoices.map((inv) => (
                                <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-background-dark transition-colors cursor-pointer">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-slate-500">receipt</span>
                                            </div>
                                            <div>
                                                <span className="text-sm font-semibold block">{inv.client_name || 'Cliente Final'}</span>
                                                <span className="text-xs text-slate-400 font-mono">{inv.reference_ncf || `#${inv.sequential_number}`}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold">Venta</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={inv.status} />
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{new Date(inv.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right font-bold text-sm">RD$ {parseFloat(inv.total).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// Components
const KpiCard = ({ title, value, trendValue, trendPositive, subtext, statusTag }: any) => {
    return (
        <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-slate-200 dark:border-border-dark shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <span className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</span>
                {statusTag ? (
                    <div className="text-amber-500 bg-amber-500/10 px-2 py-1 rounded text-xs font-bold">{statusTag}</div>
                ) : (
                    trendValue && (
                        <div className={`px-2 py-1 rounded text-xs font-bold ${trendPositive ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'}`}>
                            {trendValue}
                        </div>
                    )
                )}
            </div>
            <div className="text-3xl font-bold mb-1">{value}</div>
            <p className="text-xs text-slate-400">{subtext}</p>
        </div>
    );
};

const StatusBadge = ({ status }: { status: string }) => {
    const styles: any = {
        draft: 'text-slate-500',
        signed: 'text-blue-500',
        sent: 'text-emerald-500',
        paid: 'text-indigo-500'
    };

    const labels: any = {
        draft: 'Borrador',
        signed: 'Firmada',
        sent: 'Completado',
        paid: 'Pagada'
    };

    return (
        <span className={`flex items-center gap-1 text-xs font-bold ${styles[status] || 'text-slate-500'}`}>
            <span className={`size-1.5 rounded-full ${status === 'sent' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
            {labels[status] || status}
        </span>
    );
};
