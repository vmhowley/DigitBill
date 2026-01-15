import { Edit, FileText, Plus, Trash2, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import api from '../api';

interface Client {
    id: number;
    name: string;
    rnc_ci: string;
    address: string;
    email: string;
    phone: string;
    type: 'juridico' | 'fisico';
}

export const ClientList: React.FC = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const response = await api.get('/api/clients');
            setClients(response.data);
        } catch (error) {
            console.error('Error fetching clients:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
            try {
                await api.delete(`/api/clients/${id}`);
                toast.success('Cliente eliminado');
                fetchClients();
            } catch (error: any) {
                console.error('Error deleting client:', error);
                toast.error(error.response?.data?.error || 'No se puede eliminar el cliente porque tiene facturas asociadas o ocurrió un error.');
            }
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Cargando clientes...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white tracking-tight">Clientes</h2>
                    <p className="text-gray-500 dark:text-slate-400 mt-1">Gestiona tu base de datos de clientes</p>
                </div>
                <Link
                    to="/clients/new"
                    className="bg-primary text-white font-medium py-2.5 px-5 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                    <Plus size={20} /> Nuevo Cliente
                </Link>
            </div>

            <div className="bg-white dark:bg-card-dark rounded-2xl shadow-sm border border-slate-200 dark:border-border-dark overflow-hidden">
                {/* Mobile View */}
                <div className="md:hidden divide-y divide-slate-100 dark:divide-border-dark">
                    {clients.length === 0 ? (
                        <div className="py-8 text-center text-slate-500 dark:text-slate-400">
                            No hay clientes registrados.
                        </div>
                    ) : (
                        clients.map((client) => (
                            <div key={client.id} className="p-4 flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-primary dark:text-blue-400">
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900 dark:text-white line-clamp-1">{client.name}</div>
                                            <div className="text-xs text-slate-500 font-mono">{client.rnc_ci}</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <Link
                                            to={`/clients/${client.id}/statement`}
                                            className="p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                                            title="Estado de Cuenta"
                                        >
                                            <FileText size={18} />
                                        </Link>
                                        <Link
                                            to={`/clients/edit/${client.id}`}
                                            className="p-2 text-slate-400 hover:text-primary dark:hover:text-blue-400"
                                        >
                                            <Edit size={18} />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(client.id)}
                                            className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <span className="font-medium">Contacto:</span>
                                        <span>{client.email || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <span className="font-medium">Tel:</span>
                                        <span>{client.phone || 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg mt-1">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${client.type === 'juridico'
                                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300'
                                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                                        }`}>
                                        {client.type === 'juridico' ? 'Jurídico' : 'Físico'}
                                    </span>
                                    <span className="text-xs text-slate-400 truncate max-w-[150px]">{client.address || 'Sin dirección'}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-background-dark/30 border-b border-slate-100 dark:border-border-dark">
                                <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre / Razón Social</th>
                                <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">RNC / Cédula</th>
                                <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Contacto</th>
                                <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo</th>
                                <th className="text-right py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-border-dark">
                            {clients.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-slate-500 dark:text-slate-400">
                                        No hay clientes registrados.
                                    </td>
                                </tr>
                            ) : (
                                clients.map((client) => (
                                    <tr key={client.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-primary dark:text-blue-400">
                                                    <User size={20} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 dark:text-white">{client.name}</div>
                                                    <div className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-[200px]">{client.address || 'Sin dirección'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-700/50 text-slate-800 dark:text-slate-300">
                                                {client.rnc_ci}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="text-sm text-slate-900 dark:text-slate-200 font-medium">{client.email}</div>
                                            <div className="text-sm text-slate-500 dark:text-slate-400">{client.phone}</div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${client.type === 'juridico'
                                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300'
                                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                                                }`}>
                                                {client.type === 'juridico' ? 'Jurídico' : 'Físico'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    to={`/clients/${client.id}/statement`}
                                                    className="p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-all"
                                                    title="Estado de Cuenta"
                                                >
                                                    <FileText size={18} />
                                                </Link>
                                                <Link
                                                    to={`/clients/edit/${client.id}`}
                                                    className="p-2 text-slate-400 hover:text-primary dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-all"
                                                >
                                                    <Edit size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(client.id)}
                                                    className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
