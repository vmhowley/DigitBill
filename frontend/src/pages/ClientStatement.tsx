import { ArrowLeft, Banknote, Download, FileText, Printer } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from '../api';

interface Transaction {
    type: 'invoice' | 'payment';
    id: number;
    date: string;
    description: string;
    amount: number;
    reference?: string;
}

export const ClientStatement: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [client, setClient] = useState<any>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [clientRes, invRes, payRes] = await Promise.all([
                axios.get(`/api/clients/${id}`),
                axios.get(`/api/invoices`, { params: { all: 'true' } }), // Fetch all for client filtering
                axios.get(`/api/payments/client/${id}`)
            ]);

            // Filter invoices for this client
            const clientInvoices = invRes.data.filter((inv: any) => inv.client_id === parseInt(id!));
            const clientPayments = payRes.data;

            setClient(clientRes.data);

            // Construct transactions chronologically
            const txs: Transaction[] = [];
            clientInvoices.forEach((inv: any) => {
                txs.push({
                    type: 'invoice',
                    id: inv.id,
                    date: inv.created_at,
                    description: `Factura #${inv.id.toString().padStart(6, '0')}`,
                    amount: parseFloat(inv.total)
                });
            });

            clientPayments.forEach((pay: any) => {
                txs.push({
                    type: 'payment',
                    id: pay.id,
                    date: pay.payment_date,
                    description: `Pago Recibido (${pay.payment_method})`,
                    amount: parseFloat(pay.amount),
                    reference: pay.reference
                });
            });

            setTransactions(txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Cargando...</div>;

    const totalInvoiced = transactions.filter(t => t.type === 'invoice').reduce((sum, t) => sum + t.amount, 0);
    const totalPaid = transactions.filter(t => t.type === 'payment').reduce((sum, t) => sum + t.amount, 0);
    const balance = totalInvoiced - totalPaid;

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <Link to="/clients" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft size={24} className="text-gray-600" />
                </Link>
                <div>
                    <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Estado de Cuenta</h2>
                    <p className="text-gray-500 mt-1">{client.name} • {client.rnc_ci}</p>
                </div>
                <div className="ml-auto flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                        <Printer size={18} /> Imprimir
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                        <Download size={18} /> PDF
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-500 mb-1">Total Facturado</p>
                    <p className="text-2xl font-bold text-gray-900">RD$ {totalInvoiced.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-500 mb-1">Total Pagado</p>
                    <p className="text-2xl font-bold text-green-600">RD$ {totalPaid.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 ring-2 ring-blue-500 ring-offset-2">
                    <p className="text-sm font-medium text-gray-500 mb-1">Saldo Pendiente</p>
                    <p className="text-2xl font-bold text-red-600">RD$ {balance.toLocaleString()}</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
                            <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Descripción</th>
                            <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Cargo</th>
                            <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Abono</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {transactions.map((tx, idx) => (
                            <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                <td className="py-4 px-6 text-sm text-gray-500">
                                    {new Date(tx.date).toLocaleDateString()}
                                </td>
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-2">
                                        {tx.type === 'invoice' ? <FileText size={16} className="text-blue-500" /> : <Banknote size={16} className="text-green-500" />}
                                        <span className="font-medium text-gray-900">{tx.description}</span>
                                    </div>
                                    {tx.reference && <p className="text-xs text-gray-400 mt-0.5">{tx.reference}</p>}
                                </td>
                                <td className="py-4 px-6 text-right font-medium">
                                    {tx.type === 'invoice' ? `RD$ ${tx.amount.toLocaleString()}` : '-'}
                                </td>
                                <td className="py-4 px-6 text-right font-medium text-green-600">
                                    {tx.type === 'payment' ? `RD$ ${tx.amount.toLocaleString()}` : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
