import {
    ArrowRight,
    Car,
    FileText,
    LayoutDashboard,
    Play,
    ShieldCheck,
    Zap
} from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import { NavbarPublic } from '../components/NavbarPublic';
import { useTheme } from '../context/ThemeContext';

export const Landing: React.FC = () => {
    const { theme } = useTheme();
    const logoSrc = theme === 'dark' ? '/img/logo_digitbill_dark.png?v=solid2' : '/img/logo_digitbill_light.png?v=solid2';


    return (
        <div className="min-h-screen bg-white dark:bg-background-dark font-sans overflow-x-hidden selection:bg-blue-100 dark:selection:bg-blue-900 selection:text-blue-900 dark:selection:text-blue-100 transition-colors duration-300">
            <NavbarPublic />

            {/* Hero Section */}
            <header className="relative pt-24 lg:pt-36 lg:pb-32 overflow-hidden">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-100/50 dark:bg-blue-900/20 blur-[100px] rounded-full opacity-50" />
                    <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-50/50 dark:bg-purple-900/10 blur-[120px] rounded-full opacity-30" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
                    <div className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs md:text-sm mb-8 animate-fade-in-up">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                        Solución Fiscal Integral & Más
                    </div>

                    <h1 className="text-4xl md:text-7xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-white mb-8 max-w-5xl leading-[1.1]">
                        El Sistema Operativo <br className="hidden md:block" />
                        de tu <span className="text-primary">Negocio Inteligente</span>
                    </h1>

                    <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-12 leading-relaxed">
                        Control total de facturación electrónica (e-CF), gestión de inventario y reportes DGII en una sola plataforma segura y moderna.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto mb-20 animate-fade-in-up delay-100">
                        <Link to="/register" className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-300 bg-primary hover:bg-blue-700 rounded-full hover:scale-105 shadow-xl shadow-blue-600/20 active:scale-95 group">
                            Comenzar Ahora
                            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                        </Link>
                        <button className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-slate-700 dark:text-white transition-all duration-300 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full hover:bg-slate-50 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20 group backdrop-blur-sm">
                            <Play size={18} className="mr-2 fill-slate-700 dark:fill-white" />
                            Ver Video Demo
                        </button>
                    </div>

                    {/* LIVE DASHBOARD PREVIEW */}
                    <div className="relative w-full max-w-[1200px] mx-auto transform hover:scale-[1.005] transition-transform duration-700">
                        {/* Glow Effect */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-[2.5rem] blur opacity-20 animate-pulse"></div>

                        <div className="relative bg-slate-50 dark:bg-[#0f111a] border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-2xl overflow-hidden">
                            {/* Browser Bar */}
                            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
                                <div className="flex gap-2">
                                    <div className="size-3 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                                    <div className="size-3 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                                    <div className="size-3 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                                </div>
                                <div className="hidden md:flex bg-slate-100 dark:bg-slate-800 px-4 py-1.5 rounded-md text-xs font-mono text-slate-400 gap-2 items-center">
                                    <ShieldCheck size={12} className="text-green-500" />
                                    https://app.digitbill.do/dashboard
                                </div>
                                <div className="size-8 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                            </div>

                            {/* FAKE DASHBOARD CONTENT */}
                            <div className="flex h-[600px] md:h-[800px] overflow-hidden bg-slate-50 dark:bg-[#0B1121] text-left">
                                {/* Sidebar (Mock) */}
                                <div className="w-64 bg-white dark:bg-[#111827] border-r border-slate-200 dark:border-slate-800 p-6 hidden md:flex flex-col gap-8">
                                    <div className="flex items-center gap-2">
                                        <img src={logoSrc} alt="DigitBill" className="h-8 w-auto object-contain" />
                                    </div>
                                    <div className="space-y-1">
                                        {['Dashboard', 'Facturas', 'Clientes', 'Inventario', 'Reportes'].map((item, i) => (
                                            <div key={item} className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-3 ${i === 0 ? 'bg-primary text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                                                <LayoutDashboard size={18} className={i === 0 ? "fill-white/20" : ""} />
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Main Content */}
                                <div className="flex-1 p-8 overflow-hidden relative">
                                    {/* Header */}
                                    <div className="flex justify-between items-center mb-8">
                                        <div>
                                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Panel de Control</h2>
                                            <p className="text-slate-500 text-sm">Bienvenido de nuevo, Admin.</p>
                                        </div>
                                        <div className="flex gap-3">
                                            <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold shadow-sm">Descargar Reporte</button>
                                            <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20">+ Nueva Factura</button>
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                        {[
                                            { label: 'Ingresos Totales', val: 'RD$ 845,200.00', trend: '+12%', color: 'text-emerald-500' },
                                            { label: 'Facturas Activas', val: '142', trend: '+5', color: 'text-blue-500' },
                                            { label: 'Pendiente Cobro', val: 'RD$ 125,000.00', trend: 'Vence en 3 dias', color: 'text-amber-500' },
                                            { label: 'ITBIS a Pagar', val: 'RD$ 42,500.00', trend: 'Mes Actual', color: 'text-slate-400' }
                                        ].map((stat, i) => (
                                            <div key={i} className="bg-white dark:bg-[#151d32] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">{stat.label}</p>
                                                <p className="text-xl font-bold text-slate-900 dark:text-white mb-1">{stat.val}</p>
                                                <p className={`text-xs font-bold ${stat.color}`}>{stat.trend}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-3 gap-8 h-full">
                                        {/* Chart Area */}
                                        <div className="col-span-2 bg-white dark:bg-[#151d32] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                                            <div className="flex justify-between items-center mb-6">
                                                <h3 className="font-bold text-slate-900 dark:text-white">Resumen de Ventas</h3>
                                                <div className="flex gap-2">
                                                    <span className="size-3 rounded-full bg-primary"></span>
                                                    <span className="size-3 rounded-full bg-slate-200 dark:bg-slate-700"></span>
                                                </div>
                                            </div>
                                            <div className="flex items-end gap-3 h-48 md:h-64 px-4 pb-0">
                                                {[35, 60, 45, 75, 55, 85, 65, 90, 70, 40, 60].map((h, i) => (
                                                    <div key={i} className="flex-1 flex gap-1 items-end h-full group">
                                                        <div style={{ height: `${h}%` }} className="w-full bg-primary rounded-t-sm opacity-90 group-hover:opacity-100 transition-all"></div>
                                                        <div style={{ height: `${h * 0.4}%` }} className="w-full bg-slate-100 dark:bg-slate-700 rounded-t-sm"></div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Recent Activity List */}
                                        <div className="hidden md:block col-span-1 bg-white dark:bg-[#151d32] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                                            <h3 className="font-bold text-slate-900 dark:text-white mb-6">Actividad</h3>
                                            <div className="space-y-4">
                                                {[
                                                    { title: 'Nueva Factura #001', desc: 'Cliente: AutoImport', time: '2m' },
                                                    { title: 'Reporte 606 Generado', desc: 'Validado por DGII', time: '15m' },
                                                    { title: 'Alerta Inventario', desc: 'Stock bajo: Baterías', time: '1h' },
                                                    { title: 'Nueva Factura #002', desc: 'Cliente: Juan Pérez', time: '3h' },
                                                ].map((act, i) => (
                                                    <div key={i} className="flex gap-3">
                                                        <div className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                                            <div className="size-2 rounded-full bg-slate-400"></div>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{act.title}</p>
                                                            <p className="text-xs text-slate-500">{act.desc}</p>
                                                        </div>
                                                        <span className="ml-auto text-xs text-slate-400">{act.time}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Value Prop (Removed Fake Clients) */}
            <section className="py-24 bg-white dark:bg-background-dark" id="features">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <span className="text-primary font-bold tracking-wider uppercase text-sm">¿Por qué DigitBill?</span>
                        <h2 className="text-4xl font-bold text-slate-900 dark:text-white mt-2 mb-6">Software Profesional para Negocios Serios</h2>
                        <p className="text-xl text-slate-600 dark:text-slate-400">Diseñado desde cero para cumplir con la Norma General 06-2018 de la DGII y optimizar tu gestión administrativa.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* DGII Compliance Card */}
                        <div className="md:col-span-2 bg-slate-50 dark:bg-card-dark rounded-3xl p-8 md:p-12 border border-slate-100 dark:border-border-dark overflow-hidden relative group hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300">
                            <div className="relative z-10">
                                <span className="p-3 bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 rounded-xl inline-block mb-6"><FileText size={24} /></span>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Reportes Fiscales Automáticos</h3>
                                <p className="text-slate-600 dark:text-slate-400 text-lg max-w-md mb-6">
                                    Genera tus formatos 606, 607 y 608 sin errores manuales. Incluye exportación directa en formato TXT oficial para la Herramienta de Envío DGII.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-bold text-slate-700 dark:text-slate-300">606 Compras</span>
                                    <span className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-bold text-slate-700 dark:text-slate-300">607 Ventas</span>
                                    <span className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-bold text-slate-700 dark:text-slate-300">608 Anulados</span>
                                    <span className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-bold text-slate-700 dark:text-slate-300">IT-1</span>
                                </div>
                            </div>
                            <div className="absolute right-0 bottom-0 w-1/2 h-full bg-gradient-to-l from-blue-500/10 to-transparent z-0"></div>
                        </div>

                        {/* Automotive Card */}
                        <div className="md:row-span-2 bg-slate-900 dark:bg-[#0f0b29] text-white rounded-3xl p-8 md:p-12 overflow-hidden relative border border-slate-800">
                            <div className="relative z-10">
                                <span className="p-3 bg-slate-800 dark:bg-white/10 text-emerald-400 rounded-xl inline-block mb-6"><Car size={24} /></span>
                                <h3 className="text-2xl font-bold mb-4">Plus: Módulo Automotriz</h3>
                                <p className="text-slate-400 dark:text-slate-300 text-lg mb-8">Funcionalidades opcionales especializadas para el sector de vehículos.</p>
                                <div className="space-y-4">
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                                        <h4 className="font-bold text-emerald-400 mb-1 text-sm">Conduce de Salida</h4>
                                        <p className="text-sm text-slate-400">Documento de entrega no fiscal integrado ideal para despachos.</p>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                                        <h4 className="font-bold text-blue-400 mb-1 text-sm">Registro de Chasis/Placa</h4>
                                        <p className="text-sm text-slate-400">Campos personalizados para seguimiento detallado en cada factura.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Security Card */}
                        <div className="bg-purple-50 dark:bg-purple-500/5 rounded-3xl p-8 border border-purple-100 dark:border-purple-500/10 relative overflow-hidden group hover:shadow-xl hover:shadow-purple-500/5 transition-all">
                            <span className="p-3 bg-white dark:bg-background-dark text-purple-600 dark:text-purple-400 rounded-xl inline-block mb-4 shadow-sm border border-slate-100 dark:border-border-dark"><ShieldCheck size={24} /></span>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Seguridad Bancaria</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm">Encriptación de datos, copias de seguridad diarias y control de acceso por roles.</p>
                        </div>

                        {/* Speed Card */}
                        <div className="bg-emerald-50 dark:bg-emerald-500/5 rounded-3xl p-8 border border-emerald-100 dark:border-emerald-500/10 relative overflow-hidden group hover:shadow-xl hover:shadow-emerald-500/5 transition-all">
                            <span className="p-3 bg-white dark:bg-background-dark text-emerald-600 dark:text-emerald-400 rounded-xl inline-block mb-4 shadow-sm border border-slate-100 dark:border-border-dark"><Zap size={24} /></span>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Simplicidad</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm">Interfaz intuitiva que no requiere entrenamiento. Empieza a facturar en minutos.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-50 dark:bg-[#0f111a] pt-20 pb-10 border-t border-slate-200 dark:border-border-dark text-slate-600 dark:text-slate-400">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center gap-2 mb-6">
                            <img src={logoSrc} alt="DigitBill" className="h-8 w-auto object-contain" />
                        </div>
                        <p className="text-sm leading-relaxed mb-6">
                            Software de facturación profesional.
                            <br />Sin contratos forzosos. Sin complicaciones.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-6">Plataforma</h4>
                        <ul className="space-y-4 text-sm">
                            <li><Link to="#" className="hover:text-primary dark:hover:text-blue-400 transition-colors">Características</Link></li>
                            <li><Link to="#" className="hover:text-primary dark:hover:text-blue-400 transition-colors">Seguridad</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-6">Legal</h4>
                        <ul className="space-y-4 text-sm">
                            <li><Link to="#" className="hover:text-primary dark:hover:text-blue-400 transition-colors">Privacidad</Link></li>
                            <li><Link to="#" className="hover:text-primary dark:hover:text-blue-400 transition-colors">Términos</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 pt-8 border-t border-slate-200 dark:border-border-dark flex justify-between items-center text-sm">
                    <p>© 2026 DigitBill.</p>
                </div>
            </footer>
        </div>
    );
};
