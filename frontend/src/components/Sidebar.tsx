import { BarChart3, Car, CreditCard, FilePlus, FileText, LayoutDashboard, LogOut, Package, Receipt, Settings, ShoppingBag, Truck, Users, Warehouse, Wrench, X } from 'lucide-react';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo_digitbill.png';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const location = useLocation();
    const { profile, signOut } = useAuth();
    const role = profile?.role || 'user';

    const isActive = (path: string) => location.pathname === path;

    return (
        <>
            {/* Backdrop for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            <aside className={`
                fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out flex flex-col
                md:relative md:translate-x-0
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <Link to="/dashboard" className="flex items-center justify-center overflow-hidden text-center relative">
                    <img src={logo} alt="DigitBill Logo" className="w-96  scale-150" />
                    <button
                        onClick={onClose}
                        className="md:hidden p-2 text-gray-500 hover:text-gray-700"
                    >
                        <X size={24} />
                    </button>
                </Link>

                <nav className="flex-1 px-4 space-y-2  overflow-y-auto">
                    {/* Dynamic Menu Items */}
                    <NavLinks role={role} industryType={profile?.industry_type || 'retail'} onClose={onClose} isActive={isActive} />
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
            </aside >
        </>
    );
};

const NavLinks = ({ role, industryType, onClose, isActive }: any) => {
    // 1. Common functionality
    const commonLinks = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/invoices', label: 'Facturas', icon: FileText },
        { path: '/create', label: 'Nueva Factura', icon: FilePlus },
        { path: '/clients', label: 'Clientes', icon: Users },
        { path: '/providers', label: 'Proveedores', icon: Truck },
        { path: '/expenses', label: 'Gastos', icon: Receipt },
    ];

    // 2. Industry Specific
    let inventoryLinks = [
        { path: '/inventory', label: 'Inventario', icon: Warehouse },
        { path: '/products', label: 'Productos', icon: Package }
    ];

    if (industryType === 'automotive') {
        inventoryLinks = [
            { path: '/automotive/sales/new', label: 'Nueva Venta', icon: ShoppingBag },
            { path: '/automotive/vehicles', label: 'Vehículos', icon: Car },
            { path: '/automotive', label: 'Taller', icon: Wrench },
        ];
    } else if (industryType === 'service') {
        inventoryLinks = [
            { path: '/products', label: 'Servicios', icon: Package }
        ];
    }

    // 3. Admin stuff
    const reportsLink = { path: '/reports', label: 'Reportes', icon: BarChart3 };
    const adminLinks = [
        { path: '/upgrade', label: 'Cambiar Plan', icon: CreditCard },
        { path: '/settings', label: 'Configuración', icon: Settings }
    ];

    return (
        <>
            {commonLinks.map(link => (
                <Link
                    key={link.path}
                    to={link.path}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive(link.path)
                        ? 'bg-blue-50 text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                >
                    <link.icon size={20} className={isActive(link.path) ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'} />
                    <span className="font-medium">{link.label}</span>
                </Link>
            ))}

            <div className="py-2">
                <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Módulos</p>
                {inventoryLinks.map(link => (
                    <Link
                        key={link.label}
                        to={link.path}
                        onClick={onClose}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive(link.path)
                            ? 'bg-blue-50 text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                    >
                        <link.icon size={20} className={isActive(link.path) ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'} />
                        <span className="font-medium">{link.label}</span>
                    </Link>
                ))}
            </div>


            {(role === 'admin' || role === 'accountant') && (
                <Link
                    to={reportsLink.path}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive(reportsLink.path)
                        ? 'bg-blue-50 text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                >
                    <reportsLink.icon size={20} className={isActive(reportsLink.path) ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'} />
                    <span className="font-medium">{reportsLink.label}</span>
                </Link>
            )}

            {role === 'admin' && (
                <div className="pt-4 mt-4 border-t border-gray-100 space-y-1">
                    {adminLinks.map(link => (
                        <Link
                            key={link.path}
                            to={link.path}
                            onClick={onClose}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive(link.path)
                                ? 'bg-blue-50 text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <link.icon size={20} className={isActive(link.path) ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'} />
                            <span className="font-medium">{link.label}</span>
                        </Link>
                    ))}
                </div>
            )}
        </>
    );
};
