
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../../api';

export const WorkshopList = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewModal, setShowNewModal] = useState(false);
    const [vehicles, setVehicles] = useState<any[]>([]);

    const { register, handleSubmit, reset } = useForm();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const res = await axios.get('/api/automotive/workshop/orders');
            setOrders(res.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error('Error cargando órdenes');
            setLoading(false);
        }
    };

    const loadVehicles = async () => {
        const res = await axios.get('/api/automotive/vehicles');
        setVehicles(res.data);
    };

    const openNewModal = () => {
        loadVehicles();
        setShowNewModal(true);
    };

    const onSubmitNew = async (data: any) => {
        try {
            const res = await axios.post('/api/automotive/workshop/orders', data);
            toast.success('Orden creada');
            setShowNewModal(false);
            reset();
            navigate(`/automotive/workshop/${res.data.id}`);
        } catch (error) {
            toast.error('Error creando orden');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'in_progress': return 'bg-blue-100 text-blue-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'completed': return 'Completado';
            case 'in_progress': return 'En Progreso';
            default: return 'Pendiente';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Taller / Reacondicionamiento</h1>
                    <p className="text-gray-500">Gestiona reparaciones y mejoras al inventario</p>
                </div>
                <button
                    onClick={openNewModal}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                    <Plus size={20} />
                    Nueva Orden
                </button>
            </div>

            {/* List */}
            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Mobile View */}
                <div className="md:hidden divide-y divide-gray-100">
                    {loading ? (
                        <div className="text-center py-8">Cargando...</div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">No hay órdenes activas</div>
                    ) : (
                        orders.map((order) => (
                            <div key={order.id} className="p-4 flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-bold text-gray-900">
                                            {order.make} {order.model} {order.year}
                                        </div>
                                        <div className="text-xs text-gray-500 font-mono">VIN: {order.vin.slice(-6)}</div>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                                        {getStatusLabel(order.status)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="text-sm text-gray-500 italic">
                                        {new Date(order.created_at).toLocaleDateString()} • {order.item_count} items
                                    </div>
                                    <div className="font-bold text-gray-900">
                                        RD$ {parseFloat(order.total_cost).toLocaleString()}
                                    </div>
                                </div>
                                <Link
                                    to={`/automotive/workshop/${order.id}`}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium border-t border-gray-50 pt-2 text-center"
                                >
                                    Ver Detalles
                                </Link>
                            </div>
                        ))
                    )}
                </div>

                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-700">Vehículo</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Fecha Inicio</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Estado</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Items</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 text-right">Total Costo</th>
                                <th className="px-6 py-4 font-semibold text-gray-700"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-8">Cargando...</td></tr>
                            ) : orders.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-8 text-gray-500">No hay órdenes activas</td></tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">
                                                {order.make} {order.model} {order.year}
                                            </div>
                                            <div className="text-xs text-gray-500 font-mono">VIN: {order.vin.slice(-6)}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                                                {getStatusLabel(order.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {order.item_count} items
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-gray-900">
                                            RD$ {parseFloat(order.total_cost).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                to={`/automotive/workshop/${order.id}`}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                            >
                                                Ver Detalles
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* New Modal */}
            {showNewModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Nueva Orden de Trabajo</h2>
                        <form onSubmit={handleSubmit(onSubmitNew)} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Vehículo</label>
                                <select {...register('vehicle_id')} className="w-full border p-2 rounded-lg">
                                    {vehicles.map(v => (
                                        <option key={v.id} value={v.id}>{v.make} {v.model} - {v.vin}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notas Iniciales</label>
                                <textarea {...register('notes')} className="w-full border p-2 rounded-lg" rows={3} placeholder="Descripción del problema..." />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setShowNewModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Crear Orden</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
