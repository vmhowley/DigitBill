import { Edit, Package, Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import api from '../api';

interface Product {
    id: number;
    sku: string;
    description: string;
    unit_price: string;
    tax_rate: string;
    unit: string;
    type?: 'product' | 'service';
    stock?: number;
    category?: string;
}

export const ProductList: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await api.get('/api/products');
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
            try {
                await api.delete(`/api/products/${id}`);
                toast.success('Producto eliminado');
                fetchProducts();
            } catch (error: any) {
                console.error('Error deleting product:', error);
                toast.error(error.response?.data?.error || 'No se puede eliminar el producto porque está en uso o ocurrió un error.');
            }
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Cargando productos...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Productos y Servicios</h2>
                    <p className="text-gray-500 mt-1">Gestiona tu catálogo de items facturables</p>
                </div>
                <Link
                    to="/products/new"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                    <Plus size={20} /> Nuevo Producto
                </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">SKU / Tipo</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Descripción</th>
                                <th className="text-center py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Existencia</th>
                                <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Precio Unitario</th>
                                <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">ITBIS</th>
                                <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-gray-500">
                                        No hay productos registrados.
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${product.type === 'service' ? 'bg-purple-50 text-purple-600' : 'bg-orange-50 text-orange-600'}`}>
                                                    <Package size={20} />
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-700 block">{product.sku || '-'}</span>
                                                    <span className="text-xs text-gray-500 uppercase">{product.type === 'service' ? 'Servicio' : 'Producto'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="font-medium text-gray-900">{product.description}</div>
                                            <div className="text-xs text-gray-500">{product.category || 'General'} • {product.unit || 'Unidad'}</div>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            {product.type === 'product' ? (
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${(parseFloat(product.stock as any) || 0) <= 5 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                                    }`}>
                                                    {parseFloat(product.stock_quantity as any) || 0}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-right font-medium text-gray-900">
                                            RD$ {parseFloat(product.unit_price).toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="py-4 px-6 text-right text-gray-600">
                                            {parseFloat(product.tax_rate).toFixed(0)}%
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    to={`/products/edit/${product.id}`}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                >
                                                    <Edit size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
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
