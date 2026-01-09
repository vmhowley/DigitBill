import { Menu } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from './Sidebar';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { profile } = useAuth();

    return (
        <div className="flex h-screen bg-gray-50 font-['Inter']">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col w-full h-full overflow-hidden">

                {/* Expiration Banner */}
                {profile?.subscription_status === 'expired' && (
                    <div className="bg-red-600 text-white text-center py-2 px-4 text-sm font-medium z-40 shrink-0 shadow-sm">
                        ⚠️ Tu suscripción ha expirado. Has vuelto al plan básico.
                        <Link to="/upgrade" className="underline font-bold ml-2 hover:text-red-100 transition-colors">Renovar Ahora</Link>
                    </div>
                )}

                <main className="flex-1 overflow-y-auto w-full relative">
                    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30 px-6 py-4 flex justify-between items-center md:hidden">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <Menu size={24} />
                            </button>
                            <span className="text-xl font-bold text-gray-800">DigitBill</span>
                        </div>
                    </header>
                    <div className="p-4 md:p-8 max-w-7xl mx-auto pb-20">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};
