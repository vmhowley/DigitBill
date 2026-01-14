
import { ArrowLeft, CheckCircle, Package, Plus, Wrench } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Link, useParams } from 'react-router-dom';
import axios from '../../api';

export const WorkOrderDetail = () => {
    const { id } = useParams();
    const [order, setOrder] = useState<any>(null);
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Form for new item
    const { register, handleSubmit, reset } = useForm();

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            const res = await axios.get(`/api/automotive/workshop/orders/${id}`);
            setOrder(res.data);
            setItems(res.data.items || []);
            setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error('Error cargando orden');
        }
    };

    const onSubmitItem = async (data: any) => {
        try {
            const payload = {
                ...data,
                quantity: parseFloat(data.quantity),
                unit_cost: parseFloat(data.unit_cost)
            };
            const res = await axios.post(`/api/automotive/workshop/orders/${id}/items`, payload);
            toast.success('Item agregado');
            reset();
            loadData(); // Refresh totals
        } catch (error) {
            toast.error('Error agregando item');
        }
    };

    const handleComplete = async () => {
        if (!confirm('¿Estás seguro de cerrar esta orden? Los costos se sumarán al vehículo.')) return;
        try {
            await axios.post(`/api/automotive/workshop/orders/${id}/complete`);
            toast.success('Orden completada');
            loadData();
        } catch (error) {
            toast.error('Error completando orden');
        }
    };

    if (loading) return <div>Cargando...</div>;
    if (!order) return <div>Orden no encontrada</div>;

    const isCompleted = order.status === 'completed';

    return (
        <div className="max-w-5xl mx-auto pb-12">
            <div className="flex items-center gap-4 mb-6">
                <Link to="/automotive" className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        Orden #{order.id}
                        {isCompleted && <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">Completada</span>}
                    </h1>
                    <p className="text-gray-500">{order.make} {order.model} {order.year} - {order.vin}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left: Items List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="p-4 bg-gray-50 border-b border-gray-100 font-semibold text-gray-700 flex justify-between">
                            <span>Materiales y Mano de Obra</span>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {items.map((item, idx) => (
                                <div key={idx} className="p-4 flex justify-between items-center hover:bg-gray-50">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${item.type === 'part' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                                            {item.type === 'part' ? <Package size={18} /> : <Wrench size={18} />}
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">{item.description}</div>
                                            <div className="text-sm text-gray-500">
                                                {item.quantity} x RD$ {parseFloat(item.unit_cost).toLocaleString()}
                                                {item.vendor && <span className="ml-2 text-xs bg-gray-100 px-1 rounded">{item.vendor}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="font-bold text-gray-900">
                                        RD$ {parseFloat(item.total_cost).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                            {items.length === 0 && (
                                <div className="p-8 text-center text-gray-400">No hay gastos registrados</div>
                            )}
                        </div>
                    </div>

                    {/* Add Item Form */}
                    {!isCompleted && (
                        <form onSubmit={handleSubmit(onSubmitItem)} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="font-bold text-gray-800 mb-4">Agregar Gasto</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="md:col-span-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Descripción</label>
                                    <input {...register('description', { required: true })} className="w-full border p-2 rounded bg-gray-50" placeholder="Ej. Cambio de Aceite" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Tipo</label>
                                    <select {...register('type')} className="w-full border p-2 rounded bg-gray-50">
                                        <option value="part">Repuesto (Pieza)</option>
                                        <option value="labor">Mano de Obra</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Proveedor</label>
                                    <input {...register('vendor')} className="w-full border p-2 rounded bg-gray-50" placeholder="Opcional" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Costo Unit.</label>
                                    <input type="number" step="0.01" {...register('unit_cost', { required: true })} className="w-full border p-2 rounded bg-gray-50" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Cantidad</label>
                                    <input type="number" step="0.1" defaultValue="1" {...register('quantity', { required: true })} className="w-full border p-2 rounded bg-gray-50" />
                                </div>
                                <div className="flex items-end md:col-span-2">
                                    <button type="submit" className="w-full bg-gray-900 text-white py-2 rounded-lg hover:bg-black flex justify-center items-center gap-2">
                                        <Plus size={16} /> Agregar
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}
                </div>

                {/* Right: Summary */}
                <div className="col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4">Resumen de Costos</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Repuestos</span>
                                <span className="font-medium">RD$ {parseFloat(order.total_parts || '0').toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Mano de Obra</span>
                                <span className="font-medium">RD$ {parseFloat(order.total_labor || '0').toLocaleString()}</span>
                            </div>
                            <div className="border-t border-gray-100 my-2"></div>
                            <div className="flex justify-between font-bold text-lg text-gray-900">
                                <span>Total</span>
                                <span>RD$ {parseFloat(order.total_cost || '0').toLocaleString()}</span>
                            </div>
                        </div>

                        {!isCompleted && (
                            <button
                                onClick={handleComplete}
                                className="w-full mt-6 bg-green-600 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-green-700 shadow-lg hover:shadow-xl transition-all"
                            >
                                <CheckCircle size={20} />
                                Finalizar Orden
                            </button>
                        )}
                    </div>

                    <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-800">
                        <p className="font-semibold mb-1">Nota:</p>
                        <p>Al finalizar esta orden, el costo total (RD$ {parseFloat(order.total_cost || '0').toLocaleString()}) se sumará al costo base del vehículo para calcular la utilidad real al momento de la venta.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
