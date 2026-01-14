
import { pdf } from '@react-pdf/renderer';
import { Edit, FileText, Plus, Printer, Search, Share2, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import axios from '../../api';
import { DeliveryNotePDF } from './components/DeliveryNotePDF';
import { LoanModal } from './components/LoanModal';
import { SalesContractPDF } from './components/SalesContractPDF';

export const VehicleList = () => {
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedForLoan, setSelectedForLoan] = useState<any>(null); // State for modal

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            const res = await axios.get('/api/automotive/vehicles');
            setVehicles(res.data);
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar vehículos');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (import.meta.env.MODE !== 'test' && !window.confirm('¿Estás seguro de eliminar este vehículo?')) return;

        try {
            await axios.delete(`/api/automotive/vehicles/${id}`);
            toast.success('Vehículo eliminado');
            fetchVehicles();
        } catch (error) {
            console.error(error);
            toast.error('Error al eliminar');
        }
    };

    const [statusFilter, setStatusFilter] = useState('all');

    const filteredVehicles = vehicles.filter(v => {
        const matchesSearch =
            v.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.vin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.plate?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || v.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        const styles: any = {
            available: 'bg-green-100 text-green-700',
            reserved: 'bg-yellow-100 text-yellow-700',
            sold: 'bg-blue-100 text-blue-700',
            maintenance: 'bg-red-100 text-red-700',
            loaned: 'bg-orange-100 text-orange-700', // Distinct style for loaned
        };
        const labels: any = {
            available: 'Disponible',
            reserved: 'Reservado',
            sold: 'Vendido',
            maintenance: 'Taller',
            loaned: 'En Préstamo',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100'}`}>
                {labels[status] || status}
            </span>
        );
    };



    if (loading) return <div className="p-8 text-center">Cargando inventario...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Vehículos</h1>
                    <p className="text-gray-500">Gestión de inventario automotriz</p>
                </div>
                <Link to="/automotive/vehicles/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <Plus size={20} /> Nuevo Vehículo
                </Link>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por marca, modelo, VIN o placa..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="all">Todos los Estados</option>
                            <option value="available">Disponibles</option>
                            <option value="reserved">Reservados</option>
                            <option value="sold">Vendido</option>
                            <option value="maintenance">En Taller</option>
                            <option value="loaned">En Préstamo</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Vehículo</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">VIN</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Año/Color</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Precio</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Estado</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredVehicles.map((vehicle) => (
                                <tr key={vehicle.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <Link to={`/automotive/vehicles/${vehicle.id}`} className="block group">
                                            <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                                {vehicle.make} {vehicle.model}
                                            </div>
                                            <div className="text-xs text-gray-500">{vehicle.trim}</div>
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs text-gray-600">
                                        <div>{vehicle.vin || 'N/A'}</div>
                                        {vehicle.plate && <div className="text-blue-600 font-bold">{vehicle.plate}</div>}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {vehicle.year} — {vehicle.color}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        RD$ {parseFloat(vehicle.price).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(vehicle.status)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {(vehicle.status === 'available' || vehicle.status === 'loaned') && (
                                                <button
                                                    onClick={() => setSelectedForLoan(vehicle)}
                                                    className="p-1 text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                                                    title={vehicle.status === 'loaned' ? 'Ver Préstamo' : 'Prestar a Dealer'}
                                                >
                                                    <Share2 size={18} />
                                                </button>
                                            )}
                                            {vehicle.status === 'sold' && (
                                                <>
                                                    <button
                                                        onClick={async () => {
                                                            if (!vehicle.sale_id) return toast.error('Venta no encontrada');
                                                            const toastId = toast.loading('Generando contrato...');
                                                            try {
                                                                const res = await axios.get(`/api/automotive/sales/${vehicle.sale_id}`);
                                                                const blob = await pdf(<SalesContractPDF sale={res.data} />).toBlob();
                                                                const url = URL.createObjectURL(blob);
                                                                window.open(url, '_blank');
                                                                toast.success('Contrato generado', { id: toastId });
                                                            } catch (error) {
                                                                console.error(error);
                                                                toast.error('Error generando contrato', { id: toastId });
                                                            }
                                                        }}
                                                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                        title="Imprimir Contrato"
                                                    >
                                                        <Printer size={18} />
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            if (!vehicle.sale_id) return toast.error('Venta no encontrada');
                                                            const toastId = toast.loading('Generando conduce...');
                                                            try {
                                                                const res = await axios.get(`/api/automotive/sales/${vehicle.sale_id}`);
                                                                const blob = await pdf(<DeliveryNotePDF sale={res.data} />).toBlob();
                                                                const url = URL.createObjectURL(blob);
                                                                window.open(url, '_blank');
                                                                toast.success('Conduce generado', { id: toastId });
                                                            } catch (error) {
                                                                console.error(error);
                                                                toast.error('Error generando conduce', { id: toastId });
                                                            }
                                                        }}
                                                        className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                                                        title="Imprimir Conduce de Salida"
                                                    >
                                                        <FileText size={18} />
                                                    </button>
                                                </>
                                            )}
                                            <Link to={`/automotive/vehicles/edit/${vehicle.id}`} className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                                                <Edit size={18} />
                                            </Link>
                                            <button onClick={() => handleDelete(vehicle.id)} className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredVehicles.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                                                <FileText size={24} />
                                            </div>
                                            <p>No se encontraron vehículos</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedForLoan && (
                <LoanModal
                    vehicle={selectedForLoan}
                    onClose={() => setSelectedForLoan(null)}
                    onSuccess={() => {
                        setSelectedForLoan(null);
                        fetchVehicles();
                    }}
                />
            )}
        </div>
    );
};
