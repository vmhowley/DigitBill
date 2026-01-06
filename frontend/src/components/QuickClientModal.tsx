import { Save, X } from 'lucide-react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import api from '../api';

interface ClientFormData {
    name: string;
    rnc_ci: string;
    address: string;
    email: string;
    phone: string;
    type: 'juridico' | 'fisico';
}

interface QuickClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (clientId: number) => void;
}

export const QuickClientModal: React.FC<QuickClientModalProps> = React.memo(({ isOpen, onClose, onSuccess }) => {
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ClientFormData>({
        defaultValues: {
            type: 'juridico'
        }
    });

    if (!isOpen) return null;

    const onSubmit = async (data: ClientFormData) => {
        try {
            const response = await api.post('/api/clients', data);
            toast.success('Cliente creado correctamente');
            reset();
            onSuccess(response.data.id);
            onClose();
        } catch (error: any) {
            console.error('Error saving client:', error);
            toast.error(error.response?.data?.error || 'Error al guardar el cliente');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-xl font-bold text-gray-800">Rápido: Nuevo Cliente</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre o Razón Social</label>
                            <input
                                {...register('name', { required: 'El nombre es obligatorio' })}
                                className={`w-full px-4 py-2 bg-gray-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none ${errors.name ? 'border-red-300' : 'border-gray-200'}`}
                                placeholder="Ej: Empresa SRL"
                            />
                            {errors.name && <span className="text-xs text-red-500 mt-0.5">{errors.name.message}</span>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">RNC / Cédula</label>
                            <input
                                {...register('rnc_ci', { required: 'El RNC/Cédula es obligatorio' })}
                                className={`w-full px-4 py-2 bg-gray-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none ${errors.rnc_ci ? 'border-red-300' : 'border-gray-200'}`}
                                placeholder="Ej: 101010101"
                            />
                            {errors.rnc_ci && <span className="text-xs text-red-500 mt-0.5">{errors.rnc_ci.message}</span>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                            <select
                                {...register('type')}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none"
                            >
                                <option value="juridico">Jurídico</option>
                                <option value="fisico">Físico</option>
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                            <input
                                {...register('address')}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none"
                                placeholder="Dirección completa"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                            <input
                                {...register('phone')}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none"
                                placeholder="(809) 000-0000"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50"
                        >
                            <Save size={18} />
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
});
