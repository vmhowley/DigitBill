import { ArrowLeft, Save } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../api';

interface ProviderFormData {
    name: string;
    rnc: string;
    address: string;
    email: string;
    phone: string;
}

export const ProviderForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditMode = !!id;
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<ProviderFormData>();

    useEffect(() => {
        if (isEditMode) {
            fetchProvider();
        }
    }, [id]);

    const fetchProvider = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/api/expenses/providers/${id}`);
            const provider = response.data;
            if (provider) {
                setValue('name', provider.name);
                setValue('rnc', provider.rnc);
                setValue('address', provider.address);
                setValue('email', provider.email);
                setValue('phone', provider.phone);
            } else {
                toast.error('Proveedor no encontrado');
                navigate('/providers');
            }
        } catch (error) {
            console.error('Error fetching provider:', error);
            toast.error('Error al cargar los datos del proveedor');
            navigate('/providers');
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: ProviderFormData) => {
        try {
            if (isEditMode) {
                await api.put(`/api/expenses/providers/${id}`, data);
            } else {
                await api.post('/api/expenses/providers', data);
            }
            toast.success(isEditMode ? 'Proveedor actualizado' : 'Proveedor creado');
            navigate('/providers');
        } catch (error: any) {
            console.error('Error saving provider:', error);
            toast.error(error.response?.data?.error || 'Error al guardar el proveedor');
        }
    };

    if (loading) return <div className="p-10 text-center">Cargando...</div>;

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <Link to="/providers" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors">
                    <ArrowLeft size={16} className="mr-1" /> Volver a la lista
                </Link>
                <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
                    {isEditMode ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                </h2>
                <p className="text-gray-500 mt-1">
                    {isEditMode ? 'Actualiza la información del proveedor' : 'Registra un nuevo proveedor en el sistema'}
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre o Razón Social</label>
                        <input
                            {...register('name', { required: 'El nombre es obligatorio' })}
                            className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none ${errors.name ? 'border-red-300' : 'border-gray-200'}`}
                            placeholder="Ej: Proveedor S.A."
                        />
                        {errors.name && <span className="text-xs text-red-500 mt-1">{errors.name.message}</span>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">RNC / Cédula</label>
                        <input
                            {...register('rnc', { required: 'El RNC es obligatorio' })}
                            className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none ${errors.rnc ? 'border-red-300' : 'border-gray-200'}`}
                            placeholder="Ej: 101010101"
                        />
                        {errors.rnc && <span className="text-xs text-red-500 mt-1">{errors.rnc.message}</span>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Teléfono</label>
                        <input
                            {...register('phone')}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none"
                            placeholder="(809) 000-0000"
                        />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                        <input
                            type="email"
                            {...register('email')}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none"
                            placeholder="contacto@proveedor.com"
                        />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Dirección</label>
                        <textarea
                            {...register('address')}
                            rows={3}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none resize-none"
                            placeholder="Dirección completa"
                        />
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Save size={20} />
                        {isEditMode ? 'Actualizar Proveedor' : 'Guardar Proveedor'}
                    </button>
                </div>
            </form>
        </div>
    );
};
