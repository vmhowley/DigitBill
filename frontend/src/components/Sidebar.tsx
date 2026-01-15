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
                    className="fixed inset-0 bg-background-dark/80 backdrop-blur-sm z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            <aside className={`
                fixed inset-y-0 left-0 w-64 bg-white dark:bg-background-dark border-r border-slate-200 dark:border-border-dark z-50 transform transition-transform duration-300 ease-in-out flex flex-col h-full
                md:relative md:translate-x-0
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="p-6 flex items-center gap-3">
                    <div className="rounded bg-slate-200 dark:bg-slate-700/50 overflow-hidden">
                        <img className='w-80 h-20  object-cover object-center' src={logo} alt="" />
                    </div>
                    <button onClick={onClose} className="ml-auto md:hidden text-slate-400">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto">
                    <NavLinks role={role} industryType={profile?.industry_type || 'retail'} onClose={onClose} isActive={isActive} />
                </nav>

                <div className="p-4 border-t border-slate-200 dark:border-border-dark">
                    <div className="flex items-center gap-3 px-4 py-2">
                        <div className="size-10 rounded-full bg-slate-200 dark:bg-card-dark flex items-center justify-center overflow-hidden">
                            <span className="material-symbols-outlined text-gray-500">person</span>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold truncate text-slate-700 dark:text-slate-200">{profile?.username || 'Usuario'}</p>
                            <button onClick={signOut} className="text-xs text-slate-500 truncate hover:text-red-500 transition-colors flex items-center gap-1">
                                <span className="material-symbols-outlined text-[10px]">logout</span> Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

const NavLinks = ({ role, industryType, onClose, isActive }: any) => {
    const renderLink = (path: string, label: string, icon: string) => {
        const active = isActive(path);
        return (
            <Link
                key={path}
                to={path}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 font-medium ${active
                    ? 'bg-primary text-white shadow-md shadow-primary/25'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-card-dark hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
            >
                <span className={`material-symbols-outlined ${active ? 'text-white' : ''}`}>{icon}</span>
                <span>{label}</span>
            </Link>
        );
    };

    return (
        <>
            {renderLink('/dashboard', 'Dashboard', 'dashboard')}
            {renderLink('/invoices', 'Facturas', 'receipt_long')}
            {renderLink('/create', 'Nueva Factura', 'post_add')}
            {renderLink('/clients', 'Clientes', 'group')}
            {renderLink('/expenses', 'Gastos', 'account_balance')}
            {renderLink('/providers', 'Proveedores', 'local_shipping')}

            {/* Industry Specific */}
            <div className="pt-4 pb-2 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Módulos</div>

            {(industryType === 'automotive') ? (
                <>
                    {renderLink('/automotive/sales/new', 'Nueva Venta', 'shopping_bag')}
                    {renderLink('/automotive/vehicles', 'Vehículos', 'directions_car')}
                    {renderLink('/automotive', 'Taller', 'build')}
                </>
            ) : (
                <>
                    {renderLink('/inventory', 'Inventario', 'warehouse')}
                    {renderLink('/products', 'Productos', 'inventory_2')}
                </>
            )}

            {(role === 'admin' || role === 'accountant') && (
                renderLink('/reports', 'Reportes', 'analytics')
            )}

            {/* Admin */}
            {role === 'admin' && (
                <>
                    <div className="pt-4 pb-2 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Sistema</div>
                    {renderLink('/upgrade', 'Suscripción', 'credit_card')}
                    {renderLink('/settings', 'Configuración', 'settings')}
                </>
            )}
        </>
    );
};
