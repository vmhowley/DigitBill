import { Plus, Save, Send, Trash2 } from 'lucide-react';
import React from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { QuickClientModal } from './QuickClientModal';
import { SearchableSelect } from './SearchableSelect';

interface InvoiceItem {
    product_id: number; // Simplified for now, would be a select in real app
    description: string;
    quantity: number;
    unit_price: number;
    tax_rate: number;
}

interface InvoiceFormData {
    client_id: number;
    items: InvoiceItem[];
    type_code: string;
    reference_ncf?: string;
}

// Product data is now handled by SearchableSelect

export const InvoiceForm: React.FC = () => {
    const navigate = useNavigate();
    const [clients, setClients] = React.useState<Array<{ id: number, name: string }>>([]);
    const [products, setProducts] = React.useState<Array<{ id: number, sku: string, description: string, unit_price: string, tax_rate: number, stock_quantity: number, type: string }>>([]);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isClientModalOpen, setIsClientModalOpen] = React.useState(false);

    const { register, control, handleSubmit, watch, setValue } = useForm<InvoiceFormData>({
        defaultValues: {
            client_id: 0, // Will be set after fetching
            items: [{ description: 'Servicio', quantity: 1, unit_price: 0, product_id: 0, tax_rate: 18.00 }]
        }
    });

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const [clientsRes, productsRes] = await Promise.all([
                    api.get('/api/clients'),
                    api.get('/api/products'),
                ]);
                setClients(clientsRes.data);
                setProducts(productsRes.data);
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


    // Calculate totals for preview - Watch all item fields that affect calculation
    const items = watch('items');
    const { subtotal, tax, total } = React.useMemo(() => {
        if (!items || items.length === 0) {
            return { subtotal: 0, tax: 0, total: 0 };
        }
        const sub = items.reduce((sum, item) => {
            const qty = Number(item?.quantity) || 0;
            const price = Number(item?.unit_price) || 0;
            return sum + (qty * price);
        }, 0);
        const t = items.reduce((sum, item) => {
            const qty = Number(item?.quantity) || 0;
            const price = Number(item?.unit_price) || 0;
            const taxRate = Number(item?.tax_rate) || 0;
            return sum + ((qty * price) * taxRate / 100);
        }, 0);
        return { subtotal: sub, tax: t, total: sub + t };
    }, [JSON.stringify(items)]); // Use JSON.stringify to detect deep changes

    return (
        <div className="max-w-[1400px] mx-auto">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white tracking-tight">Nueva Factura</h2>
                <p className="text-gray-500 dark:text-slate-400 mt-1">Crea un nuevo comprobante fiscal</p>
            </div>

            <form onSubmit={handleSubmit((data) => onSubmit(data, false))} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Left Column: Form Inputs */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Client & Type Section */}
                    <div className="bg-white dark:bg-card-dark p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-border-dark">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                            <div className="w-1 h-6 bg-primary rounded-full"></div>
                            Datos Generales
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Cliente</label>
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <Controller
                                            control={control}
                                            name="client_id"
                                            rules={{ required: 'Seleccione un cliente' }}
                                            render={({ field }: { field: any }) => (
                                                <SearchableSelect
                                                    options={clients.map(c => ({ id: c.id, title: c.name, subtitle: c.id.toString() }))}
                                                    onSelect={(opt: any) => field.onChange(opt.id)}
                                                    selectedId={field.value}
                                                    placeholder="Seleccionar Cliente..."
                                                />
                                            )}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsClientModalOpen(true)}
                                        className="h-[46px] w-[46px] bg-primary hover:bg-blue-700 text-white rounded-xl transition-colors flex items-center justify-center shrink-0"
                                        title="Crear Nuevo Cliente"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Tipo de Comprobante</label>
                                <select
                                    {...register('type_code')}
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-border-dark dark:text-white rounded-xl focus:bg-white dark:focus:bg-card-dark focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
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
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">NCF Afectado (Referencia)</label>
                                    <input
                                        {...register('reference_ncf', { required: 'El NCF Afectado es requerido para notas' })}
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-border-dark dark:text-white rounded-xl focus:bg-white dark:focus:bg-card-dark focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                                        placeholder="e.g. E3100000001"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Items Section */}
                    <div className="bg-white dark:bg-card-dark p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-border-dark">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                                <div className="w-1 h-6 bg-primary rounded-full"></div>
                                Detalle de Productos
                            </h3>
                            <button
                                type="button"
                                onClick={() => append({ description: '', quantity: 1, unit_price: 0, product_id: 0, tax_rate: 18.00 })}
                                className="text-sm font-bold text-primary hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-500/10 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <Plus size={18} /> Agregar Item
                            </button>
                        </div>

                        <div className="space-y-3">
                            {/* Desktop Headers */}
                            <div className="hidden md:grid grid-cols-12 gap-4 px-4 mb-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                                <div className="col-span-5">Producto / Servicio</div>
                                <div className="col-span-1 text-center">Cant</div>
                                <div className="col-span-2">Precio</div>
                                <div className="col-span-1 text-center">Tax %</div>
                                <div className="col-span-2 text-right pr-4">Total</div>
                                <div className="col-span-1"></div>
                            </div>

                            {fields.map((field, index) => (
                                <div key={field.id} className="group relative grid grid-cols-12 gap-x-4 gap-y-4 items-start bg-slate-50/50 dark:bg-background-dark/30 hover:bg-slate-50 dark:hover:bg-background-dark/50 p-4 rounded-xl border border-slate-100 dark:border-border-dark hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                                    <div className="col-span-12 md:col-span-5">
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 md:hidden">Producto / Servicio</label>
                                        <div className="space-y-2">
                                            <SearchableSelect
                                                options={products.map(p => ({
                                                    id: p.id,
                                                    title: p.description,
                                                    subtitle: p.sku || 'Sin SKU',
                                                    extra: p.type === 'service' ? `RD$ ${p.unit_price}` : `RD$ ${p.unit_price} | Stock: ${p.stock_quantity}`
                                                }))}
                                                onSelect={(productOpt: any) => {
                                                    const product = products.find(p => p.id === productOpt.id);
                                                    if (product) {
                                                        setValue(`items.${index}.product_id`, product.id);
                                                        setValue(`items.${index}.description`, product.description);
                                                        setValue(`items.${index}.unit_price`, parseFloat(product.unit_price));
                                                        setValue(`items.${index}.tax_rate`, parseFloat(product.tax_rate as any) || 18.00);
                                                    }
                                                }}
                                                placeholder="Buscar producto..."
                                            />
                                            <input
                                                {...register(`items.${index}.description`)}
                                                className="w-full px-3 py-2 bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                                placeholder="Descripción detallada (opcional)"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-span-4 md:col-span-1">
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 md:hidden">Cant</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                                            className={`w-full px-3 py-2 bg-white dark:bg-card-dark border ${items[index]?.product_id &&
                                                products.find(p => p.id === items[index].product_id)?.type === 'product' &&
                                                (items[index]?.quantity || 0) > (products.find(p => p.id === items[index].product_id)?.stock_quantity || 0)
                                                ? 'border-rose-500 ring-1 ring-rose-500'
                                                : 'border-slate-200 dark:border-border-dark'
                                                } text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all`}
                                        />
                                        {items[index]?.product_id &&
                                            products.find(p => p.id === items[index].product_id)?.type === 'product' &&
                                            (items[index]?.quantity || 0) > (products.find(p => p.id === items[index].product_id)?.stock_quantity || 0) && (
                                                <p className="text-[10px] text-rose-500 font-bold mt-1 line-clamp-1">Stock insuficiente ({products.find(p => p.id === items[index].product_id)?.stock_quantity})</p>
                                            )}
                                    </div>
                                    <div className="col-span-4 md:col-span-2">
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 md:hidden">Precio Unitario</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2 text-slate-400 dark:text-slate-500 text-sm">$</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                {...register(`items.${index}.unit_price`, { valueAsNumber: true })}
                                                className="w-full pl-7 pr-3 py-2 bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-span-4 md:col-span-1">
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 md:hidden">Tax %</label>
                                        <input
                                            type="number"
                                            step="1"
                                            {...register(`items.${index}.tax_rate`, { valueAsNumber: true })}
                                            className="w-full px-2 py-2 bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-center"
                                        />
                                    </div>
                                    <div className="col-span-12 md:col-span-2">
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 md:hidden">Total</label>
                                        <div className="px-3 py-2 bg-slate-100 dark:bg-background-dark border border-transparent dark:border-border-dark rounded-lg text-right font-bold text-slate-700 dark:text-white">
                                            {((items[index]?.quantity || 0) * (items[index]?.unit_price || 0) * (1 + (items[index]?.tax_rate || 0) / 100)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                    <div className="col-span-12 md:col-span-1 flex items-center justify-center md:pt-1">
                                        <button
                                            type="button"
                                            onClick={() => remove(index)}
                                            className="w-full md:w-auto p-2 text-rose-500 bg-rose-50 dark:bg-rose-500/10 md:bg-transparent md:dark:bg-transparent md:text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 flex items-center justify-center gap-2"
                                            title="Eliminar Item"
                                        >
                                            <Trash2 size={18} /> <span className="md:hidden text-sm font-bold">Eliminar</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Calculations & Actions Summary */}
                <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-8">
                    <div className="bg-white dark:bg-card-dark p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-border-dark">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Resumen</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                <span>Subtotal</span>
                                <span className="font-bold">RD$ {subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                <span>ITBIS Total</span>
                                <span className="font-bold">RD$ {tax.toFixed(2)}</span>
                            </div>
                            <div className="pt-3 border-t border-slate-100 dark:border-border-dark flex justify-between items-center">
                                <span className="text-lg font-bold text-slate-800 dark:text-white">Total</span>
                                <span className="text-xl font-bold text-primary dark:text-blue-400">RD$ {total.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-border-dark">
                            <div className="grid grid-cols-2 gap-3 mb-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                                <div className="bg-slate-50 dark:bg-background-dark p-2 rounded-lg text-center">
                                    <p className="mb-0.5">Vence</p>
                                    <p className="text-slate-900 dark:text-white font-bold">{new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-background-dark p-2 rounded-lg text-center">
                                    <p className="mb-0.5">Moneda</p>
                                    <p className="text-slate-900 dark:text-white font-bold">DOP (RD$)</p>
                                </div>
                            </div>

                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">Notas privadas</label>
                            <textarea
                                className="w-full text-xs p-3 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-lg resize-none outline-none dark:text-white min-h-[80px]"
                                placeholder="Notas internas para el equipo..."
                            ></textarea>
                        </div>

                        <div className="flex flex-col gap-3 mt-6">
                            <button
                                type="button"
                                onClick={() => handleSubmit((data) => onSubmit(data, false))()}
                                disabled={isSubmitting || items.some(item => {
                                    const p = products.find(prod => prod.id === item.product_id);
                                    return p?.type === 'product' && (item.quantity || 0) > (p.stock_quantity || 0);
                                })}
                                className="w-full bg-primary text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                            >
                                <Save size={20} /> Guardar Borrador
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSubmit((data) => onSubmit(data, true))()}
                                disabled={isSubmitting || items.some(item => {
                                    const p = products.find(prod => prod.id === item.product_id);
                                    return p?.type === 'product' && (item.quantity || 0) > (p.stock_quantity || 0);
                                })}
                                className="w-full bg-transparent border-2 border-primary text-primary dark:text-blue-400 dark:border-blue-400 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all disabled:opacity-50"
                            >
                                <Send size={20} /> Emitir Ahora
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
