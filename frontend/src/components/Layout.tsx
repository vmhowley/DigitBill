import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { profile } = useAuth();

    return (
        <div className="flex h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 overflow-hidden">
            {/* Desktop Sidebar */}
            <div className="hidden md:block h-full shrink-0">
                <Sidebar isOpen={true} onClose={() => { }} />
            </div>

            {/* Mobile Sidebar Overlay */}
            <div className="md:hidden">
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            </div>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                {/* Top App Bar */}
                <header className="h-20 flex items-center justify-between px-8 border-b border-slate-200 dark:border-border-dark bg-white/80 dark:bg-background-dark/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
                    <div className="flex items-center gap-4 w-full max-w-xl">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-card-dark rounded-lg transition-colors"
                        >
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <div>
                            <div className="flex items-center gap-2 md:hidden">
                                <h1 className="text-2xl font-bold">DigitBill</h1>
                            </div>
                        </div>

                        <div className="relative group flex-1 hidden md:block">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                            <input
                                type="text"
                                placeholder="Buscar transacciones, facturas, o clientes..."
                                className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-card-dark focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none dark:placeholder:text-slate-500 text-sm dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 ml-8">
                        <button className="size-10 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-card-dark transition-colors relative">
                            <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">notifications</span>
                            <span className="absolute top-2.5 right-2.5 size-2 bg-red-500 rounded-full border-2 border-white dark:border-background-dark"></span>
                        </button>
                        <button className="size-10 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-card-dark transition-colors">
                            <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">help_outline</span>
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto w-full p-4 md:p-8 space-y-8 pb-24 md:pb-8 scroll-smooth">
                    {/* Expiration Banner */}
                    {profile?.subscription_status === 'expired' && (
                        <div className="bg-red-600 text-white text-center py-2 px-4 text-sm font-medium rounded-lg shadow-sm mb-4">
                            ⚠️ Tu suscripción ha expirado.
                        </div>
                    )}

                    {children}
                </div>

                <BottomNav />
            </main>
        </div>
    );
};
