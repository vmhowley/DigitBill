import { Plus, Search, TrendingDown } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import axios from '../api';
import { ExpenseModal } from './ExpenseModal';

export const ExpenseList: React.FC = () => {
    const [expenses, setExpenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            const res = await axios.get('/api/expenses');
            setExpenses(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredExpenses = expenses.filter(exp =>
        exp.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.provider_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

    if (loading) return <div className="p-10 text-center">Cargando gastos...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white tracking-tight">Gastos</h2>
                    <p className="text-gray-500 dark:text-slate-400 mt-1">Controla los egresos de tu negocio</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition font-medium flex items-center gap-2 shadow-lg shadow-blue-600/20"
                >
                    <Plus size={20} /> Nuevo Gasto
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-card-dark p-6 rounded-2xl border border-gray-100 dark:border-border-dark shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="bg-red-50 dark:bg-red-500/10 p-3 rounded-xl text-red-600 dark:text-red-400">
                            <TrendingDown size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Gasto Total</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">RD$ {totalExpenses.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-card-dark shadow-sm border border-gray-200 dark:border-border-dark rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-border-dark bg-gray-50/30 dark:bg-background-dark/30 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por proveedor o concepto..."
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-background-dark border border-gray-200 dark:border-border-dark rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-background-dark/50 border-b border-gray-100 dark:border-border-dark">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Fecha</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Proveedor</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Concepto</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider text-right">Monto</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-border-dark">
                            {filteredExpenses.map((exp) => (
                                <tr key={exp.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-400">
                                        {new Date(exp.expense_date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                        {exp.provider_name || 'Gasto General'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-300">
                                        {exp.description}
                                        {exp.category && <span className="ml-2 px-2 py-0.5 bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-300 rounded text-[10px] uppercase font-bold">{exp.category}</span>}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-semibold text-gray-900 dark:text-white">RD$ {parseFloat(exp.amount).toLocaleString()}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${exp.status === 'paid' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                                            }`}>
                                            {exp.status === 'paid' ? 'Pagado' : 'Pendiente'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {filteredExpenses.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 dark:text-slate-500">
                                        No se encontraron gastos registrados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ExpenseModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchExpenses}
            />
        </div>
    );
};
