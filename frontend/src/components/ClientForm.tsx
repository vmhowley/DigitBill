import { ArrowLeft, Save } from 'lucide-react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
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

export const ClientForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<ClientFormData>({
        defaultValues: {
            type: 'juridico'
        }
    });

    useEffect(() => {
        if (isEditMode) {
            fetchClient();
        }
    }, [id]);

    const fetchClient = async () => {
        try {
            const response = await api.get(`/api/clients/${id}`);
            const client = response.data;
            setValue('name', client.name);
            setValue('rnc_ci', client.rnc_ci);
            setValue('address', client.address);
            setValue('email', client.email);
            setValue('phone', client.phone);
            setValue('type', client.type);
        } catch (error) {
            console.error('Error fetching client:', error);
            toast.error('Error al cargar los datos del cliente');
            navigate('/clients');
        }
    };

    const onSubmit = async (data: ClientFormData) => {
        try {
            if (isEditMode) {
                await api.put(`/api/clients/${id}`, data);
            } else {
                await api.post('/api/clients', data);
            }
            toast.success(isEditMode ? 'Cliente actualizado' : 'Cliente creado');
            navigate('/clients');
        } catch (error: any) {
            console.error('Error saving client:', error);
            toast.error(error.response?.data?.error || 'Error al guardar el cliente');
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <Link to="/clients" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors">
                    <ArrowLeft size={16} className="mr-1" /> Volver a la lista
                </Link>
                <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
                    {isEditMode ? 'Editar Cliente' : 'Nuevo Cliente'}
                </h2>
                <p className="text-gray-500 mt-1">
                    {isEditMode ? 'Actualiza la información del cliente' : 'Registra un nuevo cliente en el sistema'}
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre o Razón Social</label>
                        <input
                            {...register('name', { required: 'El nombre es obligatorio' })}
                            className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none ${errors.name ? 'border-red-300' : 'border-gray-200'}`}
                            placeholder="Ej: Empresa SRL"
                        />
                        {errors.name && <span className="text-xs text-red-500 mt-1">{errors.name.message}</span>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">RNC / Cédula</label>
                        <input
                            {...register('rnc_ci', { required: 'El RNC/Cédula es obligatorio' })}
                            className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none ${errors.rnc_ci ? 'border-red-300' : 'border-gray-200'}`}
                            placeholder="Ej: 101010101"
                        />
                        {errors.rnc_ci && <span className="text-xs text-red-500 mt-1">{errors.rnc_ci.message}</span>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo de Persona</label>
                        <select
                            {...register('type')}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none"
                        >
                            <option value="juridico">Jurídico</option>
                            <option value="fisico">Físico</option>
                        </select>
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

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                        <input
                            type="email"
                            {...register('email')}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none"
                            placeholder="correo@ejemplo.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Teléfono</label>
                        <input
                            {...register('phone')}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none"
                            placeholder="(809) 000-0000"
                        />
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Save size={20} />
                        {isEditMode ? 'Actualizar Cliente' : 'Guardar Cliente'}
                    </button>
                </div>
            </form>
        </div>
    );
};
