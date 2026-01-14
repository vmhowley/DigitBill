
import { Save, ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from '../../api';

export const VehicleForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (id) {
            loadVehicle(id);
        }
    }, [id]);

    const loadVehicle = async (vehicleId: string) => {
        try {
            const res = await axios.get(`/api/automotive/vehicles/${vehicleId}`);
            reset(res.data);
        } catch (error) {
            console.error(error);
            toast.error('Error cargando vehículo');
        }
    };

    const onSubmit = async (data: any) => {
        setLoading(true);
        try {
            if (id) {
                await axios.put(`/api/automotive/vehicles/${id}`, data);
                toast.success('Vehículo actualizado');
            } else {
                await axios.post('/api/automotive/vehicles', data);
                toast.success('Vehículo creado');
            }
            navigate('/automotive/vehicles');
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.error || 'Error al guardar');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto pb-12">
            <div className="flex items-center gap-4 mb-6">
                <Link to="/automotive/vehicles" className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{id ? 'Editar Vehículo' : 'Nuevo Vehículo'}</h1>
                    <p className="text-gray-500">Completa la información del vehículo</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                    <h3 className="font-bold text-lg text-gray-800 border-b border-gray-100 pb-2">Información Básica</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Marca *</label>
                            <input
                                {...register('make', { required: 'La marca es requerida' })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                placeholder="Ej. Toyota"
                            />
                            {errors.make && <p className="text-red-500 text-xs mt-1">{errors.make.message as string}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Modelo *</label>
                            <input
                                {...register('model', { required: 'El modelo es requerido' })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                placeholder="Ej. Corolla"
                            />
                            {errors.model && <p className="text-red-500 text-xs mt-1">{errors.model.message as string}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Año *</label>
                            <input
                                type="number"
                                {...register('year', { required: 'El año es requerido', min: 1900, max: 2030 })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                placeholder="Ej. 2022"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Versión / Trim</label>
                            <input
                                {...register('trim')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                placeholder="Ej. LE, Sport"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">VIN (Chasis) *</label>
                            <input
                                {...register('vin', { required: 'El VIN es requerido' })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono uppercase focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                placeholder="17 Caracteres"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Placa</label>
                            <input
                                {...register('plate')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono uppercase focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                placeholder="Ej. A123456"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                            <input
                                {...register('color')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                placeholder="Ej. Blanco Perla"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                    <h3 className="font-bold text-lg text-gray-800 border-b border-gray-100 pb-2">Estado y Precio</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Condición</label>
                            <select
                                {...register('condition')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            >
                                <option value="used">Usado</option>
                                <option value="new">Nuevo</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Estado Actual</label>
                            <select
                                {...register('status')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            >
                                <option value="available">Disponible</option>
                                <option value="reserved">Reservado</option>
                                <option value="maintenance">En Taller / Preparación</option>
                                <option value="sold">Vendido</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Millaje</label>
                            <input
                                type="number"
                                {...register('mileage')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Costo (Adquisición)</label>
                            <input
                                type="number"
                                step="0.01"
                                {...register('cost')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                placeholder="0.00"
                            />
                            {!id && (
                                <div className="mt-2 flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="register_expense"
                                        {...register('register_expense')}
                                        className="rounded text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor="register_expense" className="text-sm text-gray-600 select-none cursor-pointer">
                                        Registrar salida de dinero (Gasto)
                                    </label>
                                </div>
                            )}
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Precio de Venta *</label>
                            <input
                                type="number"
                                step="0.01"
                                {...register('price', { required: 'El precio es requerido' })}
                                className="w-full px-3 py-2 border border-blue-300 rounded-lg bg-blue-50 font-bold text-lg text-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                placeholder="0.00"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción / Notas</label>
                            <textarea
                                {...register('description')}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                placeholder="Detalles adicionales..."
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/automotive/vehicles')}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                        <Save size={20} />
                        Guardar Vehículo
                    </button>
                </div>
            </form>
        </div>
    );
};
