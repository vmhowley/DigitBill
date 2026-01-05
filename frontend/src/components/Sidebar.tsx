import { BarChart3, CreditCard, FilePlus, FileText, LayoutDashboard, LogOut, Package, Receipt, Settings, Truck, Users, Warehouse } from 'lucide-react';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo_digitbill.png';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
    const location = useLocation();
    const { profile, signOut } = useAuth();
    const role = profile?.role || 'user';

    const isActive = (path: string) => location.pathname === path;

    return (
        <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
            <div className="p-6 flex items-center justify-center overflow-hidden text-center">
                <img src={logo} alt="DigitBill Logo" className="w-full h-auto max-w-[180px] scale-150" />
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
                <Link
                    to="/dashboard"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive('/dashboard')
                        ? 'bg-blue-50 text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                >
                    <LayoutDashboard size={20} className={isActive('/dashboard') ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'} />
                    <span className="font-medium">Dashboard</span>
                </Link>

                <Link
                    to="/invoices"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive('/invoices')
                        ? 'bg-blue-50 text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                >
                    <FileText size={20} className={isActive('/invoices') ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'} />
                    <span className="font-medium">Facturas</span>
                </Link>

                <Link
                    to="/create"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive('/create')
                        ? 'bg-blue-50 text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                >
                    <FilePlus size={20} className={isActive('/create') ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'} />
                    <span className="font-medium">Nueva Factura</span>
                </Link>

                <Link
                    to="/clients"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive('/clients')
                        ? 'bg-blue-50 text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                >
                    <Users size={20} className={isActive('/clients') ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'} />
                    <span className="font-medium">Clientes</span>
                </Link>

                <Link
                    to="/providers"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive('/providers')
                        ? 'bg-blue-50 text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                >
                    <Truck size={20} className={isActive('/providers') ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'} />
                    <span className="font-medium">Proveedores</span>
                </Link>

                <Link
                    to="/inventory"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive('/inventory')
                        ? 'bg-blue-50 text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                >
                    <Warehouse size={20} className={isActive('/inventory') ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'} />
                    <span className="font-medium">Inventario</span>
                </Link>

                <Link
                    to="/expenses"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive('/expenses')
                        ? 'bg-blue-50 text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                >
                    <Receipt size={20} className={isActive('/expenses') ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'} />
                    <span className="font-medium">Gastos</span>
                </Link>

                <Link
                    to="/products"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive('/products')
                        ? 'bg-blue-50 text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                >
                    <Package size={20} className={isActive('/products') ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'} />
                    <span className="font-medium">Productos</span>
                </Link>

                {(role === 'admin' || role === 'accountant') && (
                    <Link
                        to="/reports"
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive('/reports')
                            ? 'bg-blue-50 text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                    >
                        <BarChart3 size={20} className={isActive('/reports') ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'} />
                        <span className="font-medium">Reportes</span>
                    </Link>
                )}

                {role === 'admin' && (
                    <div className="pt-4 mt-4 border-t border-gray-100 space-y-1">
                        <Link
                            to="/upgrade"
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive('/upgrade')
                                ? 'bg-blue-50 text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <CreditCard size={20} className={isActive('/upgrade') ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'} />
                            <span className="font-medium">Cambiar Plan</span>
                        </Link>
                        <Link
                            to="/settings"
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive('/settings')
                                ? 'bg-blue-50 text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <Settings size={20} className={isActive('/settings') ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'} />
                            <span className="font-medium">Configuración</span>
                        </Link>
                    </div>
                )}
            </nav>

            <div className="p-4 border-t border-gray-100">
                <button
                    onClick={signOut}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );
};
