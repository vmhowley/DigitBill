
import { ArrowLeft, DollarSign, Edit, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from '../../api';

export const VehicleDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [vehicle, setVehicle] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            const vRes = await axios.get(`/api/automotive/vehicles/${id}`);
            setVehicle(vRes.data);

            const hRes = await axios.get(`/api/automotive/workshop/vehicles/${id}/orders`);
            setHistory(hRes.data);

            setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error('Error cargando datos');
        }
    };

    const handleDelete = async () => {
        if (!confirm('¿Seguro que deseas eliminar este vehículo?')) return;
        try {
            await axios.delete(`/api/automotive/vehicles/${id}`);
            toast.success('Vehículo eliminado');
            navigate('/automotive/vehicles');
        } catch (error) {
            toast.error('Error eliminando vehículo');
        }
    };

    if (loading) return <div>Cargando...</div>;
    if (!vehicle) return <div>Vehículo no encontrado</div>;

    const totalReconditioning = history.reduce((acc, order) => acc + parseFloat(order.total_cost || 0), 0);

    return (
        <div className="max-w-5xl mx-auto pb-12">
            {/* Header */}
            <div className="mb-6">
                <Link to="/automotive/vehicles" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-4 transition-colors">
                    <ArrowLeft size={18} /> Volver al Inventario
                </Link>

                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-bold text-gray-900">{vehicle.make} {vehicle.model} {vehicle.year}</h1>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold 
                                ${vehicle.status === 'available' ? 'bg-green-100 text-green-700' :
                                    vehicle.status === 'sold' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                                {vehicle.status.toUpperCase()}
                            </span>
                        </div>
                        <div className="text-gray-500 font-mono text-sm flex gap-4">
                            <span>VIN: {vehicle.vin}</span>
                            {vehicle.plate && <span>Placa: {vehicle.plate}</span>}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Link to={`/automotive/vehicles/edit/${vehicle.id}`} className="p-2 border rounded-lg hover:bg-gray-50 text-gray-600">
                            <Edit size={20} />
                        </Link>
                        <button onClick={handleDelete} className="p-2 border rounded-lg hover:bg-red-50 text-red-600 border-red-200">
                            <Trash2 size={20} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Stats & Tabs */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Tabs */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="flex border-b border-gray-100">
                            <button
                                onClick={() => setActiveTab('general')}
                                className={`flex-1 py-4 text-sm font-medium text-center border-b-2 transition-colors ${activeTab === 'general' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                Información General
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`flex-1 py-4 text-sm font-medium text-center border-b-2 transition-colors ${activeTab === 'history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                Historial Taller ({history.length})
                            </button>
                        </div>

                        <div className="p-6">
                            {activeTab === 'general' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-xs text-gray-500 uppercase font-bold">Color</label>
                                            <p className="text-gray-900">{vehicle.color || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 uppercase font-bold">Versión / Trim</label>
                                            <p className="text-gray-900">{vehicle.trim || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 uppercase font-bold">Millaje</label>
                                            <p className="text-gray-900">{vehicle.mileage?.toLocaleString()} mi</p>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 uppercase font-bold">Condición</label>
                                            <p className="text-gray-900 capitalize">{vehicle.condition}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase font-bold">Notas</label>
                                        <p className="text-gray-700 mt-1 bg-gray-50 p-4 rounded-lg">{vehicle.description || 'Sin descripción.'}</p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'history' && (
                                <div className="space-y-4">
                                    {history.map(order => (
                                        <div key={order.id} className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50">
                                            <div>
                                                <div className="font-semibold text-gray-900">Orden #{order.id}</div>
                                                <div className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</div>
                                                <div className="text-xs text-gray-500 mt-1">{order.notes}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-gray-900">RD$ {parseFloat(order.total_cost).toLocaleString()}</div>
                                                <Link to={`/automotive/workshop/${order.id}`} className="text-sm text-blue-600 hover:underline">Ver Detalles</Link>
                                            </div>
                                        </div>
                                    ))}
                                    {history.length === 0 && <div className="text-center text-gray-500 py-4">No hay historial de taller disponible.</div>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Financials */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <DollarSign size={20} className="text-green-600" />
                            Finanzas
                        </h3>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 text-sm">Precio Venta</span>
                                <span className="text-2xl font-bold text-gray-900">RD$ {parseFloat(vehicle.price).toLocaleString()}</span>
                            </div>

                            <div className="border-t border-dashed my-2"></div>

                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Costo Adquisición</span>
                                <span className="font-medium">RD$ {(Number(vehicle.cost) - totalReconditioning).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Gasto Taller</span>
                                <span className="font-medium text-orange-600">+ RD$ {totalReconditioning.toLocaleString()}</span>
                            </div>

                            <div className="bg-gray-100 p-3 rounded-lg flex justify-between font-bold text-gray-800 mt-2">
                                <span>Costo Total</span>
                                <span>RD$ {parseFloat(vehicle.cost).toLocaleString()}</span>
                            </div>

                            <div className="pt-2 text-center text-xs text-gray-400">
                                Margen Estimado: <span className="text-green-600 font-bold">{((vehicle.price - vehicle.cost) / vehicle.price * 100).toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>

                    {vehicle.status === 'available' && (
                        <Link to="/automotive/sales/new" className="block w-full bg-blue-600 text-white text-center py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl">
                            Vender Ahora
                        </Link>
                    )}

                    <Link to="/automotive" className="block w-full bg-orange-50 text-orange-700 text-center py-3 rounded-xl font-bold hover:bg-orange-100 transition-colors border border-orange-100">
                        Enviar a Taller
                    </Link>
                </div>
            </div>
        </div>
    );
};
