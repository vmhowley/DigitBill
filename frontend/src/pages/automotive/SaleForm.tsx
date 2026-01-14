
import { Calculator, Check, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import axios from '../../api';

export const SaleForm = () => {
    const navigate = useNavigate();
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
    const [paymentPlan, setPaymentPlan] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, watch, setValue } = useForm({
        defaultValues: {
            vehicle_id: '',
            client_id: '',
            sale_price: 0,
            down_payment: 0,
            has_financing: false,
            interest_rate: 18,
            term_months: 24,
            notes: ''
        }
    });

    const watchPrice = watch('sale_price');
    const watchDownPayment = watch('down_payment');
    const watchHasFinancing = watch('has_financing');
    const watchRate = watch('interest_rate');
    const watchTerm = watch('term_months');

    useEffect(() => {
        loadData();
    }, []);

    // Recalculate financing when inputs change
    useEffect(() => {
        if (watchHasFinancing && watchPrice > 0 && watchTerm > 0) {
            calculatePayment();
        } else {
            setPaymentPlan(null);
        }
    }, [watchPrice, watchDownPayment, watchHasFinancing, watchRate, watchTerm]);

    const loadData = async () => {
        try {
            const [vRes, cRes] = await Promise.all([
                axios.get('/api/automotive/vehicles?status=available'),
                axios.get('/api/clients')
            ]);
            setVehicles(vRes.data);
            setClients(cRes.data);
        } catch (error) {
            console.error(error);
            toast.error('Error cargando datos');
        }
    };

    const calculatePayment = async () => {
        const financedAmount = watchPrice - watchDownPayment;
        if (financedAmount <= 0) return;

        try {
            const res = await axios.post('/api/automotive/calculate-payment', {
                amount: financedAmount,
                rate: watchRate,
                months: watchTerm
            });
            setPaymentPlan({
                ...res.data,
                financedAmount
            });
        } catch (error) {
            console.error(error);
        }
    };

    const onSubmit = async (data: any) => {
        if (!selectedVehicle) {
            return toast.error('Selecciona un vehículo');
        }

        setLoading(true);
        try {
            const payload = {
                ...data,
                financed_amount: paymentPlan?.financedAmount || 0,
                monthly_payment: paymentPlan?.monthlyPayment || 0
            };

            await axios.post('/api/automotive/sales', payload);
            toast.success('Venta registrada exitosamente');
            navigate('/automotive/vehicles');
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.error || 'Error al procesar venta');
        } finally {
            setLoading(false);
        }
    };

    // const handleVehicleSelect = (e: any) => {
    //     const vId = e.target.value;
    //     const vehicle = vehicles.find(v => v.id.toString() === vId);
    //     setSelectedVehicle(vehicle);
    //     if (vehicle) {
    //         setValue('sale_price', parseFloat(vehicle.price));
    //         setValue('vehicle_id', vId);
    //     }
    // };

    return (
        <div className="max-w-5xl mx-auto pb-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Nueva Venta / Contrato</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Selection & Numbers */}
                <div className="lg:col-span-2 space-y-6">

                    {/* 1. Vehicle & Client Selection */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm">1</span>
                            Vehículo y Cliente
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Vehículo *</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                    <input
                                        list="vehicle-list"
                                        placeholder="Buscar vehículo..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            const vehicle = vehicles.find(v => {
                                                const str = `${v.make} ${v.model} ${v.year} - ${v.vin.slice(-6)}`;
                                                return str === val;
                                            });
                                            if (vehicle) {
                                                setSelectedVehicle(vehicle);
                                                setValue('sale_price', parseFloat(vehicle.price));
                                                setValue('vehicle_id', vehicle.id);
                                            } else {
                                                setSelectedVehicle(null);
                                                setValue('vehicle_id', '');
                                            }
                                        }}
                                    />
                                    <datalist id="vehicle-list">
                                        {vehicles.map(v => (
                                            <option key={v.id} value={`${v.make} ${v.model} ${v.year} - ${v.vin.slice(-6)}`} />
                                        ))}
                                    </datalist>
                                    <input type="hidden" {...register('vehicle_id', { required: true })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
                                <select
                                    {...register('client_id', { required: true })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">-- Seleccionar --</option>
                                    {clients.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {selectedVehicle && (
                            <div className="bg-gray-50 p-4 rounded-lg flex gap-4 text-sm text-gray-700">
                                <div className="font-medium text-gray-900">{selectedVehicle.make} {selectedVehicle.model} {selectedVehicle.year}</div>
                                <div>VIN: {selectedVehicle.vin}</div>
                                <div>Color: {selectedVehicle.color}</div>
                            </div>
                        )}
                    </div>

                    {/* 2. Payment Terms */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm">2</span>
                            Condiciones de Pago
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Precio de Venta</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                    <input
                                        type="number"
                                        {...register('sale_price', { required: true, min: 1 })}
                                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg font-bold text-lg"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Inicial / Down Payment</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                    <input
                                        type="number"
                                        {...register('down_payment')}
                                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <input
                                type="checkbox"
                                id="has_financing"
                                {...register('has_financing')}
                                className="w-4 h-4 text-blue-600 rounded"
                            />
                            <label htmlFor="has_financing" className="font-medium text-gray-700">Incluir Financiamiento</label>
                        </div>

                        {watchHasFinancing && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50 p-4 rounded-lg border border-blue-100 animate-in fade-in slide-in-from-top-2">
                                <div>
                                    <label className="block text-sm font-medium text-blue-900 mb-1">Tasa Anual (%)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        {...register('interest_rate')}
                                        className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-blue-900 mb-1">Plazo (Meses)</label>
                                    <input
                                        type="number"
                                        {...register('term_months')}
                                        className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="pt-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Notas del Contrato</label>
                            <textarea
                                {...register('notes')}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Condiciones especiales..."
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column: Summary */}
                <div className="col-span-1">
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm sticky top-6">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Calculator size={20} />
                            Resumen Financiero
                        </h3>

                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Precio Vehículo</span>
                                <span className="font-medium">RD$ {parseFloat(watchPrice?.toString() || '0').toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-green-600">
                                <span>(-) Inicial</span>
                                <span>RD$ {parseFloat(watchDownPayment?.toString() || '0').toLocaleString()}</span>
                            </div>
                            <div className="border-t border-gray-100 my-2"></div>
                            <div className="flex justify-between font-bold text-lg text-gray-900">
                                <span>A Financiar</span>
                                <span>RD$ {(watchPrice - watchDownPayment).toLocaleString()}</span>
                            </div>

                            {paymentPlan && watchHasFinancing && (
                                <div className="mt-4 bg-gray-900 text-white p-4 rounded-xl space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">Cuota Mensual</span>
                                        <span className="text-xl font-bold text-green-400">RD$ {paymentPlan.monthlyPayment.toLocaleString()}</span>
                                    </div>
                                    <div className="text-xs text-gray-400 flex justify-between">
                                        <span>Total Intereses:</span>
                                        <span>RD$ {paymentPlan.totalInterest.toLocaleString()}</span>
                                    </div>
                                    <div className="text-xs text-gray-400 flex justify-between">
                                        <span>Total a Pagar:</span>
                                        <span>RD$ {paymentPlan.totalPayment.toLocaleString()}</span>
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-6 bg-blue-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex justify-center items-center gap-2"
                            >
                                {loading ? 'Procesando...' : (
                                    <>
                                        <Check size={20} />
                                        Cerrar Venta
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};
