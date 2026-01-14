
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { X, Calendar, User, Phone, CheckCircle, RotateCcw } from 'lucide-react';
import axios from "../../../api";

interface LoanModalProps {
    vehicle: any;
    onClose: () => void;
    onSuccess: () => void;
}

export const LoanModal = ({ vehicle, onClose, onSuccess }: LoanModalProps) => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const [activeLoan, setActiveLoan] = useState<any>(null);

    useEffect(() => {
        if (vehicle.status === 'loaned') {
            loadActiveLoan();
        }
    }, [vehicle]);

    const loadActiveLoan = async () => {
        try {
            const res = await axios.get(`/api/automotive/vehicles/${vehicle.id}/active-loan`);
            setActiveLoan(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleLoan = async (data: any) => {
        setLoading(true);
        try {
            await axios.post(`/api/automotive/vehicles/${vehicle.id}/loan`, data);
            toast.success('Vehículo ha sido prestado/consignado');
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Error al registrar préstamo');
        } finally {
            setLoading(false);
        }
    };

    const handleReturn = async () => {
        if (!confirm('¿Confirmar que el vehículo ha regresado al dealer?')) return;
        setLoading(true);
        try {
            await axios.post(`/api/automotive/vehicles/${vehicle.id}/return`, {});
            toast.success('Vehículo marcado como retornado');
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Error al retornar vehículo');
        } finally {
            setLoading(false);
        }
    };

    if (vehicle.status === 'loaned' && activeLoan) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl p-6 w-full max-w-md relative">
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>

                    <h2 className="text-xl font-bold text-gray-900 mb-1">Vehículo en Préstamo</h2>
                    <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-3 py-1 rounded-full w-fit text-sm font-medium mb-4">
                        <CheckCircle size={16} /> En Consignación
                    </div>

                    <div className="space-y-4 mb-6">
                        <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-500 text-sm">Dealer / Vendedor:</span>
                                <span className="font-medium text-gray-900">{activeLoan.dealer_name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 text-sm">Teléfono:</span>
                                <span className="font-medium text-gray-900">{activeLoan.dealer_phone || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 text-sm">Fecha Préstamo:</span>
                                <span className="font-medium text-gray-900">{new Date(activeLoan.loan_date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 text-sm">Retorno Esperado:</span>
                                <span className="font-medium text-gray-900">
                                    {activeLoan.expected_return_date ? new Date(activeLoan.expected_return_date).toLocaleDateString() : 'Indefinido'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleReturn}
                        disabled={loading}
                        className="w-full py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-bold transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? 'Procesando...' : (
                            <>
                                <RotateCcw size={20} />
                                Registrar Retorno del Vehículo
                            </>
                        )}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <X size={24} />
                </button>

                <h2 className="text-xl font-bold text-gray-900 mb-2">Prestar / Consignar Vehículo</h2>
                <p className="text-gray-500 mb-6 text-sm">
                    Registra la salida del vehículo hacia otro dealer o vendedor externo.
                </p>

                <form onSubmit={handleSubmit(handleLoan)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Dealer / Persona *</label>
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            <input
                                {...register('dealer_name', { required: 'Requerido' })}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Ej. Auto Dealer Santiago"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            <input
                                {...register('dealer_phone')}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="809-555-5555"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Salida *</label>
                            <input
                                type="date"
                                {...register('loan_date', { required: 'Requerido' })}
                                defaultValue={new Date().toISOString().split('T')[0]}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Retorno Esperado</label>
                            <input
                                type="date"
                                {...register('expected_return_date')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notas / Condiciones</label>
                        <textarea
                            {...register('notes')}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Ej. Se entrega con medio tanque..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold transition-colors mt-2"
                    >
                        {loading ? 'Guardando...' : 'Registrar Préstamo'}
                    </button>
                </form>
            </div>
        </div>
    );
};
