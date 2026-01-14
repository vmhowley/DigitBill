import { Menu, X } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export const NavbarPublic: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    return (
        <nav className="bg-white/80 dark:bg-background-dark/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 dark:border-border-dark transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <div className="bg-primary size-8 rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-xl">account_balance_wallet</span>
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">DigitBill</h1>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link to="/" className={`text-sm font-bold transition-colors ${location.pathname === '/' ? 'text-primary dark:text-blue-400' : 'text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-white'}`}>Inicio</Link>
                        <Link to="/pricing" className={`text-sm font-bold transition-colors ${location.pathname === '/pricing' ? 'text-primary dark:text-blue-400' : 'text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-white'}`}>Precios</Link>
                        <Link to="/features" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-white transition-colors">Características</Link>
                        <div className="h-6 w-px bg-slate-200 dark:bg-border-dark"></div>
                        <Link to="/login" className="text-sm font-bold text-slate-900 dark:text-white hover:text-primary dark:hover:text-blue-400 transition-colors">Iniciar Sesión</Link>
                        <Link to="/register" className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-lg shadow-slate-900/20 dark:shadow-white/10">
                            Empezar Gratis
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600 dark:text-slate-300 p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors">
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white dark:bg-background-dark border-t border-slate-200 dark:border-border-dark absolute w-full shadow-xl">
                    <div className="px-4 pt-2 pb-6 space-y-2">
                        <Link to="/" className="block px-3 py-3 text-base font-bold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg">Inicio</Link>
                        <Link to="/pricing" className="block px-3 py-3 text-base font-bold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg">Precios</Link>
                        <Link to="/login" className="block px-3 py-3 text-base font-bold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg">Iniciar Sesión</Link>
                        <Link to="/register" className="block px-3 py-3 text-base font-bold text-primary dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 rounded-lg">Regístrate Gratis</Link>
                    </div>
                </div>
            )}
        </nav>
    );
};
