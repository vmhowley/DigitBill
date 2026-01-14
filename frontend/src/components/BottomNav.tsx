import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const BottomNav = () => {
    const location = useLocation();
    const { profile } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Core routes that always appear
    const mainRoutes = [
        { path: '/dashboard', label: 'Inicio', icon: 'dashboard' },
        { path: '/invoices', label: 'Facturas', icon: 'receipt_long' },
    ];

    const secondaryRoutes = [
        { path: '/clients', label: 'Clientes', icon: 'group' },
        { path: '/inventory', label: 'Inventario', icon: 'warehouse' },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <>
            {/* Main Bottom Nav */}
            <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-card-dark border-t border-slate-200 dark:border-border-dark px-2 py-1 md:hidden z-50 flex items-center justify-between pb-safe-area">

                {/* Left Side */}
                {mainRoutes.map((route) => (
                    <Link
                        key={route.path}
                        to={route.path}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl w-16 transition-all duration-200 ${isActive(route.path)
                                ? 'text-primary dark:text-blue-400'
                                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                            }`}
                    >
                        <span className={`material-symbols-outlined text-[24px] ${isActive(route.path) ? 'fill-current' : ''}`}>
                            {route.icon}
                        </span>
                        <span className="text-[10px] font-bold mt-1">{route.label}</span>
                    </Link>
                ))}

                {/* Central Floating Action Button */}
                <div className="relative -top-6">
                    <Link
                        to="/create"
                        className="bg-primary hover:bg-blue-600 text-white rounded-full size-14 flex items-center justify-center shadow-lg shadow-blue-600/30 transform active:scale-95 transition-all"
                    >
                        <span className="material-symbols-outlined text-3xl">add</span>
                    </Link>
                </div>

                {/* Right Side */}
                {secondaryRoutes.slice(0, 1).map((route) => (
                    <Link
                        key={route.path}
                        to={route.path}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl w-16 transition-all duration-200 ${isActive(route.path)
                                ? 'text-primary dark:text-blue-400'
                                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                            }`}
                    >
                        <span className={`material-symbols-outlined text-[24px] ${isActive(route.path) ? 'fill-current' : ''}`}>
                            {route.icon}
                        </span>
                        <span className="text-[10px] font-bold mt-1">{route.label}</span>
                    </Link>
                ))}

                {/* More / Menu Toggle */}
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl w-16 transition-all duration-200 ${isMenuOpen
                            ? 'text-primary dark:text-blue-400'
                            : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                        }`}
                >
                    <span className="material-symbols-outlined text-[24px]">menu</span>
                    <span className="text-[10px] font-bold mt-1">Más</span>
                </button>
            </div>

            {/* Expanded Menu Backdrop */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}

            {/* Expanded Menu Drawer */}
            <div className={`fixed bottom-20 right-4 left-4 bg-white dark:bg-card-dark rounded-2xl shadow-2xl p-4 z-40 md:hidden transform transition-transform duration-300 border border-slate-100 dark:border-border-dark ${isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'
                }`}>
                <div className="grid grid-cols-4 gap-4">
                    <MenuLink
                        to="/expenses"
                        icon="account_balance"
                        label="Gastos"
                        isActive={isActive('/expenses')}
                        onClick={() => setIsMenuOpen(false)}
                    />
                    <MenuLink
                        to="/providers"
                        icon="local_shipping"
                        label="Proveedor"
                        isActive={isActive('/providers')}
                        onClick={() => setIsMenuOpen(false)}
                    />
                    {profile?.role === 'admin' && (
                        <>
                            <MenuLink
                                to="/reports"
                                icon="analytics"
                                label="Reportes"
                                isActive={isActive('/reports')}
                                onClick={() => setIsMenuOpen(false)}
                            />
                            <MenuLink
                                to="/settings"
                                icon="settings"
                                label="Ajustes"
                                isActive={isActive('/settings')}
                                onClick={() => setIsMenuOpen(false)}
                            />
                        </>
                    )}
                    <MenuLink
                        to="/profile"
                        icon="person"
                        label="Perfil"
                        isActive={isActive('/profile')}
                        onClick={() => setIsMenuOpen(false)}
                    />
                </div>
            </div>
        </>
    );
};

const MenuLink = ({ to, icon, label, isActive, onClick }: any) => (
    <Link
        to={to}
        onClick={onClick}
        className={`flex flex-col items-center justify-center gap-2 p-2 rounded-xl transition-colors ${isActive
                ? 'bg-blue-50 dark:bg-blue-500/10 text-primary dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
    >
        <div className={`size-10 rounded-full flex items-center justify-center ${isActive ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-background-dark'
            }`}>
            <span className="material-symbols-outlined text-xl">{icon}</span>
        </div>
        <span className="text-xs font-medium text-center truncate w-full">{label}</span>
    </Link>
);
