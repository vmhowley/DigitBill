import { Plus, Save, Trash2 } from 'lucide-react';
import React from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../api';
import { QuickClientModal } from './QuickClientModal';

interface InvoiceItem {
    product_id: number; // Simplified for now, would be a select in real app
    description: string;
    quantity: number;
    unit_price: number;
}

interface InvoiceFormData {
    client_id: number;
    items: InvoiceItem[];
    type_code: string;
    reference_ncf?: string;
}

export const InvoiceForm: React.FC = () => {
    const navigate = useNavigate();
    const [clients, setClients] = React.useState<Array<{ id: number, name: string }>>([]);
    const [products, setProducts] = React.useState<Array<{ id: number, sku: string, description: string, unit_price: string }>>([]);
    const [isElectronic, setIsElectronic] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isClientModalOpen, setIsClientModalOpen] = React.useState(false);

    const { register, control, handleSubmit, watch, setValue } = useForm<InvoiceFormData>({
        defaultValues: {
            client_id: 0, // Will be set after fetching
            items: [{ description: 'Servicio', quantity: 1, unit_price: 0, product_id: 0 }]
        }
    });

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const [clientsRes, productsRes, configRes] = await Promise.all([
                    api.get('/api/clients'),
                    api.get('/api/products'),
                    api.get('/api/settings/company')
                ]);
                setClients(clientsRes.data);
                setProducts(productsRes.data);
                setIsElectronic(configRes.data.electronic_invoicing);
            } catch (err) {
                console.error('Error fetching data', err);
            }
        };
        fetchData();
    }, []);

    const fetchClients = async () => {
        try {
            const res = await api.get('/api/clients');
            setClients(res.data);
        } catch (err) {
            console.error('Error refreshing clients', err);
        }
    };

    const { fields, append, remove } = useFieldArray({
        control,
        name: "items"
    });

    const onSubmit = async (data: InvoiceFormData, immediate: boolean = false) => {
        setIsSubmitting(true);
        try {
            const response = await api.post('/api/invoices', { ...data, immediate_issue: immediate });
            if (response.data.error) {
                toast.error(response.data.error);
            } else {
                toast.success(immediate ? 'Factura emitida correctamente' : 'Borrador guardado');
                navigate('/invoices');
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.error || 'Error al crear la factura');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Calculate totals for preview - Optimized with useMemo
    const items = watch('items');
    const { subtotal, tax, total } = React.useMemo(() => {
        const sub = items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unit_price || 0)), 0);
        const t = sub * 0.18;
        return { subtotal: sub, tax: t, total: sub + t };
    }, [items]);

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Nueva Factura</h2>
                <p className="text-gray-500 mt-1">Crea un nuevo comprobante fiscal</p>
            </div>

            <form onSubmit={handleSubmit((data) => onSubmit(data, false))} className="space-y-6">
                {/* Client & Type Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                        Datos Generales
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Cliente</label>
                            <div className="flex gap-2">
                                <select
                                    {...register('client_id', { valueAsNumber: true, required: 'Seleccione un cliente' })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none"
                                >
                                    <option value="">Seleccionar Cliente...</option>
                                    {clients.map(client => (
                                        <option key={client.id} value={client.id}>{client.name}</option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={() => setIsClientModalOpen(true)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center"
                                    title="Crear Nuevo Cliente"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo de Comprobante</label>
                            <select
                                {...register('type_code')}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none"
                            >
                                <option value="31">Factura Crédito Fiscal (31)</option>
                                <option value="32">Factura de Consumo (32)</option>
                                <option value="33">Nota de Crédito (33)</option>
                                <option value="34">Nota de Débito (34)</option>
                                <option value="43">Gastos Menores (43)</option>
                                <option value="44">Regímenes Especiales (44)</option>
                                <option value="45">Gubernamental (45)</option>
                            </select>
                        </div>

                        {(watch('type_code') === '33' || watch('type_code') === '34') && (
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">NCF Afectado (Referencia)</label>
                                <input
                                    {...register('reference_ncf', { required: 'El NCF Afectado es requerido para notas' })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none"
                                    placeholder="e.g. E3100000001"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Items Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                            Detalle de Productos
                        </h3>
                        <button
                            type="button"
                            onClick={() => append({ description: '', quantity: 1, unit_price: 0, product_id: 0 })}
                            className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <Plus size={18} /> Agregar Item
                        </button>
                    </div>

                    <div className="space-y-3">
                        {fields.map((field, index) => (
                            <div key={field.id} className="group flex gap-4 items-start bg-gray-50/50 hover:bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-all">
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Producto / Servicio</label>
                                    <div className="space-y-2">
                                        <select
                                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm"
                                            onChange={(e) => {
                                                const prodId = parseInt(e.target.value);
                                                if (prodId) {
                                                    const product = products.find(p => p.id === prodId);
                                                    if (product) {
                                                        setValue(`items.${index}.product_id`, product.id);
                                                        setValue(`items.${index}.description`, product.description);
                                                        setValue(`items.${index}.unit_price`, parseFloat(product.unit_price));
                                                    }
                                                } else {
                                                    setValue(`items.${index}.product_id`, 0);
                                                }
                                            }}
                                        >
                                            <option value="">Seleccionar del catálogo (Opcional)...</option>
                                            {products.map(p => (
                                                <option key={p.id} value={p.id}>{p.sku ? `[${p.sku}] ` : ''}{p.description} - RD${p.unit_price}</option>
                                            ))}
                                        </select>
                                        <input
                                            {...register(`items.${index}.description`)}
                                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                                            placeholder="Descripción del producto"
                                        />
                                    </div>
                                </div>
                                <div className="w-28">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Cantidad</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                                    />
                                </div>
                                <div className="w-36">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Precio Unitario</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-gray-400 text-sm">$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            {...register(`items.${index}.unit_price`, { valueAsNumber: true })}
                                            className="w-full pl-7 pr-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="w-32">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Total</label>
                                    <div className="px-3 py-2 bg-gray-100 rounded-lg text-right font-medium text-gray-700">
                                        {((items[index]?.quantity || 0) * (items[index]?.unit_price || 0)).toFixed(2)}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    className="mt-6 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Totals Section */}
                <div className="flex justify-end">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 w-full max-w-sm">
                        <div className="space-y-3">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span className="font-medium">RD$ {subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>ITBIS (18%)</span>
                                <span className="font-medium">RD$ {tax.toFixed(2)}</span>
                            </div>
                            <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                                <span className="text-lg font-bold text-gray-800">Total</span>
                                <span className="text-xl font-bold text-blue-600">RD$ {total.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                type="button"
                                onClick={() => handleSubmit((data) => onSubmit(data, false))()}
                                disabled={isSubmitting}
                                className="flex-1 bg-white border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-all disabled:opacity-50"
                            >
                                <Save size={20} /> Borrador
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSubmit((data) => onSubmit(data, true))()}
                                disabled={isSubmitting}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                            >
                                <Save size={20} /> {isElectronic ? 'Emitir y Firmar' : 'Emitir Factura'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>

            <QuickClientModal 
                isOpen={isClientModalOpen}
                onClose={() => setIsClientModalOpen(false)}
                onSuccess={async (newClientId) => {
                    await fetchClients();
                    setValue('client_id', newClientId);
                }}
            />
        </div>
    );
};
