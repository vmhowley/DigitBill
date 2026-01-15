import { Edit, Mail, Phone, Plus, Search, Trash2, Truck } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import axios from '../api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export const ProviderList: React.FC = () => {
    const [providers, setProviders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchProviders();
    }, []);

    const fetchProviders = async () => {
        try {
            const res = await axios.get('/api/expenses/providers');
            setProviders(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProvider = async (id: number) => {
        if (!window.confirm('¿Estás seguro de eliminar este proveedor?')) return;
        try {
            await axios.delete(`/api/expenses/providers/${id}`);
            toast.success('Proveedor eliminado');
            fetchProviders();
        } catch (err) {
            console.error(err);
            toast.error('Error al eliminar proveedor');
        }
    };

    const filteredProviders = providers.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.rnc?.includes(searchTerm)
    );

    if (loading) return <div className="p-10 text-center">Cargando proveedores...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white tracking-tight">Proveedores</h2>
                    <p className="text-gray-500 dark:text-slate-400 mt-1">Gestiona tus suministradores y acreedores</p>
                </div>
                <button
                    onClick={() => navigate('/providers/new')}
                    className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition font-medium flex items-center gap-2 shadow-lg shadow-blue-600/20"
                >
                    <Plus size={20} /> Nuevo Proveedor
                </button>
            </div>

            <div className="bg-white dark:bg-card-dark shadow-sm border border-gray-200 dark:border-border-dark rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-border-dark bg-gray-50/30 dark:bg-background-dark/30 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o RNC..."
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
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Proveedor</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">RNC</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Contacto</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-border-dark">
                            {filteredProviders.map((p) => (
                                <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-50 dark:bg-blue-500/10 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                                                <Truck size={18} />
                                            </div>
                                            <span className="font-medium text-gray-900 dark:text-white">{p.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-600 dark:text-slate-300 font-mono bg-gray-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-gray-100 dark:border-slate-700">
                                            {p.rnc || '---'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
                                                <Mail size={12} /> {p.email || '---'}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
                                                <Phone size={12} /> {p.phone || '---'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => navigate(`/providers/edit/${p.id}`)}
                                                className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-all"
                                                title="Editar"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProvider(p.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredProviders.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400 dark:text-slate-500">
                                        No se encontraron proveedores.
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
