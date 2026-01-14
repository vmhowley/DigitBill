import { ArrowLeft, Save } from 'lucide-react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api';

interface ProductFormData {
    sku: string;
    description: string;
    unit_price: number;
    tax_rate: number;
    unit: string;
    type: 'product' | 'service';
    cost: number;
    stock_quantity: number;
    category: string;
}

export const ProductForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProductFormData>({
        defaultValues: {
            tax_rate: 18,
            unit: 'Unidad',
            type: 'product',
            stock_quantity: 0,
            cost: 0
        }
    });

    const watchType = watch('type');

    useEffect(() => {
        if (isEditMode) {
            fetchProduct();
        }
    }, [id]);

    const fetchProduct = async () => {
        try {
            const response = await api.get(`/api/products/${id}`);
            const product = response.data;
            setValue('sku', product.sku);
            setValue('description', product.description);
            setValue('unit_price', parseFloat(product.unit_price));
            setValue('tax_rate', parseFloat(product.tax_rate));
            setValue('unit', product.unit);
            setValue('type', product.type || 'product');
            setValue('cost', parseFloat(product.cost || 0));
            setValue('stock_quantity', parseInt(product.stock_quantity || 0));
            setValue('category', product.category || '');
        } catch (error) {
            console.error('Error fetching product:', error);
            toast.error('Error al cargar los datos del producto');
            navigate('/products');
        }
    };

    const onSubmit = async (data: ProductFormData) => {
        try {
            if (isEditMode) {
                await api.put(`/api/products/${id}`, data);
            } else {
                await api.post('/api/products', data);
            }
            toast.success(isEditMode ? 'Producto actualizado' : 'Producto creado');
            navigate('/products');
        } catch (error: any) {
            console.error('Error saving product:', error);
            toast.error(error.response?.data?.error || 'Error al guardar el producto');
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <Link to="/products" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 mb-4 transition-colors">
                    <ArrowLeft size={16} className="mr-1" /> Volver a la lista
                </Link>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white tracking-tight">
                    {isEditMode ? 'Editar Producto' : 'Nuevo Producto'}
                </h2>
                <p className="text-gray-500 dark:text-slate-400 mt-1">
                    {isEditMode ? 'Actualiza la información del producto' : 'Registra un nuevo item en el catálogo'}
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-card-dark p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-border-dark space-y-6">

                {/* Product Type Selection */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Tipo de Item</label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                value="product"
                                {...register('type')}
                                className="w-4 h-4 text-primary"
                            />
                            <span className="text-slate-700 dark:text-slate-300">Producto</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                value="service"
                                {...register('type')}
                                className="w-4 h-4 text-primary"
                            />
                            <span className="text-slate-700 dark:text-slate-300">Servicio</span>
                        </label>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Descripción</label>
                        <input
                            {...register('description', { required: 'La descripción es obligatoria' })}
                            className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-background-dark border rounded-xl focus:bg-white dark:focus:bg-card-dark focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none dark:text-white ${errors.description ? 'border-red-300 dark:border-red-500/50' : 'border-slate-200 dark:border-border-dark'}`}
                            placeholder="Ej: Consultoría de Software"
                        />
                        {errors.description && <span className="text-xs text-red-500 mt-1">{errors.description?.message}</span>}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">SKU / Código (Opcional)</label>
                        <input
                            {...register('sku')}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl focus:bg-white dark:focus:bg-card-dark focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none dark:text-white"
                            placeholder="Ej: SERV-001"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Categoría</label>
                        <select
                            {...register('category')}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl focus:bg-white dark:focus:bg-card-dark focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none dark:text-white"
                        >
                            <option value="">Seleccionar Categoría</option>
                            <option value="General">General</option>
                            <option value="Hardware">Hardware</option>
                            <option value="Software">Software</option>
                            <option value="Servicios">Servicios</option>
                            <option value="Insumos">Insumos</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Unidad de Medida</label>
                        <select
                            {...register('unit')}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl focus:bg-white dark:focus:bg-card-dark focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none dark:text-white"
                        >
                            <option value="Unidad">Unidad</option>
                            <option value="Servicio">Servicio</option>
                            <option value="Hora">Hora</option>
                            <option value="Libra">Libra</option>
                            <option value="Kilo">Kilo</option>
                            <option value="Caja">Caja</option>
                            <option value="Paquete">Paquete</option>
                        </select>
                    </div>

                    <div>
                        {/* Empty column to align grid if needed, or use for Price */}
                    </div>

                    <div className="border-t border-gray-100 dark:border-border-dark col-span-2 pt-4 mt-2">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Detalles de Precio e Inventario</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Costo (RD$)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-slate-400 dark:text-slate-500 text-sm">$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        {...register('cost', { min: 0 })}
                                        className="w-full pl-7 pr-4 py-2.5 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl focus:bg-white dark:focus:bg-card-dark focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none dark:text-white"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Precio Venta (RD$)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-slate-400 dark:text-slate-500 text-sm">$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        {...register('unit_price', { required: 'El precio es obligatorio', min: 0 })}
                                        className="w-full pl-7 pr-4 py-2.5 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl focus:bg-white dark:focus:bg-card-dark focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none dark:text-white"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">ITBIS (%)</label>
                                <input
                                    type="number"
                                    step="1"
                                    {...register('tax_rate', { required: true, min: 0, max: 100 })}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl focus:bg-white dark:focus:bg-card-dark focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none dark:text-white"
                                />
                            </div>

                            {watchType === 'product' && (
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Existencia (Stock)</label>
                                    <input
                                        type="number"
                                        step="1"
                                        {...register('stock_quantity', { min: 0 })}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl focus:bg-white dark:focus:bg-card-dark focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none dark:text-white"
                                        placeholder="0"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-border-dark flex justify-end">
                    <button
                        type="submit"
                        className="bg-primary hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Save size={20} />
                        {isEditMode ? 'Actualizar Producto' : 'Guardar Producto'}
                    </button>
                </div>
            </form>
        </div>
    );
};

