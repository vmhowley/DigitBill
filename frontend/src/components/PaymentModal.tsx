import { Calendar, CreditCard, DollarSign, X } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import axios from '../api';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoice: { id: number; total: string; client_name?: string; total_paid?: string | number };
    onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, invoice, onSuccess }) => {
    // Calculate initial balance
    const initialBalance = Math.max(0, parseFloat(invoice.total) - parseFloat((invoice.total_paid || 0).toString()));
    const [amount, setAmount] = useState(initialBalance.toFixed(2));
    const [method, setMethod] = useState('transfer');
    const [reference, setReference] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('/api/payments', {
                invoice_id: invoice.id,
                amount: parseFloat(amount),
                payment_method: method,
                reference,
                payment_date: date
            });
            toast.success('Pago registrado correctamente');
            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            toast.error('Error al registrar pago');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-card-dark rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all border border-gray-100 dark:border-border-dark">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-border-dark">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Registrar Pago</h3>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Factura #{invoice.id.toString().padStart(6, '0')}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Monto a Pagar</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                <DollarSign size={18} />
                            </div>
                            <input
                                type="number"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 border border-gray-200 dark:border-border-dark bg-white dark:bg-background-dark text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-semibold"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Método</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                    <CreditCard size={18} />
                                </div>
                                <select
                                    value={method}
                                    onChange={(e) => setMethod(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 border border-gray-200 dark:border-border-dark bg-white dark:bg-background-dark text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                                >
                                    <option value="transfer">Transferencia</option>
                                    <option value="cash">Efectivo</option>
                                    <option value="check">Cheque</option>
                                    <option value="card">Tarjeta</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Fecha</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                    <Calendar size={18} />
                                </div>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 border border-gray-200 dark:border-border-dark bg-white dark:bg-background-dark text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Referencia / Nota</label>
                        <input
                            type="text"
                            placeholder="Ej: No. de transferencia o cheque"
                            value={reference}
                            onChange={(e) => setReference(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 dark:border-border-dark bg-white dark:bg-background-dark text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-gray-200 dark:border-border-dark text-gray-600 dark:text-slate-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !amount}
                            className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 dark:shadow-none disabled:opacity-50"
                        >
                            {loading ? 'Guardando...' : 'Registrar Pago'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
