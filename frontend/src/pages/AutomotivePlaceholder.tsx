
import { Car, ShoppingBag, Wrench } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

export const AutomotivePlaceholder = () => {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Car className="text-blue-600" size={32} />
                Módulo Automotriz
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                        <Car size={24} />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Vehículos en Stock</h3>
                    <p className="text-gray-500 text-sm">Gestiona tu inventario de carros, camiones y motocicletas. VIN, marca, modelo y más.</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-4">
                        <ShoppingBag size={24} />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Ventas & Trade-ins</h3>
                    <p className="text-gray-500 text-sm">Crea contratos de venta, financiamientos y recibe vehículos como parte de pago.</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mb-4">
                        <Wrench size={24} />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Taller & Servicios</h3>
                    <p className="text-gray-500 text-sm">Órdenes de reparación, mantenimiento y seguimiento de historial de servicios.</p>
                </div>
            </div>

            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                <strong className="block mb-1 font-bold">Modo Demo Activado</strong>
                Estás viendo el módulo específico para Dealers de Vehículos. Esto reemplaza el inventario estándar de productos.
            </div>

            <Link to="/dashboard" className="mt-8 inline-block text-blue-600 hover:text-blue-800 font-medium">
                &larr; Volver al Dashboard
            </Link>
        </div>
    );
};
