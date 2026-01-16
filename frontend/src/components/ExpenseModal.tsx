import { Save, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import axios from '../api';

interface ExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { register, handleSubmit, reset } = useForm();
    const [providers, setProviders] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchProviders();
        }
    }, [isOpen]);

    const fetchProviders = async () => {
        try {
            const res = await axios.get('/api/expenses/providers');
            setProviders(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const onSubmit = async (data: any) => {
        setLoading(true);
        try {
            await axios.post('/api/expenses', data);
            toast.success('Gasto registrado');
            reset();
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error('Error al registrar gasto');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-card-dark rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-100 dark:border-border-dark">
                <div className="p-6 border-b border-gray-100 dark:border-border-dark flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Registrar Gasto</h3>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-all">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                    <div className="grid grid-cols-1 gap-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">Proveedor (Opcional)</label>
                            <div className="flex gap-2">
                                <select
                                    {...register('provider_id')}
                                    className="flex-1 px-4 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-border-dark rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                                >
                                    <option value="">Seleccionar Proveedor</option>
                                    {providers.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">Concepto / Descripción</label>
                            <input
                                {...register('description', { required: true })}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-border-dark rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                                placeholder="Ej: Pago de Alquiler, Compra de Mercancía..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">Monto (RD$)</label>
                                <input
                                    type="number" step="0.01"
                                    {...register('amount', { required: true })}
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-border-dark rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">Categoría</label>
                                <select
                                    {...register('category')}
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-border-dark rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                                >
                                    <option value="Servicios">Servicios</option>
                                    <option value="Alquiler">Alquiler</option>
                                    <option value="Sueldos">Sueldos</option>
                                    <option value="Mantenimiento">Mantenimiento</option>
                                    <option value="Mercancía">Mercancía</option>
                                    <option value="Publicidad">Publicidad</option>
                                    <option value="Otros">Otros</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">Fecha</label>
                                <input
                                    type="date"
                                    {...register('expense_date')}
                                    defaultValue={new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-border-dark rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">Estado</label>
                                <select
                                    {...register('status')}
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-border-dark rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                                >
                                    <option value="paid">Pagado</option>
                                    <option value="pending">Pendiente (Por Pagar)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button" onClick={onClose}
                            className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 font-semibold transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit" disabled={loading}
                            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <Save size={18} /> {loading ? 'Guardando...' : 'Guardar Gasto'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
