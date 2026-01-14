import { Plus, Save, Trash2 } from 'lucide-react';
import React from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { QuickClientModal } from './QuickClientModal';

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

// Internal Component for Product Search
const SearchableProductSelect = ({ products, onSelect }: { products: any[], onSelect: (p: any) => void }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [search, setSearch] = React.useState('');
    const wrapperRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredProducts = products.filter(p =>
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="relative" ref={wrapperRef}>
            <input
                type="text"
                placeholder="🔍 Buscar producto..."
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm"
                onFocus={() => setIsOpen(true)}
                onChange={(e) => {
                    setSearch(e.target.value);
                    setIsOpen(true);
                }}
                value={search} // Controlled input
            />
            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredProducts.length === 0 ? (
                        <div className="p-3 text-sm text-gray-500 text-center">No encontrado</div>
                    ) : (
                        filteredProducts.map(p => (
                            <div
                                key={p.id}
                                className="p-2 hover:bg-blue-50 cursor-pointer text-sm border-b border-gray-50 last:border-none"
                                onClick={() => {
                                    onSelect(p);
                                    setSearch(p.description); // Update input with selection
                                    setIsOpen(false);
                                }}
                            >
                                <div className="font-medium text-gray-800">{p.description}</div>
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>{p.sku || 'Sin SKU'}</span>
                                    <span className="font-bold text-blue-600">RD$ {p.unit_price}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export const InvoiceForm: React.FC = () => {
    const navigate = useNavigate();
    const [clients, setClients] = React.useState<Array<{ id: number, name: string }>>([]);
    const [products, setProducts] = React.useState<Array<{ id: number, sku: string, description: string, unit_price: string, tax_rate: number }>>([]);
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
                            onClick={() => append({ description: '', quantity: 1, unit_price: 0, product_id: 0, tax_rate: 18.00 })}
                            className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <Plus size={18} /> Agregar Item
                        </button>
                    </div>

                    <div className="space-y-3">
                        {fields.map((field, index) => (
                            <div key={field.id} className="group relative grid grid-cols-12 gap-x-4 gap-y-4 items-start bg-gray-50/50 hover:bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-all">
                                <div className="col-span-12 md:col-span-4">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Producto / Servicio</label>
                                    <div className="space-y-2">
                                        <SearchableProductSelect
                                            products={products}
                                            onSelect={(product) => {
                                                setValue(`items.${index}.product_id`, product.id);
                                                setValue(`items.${index}.description`, product.description);
                                                setValue(`items.${index}.unit_price`, parseFloat(product.unit_price));
                                                setValue(`items.${index}.tax_rate`, parseFloat(product.tax_rate as any) || 18.00);
                                            }}
                                        />
                                        <input
                                            {...register(`items.${index}.description`)}
                                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                                            placeholder="Descripción del producto"
                                        />
                                    </div>
                                </div>
                                <div className="col-span-6 md:col-span-2">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Cantidad</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                                    />
                                </div>
                                <div className="col-span-6 md:col-span-2">
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
                                <div className="col-span-6 md:col-span-1">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Tax %</label>
                                    <input
                                        type="number"
                                        step="1"
                                        {...register(`items.${index}.tax_rate`, { valueAsNumber: true })}
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                                    />
                                </div>
                                <div className="col-span-6 md:col-span-2">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Total</label>
                                    <div className="px-3 py-2 bg-gray-100 rounded-lg text-right font-medium text-gray-700 truncate">
                                        {((items[index]?.quantity || 0) * (items[index]?.unit_price || 0) * (1 + (items[index]?.tax_rate || 0) / 100)).toFixed(2)}
                                    </div>
                                </div>
                                <div className="col-span-12 md:col-span-1 flex items-center justify-center md:pt-6">
                                    <button
                                        type="button"
                                        onClick={() => remove(index)}
                                        className="w-full md:w-auto p-2 text-red-500 bg-red-50 md:bg-transparent md:text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 flex items-center justify-center gap-2"
                                        title="Eliminar Item"
                                    >
                                        <Trash2 size={18} /> <span className="md:hidden text-sm font-medium">Eliminar</span>
                                    </button>
                                </div>
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
                                <span>ITBIS Total</span>
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
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                            >
                                <Save size={20} /> Crear Factura
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
