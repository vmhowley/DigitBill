import { Menu, X } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo_digitbill.png';

export const NavbarPublic: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    return (
        <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    {/* Logo */}
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center gap-2 overflow-hidden">
                        <img src={logo} alt="DigitBill Logo" className="w-70 h-70   " />
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link to="/" className={`font-medium transition-colors ${location.pathname === '/' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>Inicio</Link>
                        <Link to="/pricing" className={`font-medium transition-colors ${location.pathname === '/pricing' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>Precios</Link>
                        <Link to="/features" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Características</Link>
                        <div className="h-6 w-px bg-gray-200"></div>
                        <Link to="/login" className="text-gray-900 font-semibold hover:text-blue-600 transition-colors">Iniciar Sesión</Link>
                        <Link to="/register" className="bg-gray-900 text-white px-5 py-2.5 rounded-full font-medium hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/20">
                            Empezar Gratis
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 p-2">
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-xl">
                    <div className="px-4 pt-2 pb-6 space-y-2">
                        <Link to="/" className="block px-3 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-lg">Inicio</Link>
                        <Link to="/pricing" className="block px-3 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-lg">Precios</Link>
                        <Link to="/login" className="block px-3 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-lg">Iniciar Sesión</Link>
                        <Link to="/register" className="block px-3 py-3 text-base font-medium text-blue-600 bg-blue-50 rounded-lg">Regístrate Gratis</Link>
                    </div>
                </div>
            )}
        </nav>
    );
};
