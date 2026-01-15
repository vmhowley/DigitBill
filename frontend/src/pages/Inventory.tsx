import { ArrowDownCircle, ArrowUpCircle, History, Package } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import axios from '../api';

export const InventoryPage: React.FC = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [movements, setMovements] = useState<any[]>([]);
    const [adjustmentAmount, setAdjustmentAmount] = useState(0);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await axios.get('/api/products');
            setProducts(res.data.filter((p: any) => p.type === 'product'));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMovements = async (productId: number) => {
        try {
            const res = await axios.get(`/api/inventory/movements/${productId}`);
            setMovements(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSelectProduct = (product: any) => {
        setSelectedProduct(product);
        fetchMovements(product.id);
    };

    const handleAdjust = async (type: 'in' | 'out') => {
        if (!selectedProduct || adjustmentAmount <= 0) return;

        try {
            await axios.post('/api/inventory/adjust', {
                product_id: selectedProduct.id,
                type,
                quantity: adjustmentAmount,
                reason: 'Manual Adjustment'
            });
            toast.success('Inventario actualizado');
            setAdjustmentAmount(0);
            fetchProducts();
            fetchMovements(selectedProduct.id);
        } catch (err) {
            toast.error('Error al actualizar inventario');
        }
    };

    if (loading) return <div className="p-10 text-center">Cargando inventario...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white tracking-tight">Inventario</h2>
                    <p className="text-gray-500 dark:text-slate-400 mt-1">Control de existencias y movimientos de almacén</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 bg-white dark:bg-card-dark border border-gray-200 dark:border-border-dark rounded-2xl shadow-sm overflow-hidden h-[calc(100vh-250px)] flex flex-col">
                    <div className="p-4 border-b border-gray-100 dark:border-border-dark bg-gray-50/50 dark:bg-background-dark/50 font-semibold text-gray-700 dark:text-slate-300">Productos</div>
                    <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-border-dark">
                        {products.map(p => (
                            <button
                                key={p.id}
                                onClick={() => handleSelectProduct(p)}
                                className={`w-full p-4 text-left hover:bg-blue-50/50 dark:hover:bg-blue-500/10 transition-colors flex justify-between items-center ${selectedProduct?.id === p.id ? 'bg-blue-50 dark:bg-blue-500/10 border-r-4 border-blue-500 dark:border-blue-500' : ''}`}
                            >
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">{p.description}</p>
                                    <p className="text-xs text-gray-500 dark:text-slate-400 font-mono">{p.sku}</p>
                                </div>
                                <div className={`px-2 py-1 rounded text-xs font-bold ${parseFloat(p.stock_quantity) < 5 ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'}`}>
                                    {parseFloat(p.stock_quantity)}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="md:col-span-2 space-y-6 overflow-y-auto h-[calc(100vh-250px)] pr-2">
                    {selectedProduct ? (
                        <>
                            <div className="bg-white dark:bg-card-dark p-6 rounded-2xl border border-gray-200 dark:border-border-dark shadow-sm">
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Ajustar Existencia: {selectedProduct.description}</h3>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Cantidad</label>
                                        <input
                                            type="number"
                                            value={adjustmentAmount}
                                            onChange={(e) => setAdjustmentAmount(parseFloat(e.target.value))}
                                            className="w-full px-4 py-2 border border-gray-200 dark:border-border-dark bg-white dark:bg-background-dark text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="flex gap-2 pt-6">
                                        <button
                                            onClick={() => handleAdjust('in')}
                                            className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 flex items-center gap-2 transition-all shadow-lg shadow-green-600/20"
                                        >
                                            <ArrowUpCircle size={18} /> Entrada
                                        </button>
                                        <button
                                            onClick={() => handleAdjust('out')}
                                            className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 flex items-center gap-2 transition-all shadow-lg shadow-red-600/20"
                                        >
                                            <ArrowDownCircle size={18} /> Salida
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-card-dark border border-gray-200 dark:border-border-dark rounded-2xl shadow-sm overflow-hidden overflow-x-auto">
                                <div className="p-4 border-b border-gray-100 dark:border-border-dark bg-gray-50/50 dark:bg-background-dark/50 flex items-center gap-2 font-semibold text-gray-700 dark:text-slate-300">
                                    <History size={18} /> Historial de Movimientos
                                </div>
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-50/30 dark:bg-background-dark/30 border-b border-gray-100 dark:border-border-dark">
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Fecha</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Tipo</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Cant.</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Motivo</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-border-dark">
                                        {movements.map(m => (
                                            <tr key={m.id}>
                                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-400">
                                                    {new Date(m.created_at).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${m.type === 'in' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'}`}>
                                                        {m.type === 'in' ? 'Entrada' : 'Salida'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                                                    {m.quantity}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">
                                                    {m.reason}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-slate-500 bg-gray-50/50 dark:bg-background-dark/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-border-dark p-12 text-center">
                            <Package size={64} className="mb-4 opacity-20" />
                            <p className="text-lg font-medium">Selecciona un producto</p>
                            <p className="max-w-xs text-sm mt-1">Podrás ver el historial de movimientos y realizar ajustes manuales de stock.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
