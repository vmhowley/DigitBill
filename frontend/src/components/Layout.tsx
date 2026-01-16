import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';
import { ThemeToggle } from './ThemeToggle';
import { NotificationCenter } from './NotificationCenter';
import { HelpCenter } from './HelpCenter';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const { profile } = useAuth();
    const navigate = useNavigate();
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.length < 2) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        setIsSearching(true);
        setShowResults(true);
        try {
            const res = await api.get(`/api/search?q=${encodeURIComponent(query)}`);
            setSearchResults(res.data);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsSearching(false);
        }
    };

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

                        <div className="relative group flex-1 hidden md:block" ref={searchRef}>
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                            <input
                                type="text"
                                placeholder="Buscar transacciones, facturas, o clientes..."
                                className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-card-dark focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none dark:placeholder:text-slate-500 text-sm dark:text-white"
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                            />

                            {showResults && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="max-h-[70vh] overflow-y-auto">
                                        {isSearching ? (
                                            <div className="p-4 text-center text-slate-500 text-sm">Buscando...</div>
                                        ) : searchResults.length === 0 ? (
                                            <div className="p-4 text-center text-slate-500 text-sm italic">No se encontraron resultados para "{searchQuery}"</div>
                                        ) : (
                                            <div className="divide-y divide-slate-100 dark:divide-border-dark">
                                                {searchResults.map((result: any, idx: number) => (
                                                    <div
                                                        key={`${result.type}-${result.id}-${idx}`}
                                                        className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors flex items-center gap-4"
                                                        onClick={() => {
                                                            navigate(result.url);
                                                            setShowResults(false);
                                                            setSearchQuery('');
                                                        }}
                                                    >
                                                        <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${result.type === 'invoice' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600' :
                                                            result.type === 'client' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' :
                                                                'bg-purple-50 dark:bg-purple-500/10 text-purple-600'
                                                            }`}>
                                                            <span className="material-symbols-outlined">
                                                                {result.type === 'invoice' ? 'receipt' : result.type === 'client' ? 'person' : 'inventory_2'}
                                                            </span>
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="font-bold text-slate-900 dark:text-white truncate">{result.title}</div>
                                                            <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{result.subtitle}</div>
                                                        </div>
                                                        {result.extra && (
                                                            <div className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded truncate max-w-[100px]">
                                                                {result.extra}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3 bg-slate-50 dark:bg-background-dark border-t border-slate-100 dark:border-border-dark text-center">
                                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Presiona ESC para cerrar</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-4 ml-8">
                        <ThemeToggle />
                        <NotificationCenter />
                        <HelpCenter />
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto w-full p-4 md:p-8 pb-24 md:pb-8 scroll-smooth">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {/* Expiration Banner */}
                        {profile?.subscription_status === 'expired' && (
                            <div className="bg-red-600 text-white text-center py-2 px-4 text-sm font-medium rounded-lg shadow-sm mb-4">
                                ⚠️ Tu suscripción ha expirado.
                            </div>
                        )}

                        {children}
                    </div>
                </div>

                <BottomNav />
            </main>
        </div>
    );
};
