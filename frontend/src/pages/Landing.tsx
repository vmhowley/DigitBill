import { ArrowRight, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import { NavbarPublic } from '../components/NavbarPublic';

export const Landing: React.FC = () => {
    return (
        <div className="min-h-screen bg-white font-sans">
            <NavbarPublic />
            
            {/* Hero Section */}
            <header className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-40 bg-gradient-to-b from-blue-50 to-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm mb-6">
                        🚀 Facturación Electrónica DGII República Dominicana
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-8">
                        Factura sin límites.<br />
                        <span className="text-blue-600">Crece sin fronteras.</span>
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600 mb-10">
                        La plataforma más rápida para emitir e-CF certificados. Cumple con la DGII en segundos, gestiona inventarios y toma el control de tu negocio.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                         <Link to="/register" className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white transition-all duration-200 bg-blue-600 border border-transparent rounded-full shadow-lg hover:bg-blue-700 hover:shadow-blue-600/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600">
                            Empezar Prueba Gratis <ArrowRight className="ml-2" size={20} />
                        </Link>
                        <Link to="/pricing" className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-gray-700 transition-all duration-200 bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200">
                            Ver Planes
                        </Link>
                    </div>
                </div>
            </header>

            {/* Features Grid */}
            <section className="py-20 bg-white" id="features">
                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Todo lo que necesitas para cumplir</h2>
                        <p className="mt-4 text-lg text-gray-600">Deja de preocuparte por la tecnología y enfócate en vender.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard 
                            icon={<Zap className="w-8 h-8 text-yellow-500" />}
                            title="Emisión Instantánea"
                            description="Genera Facturas de Crédito Fiscal y Consumo en milisegundos. Validadas por DGII."
                        />
                        <FeatureCard 
                            icon={<ShieldCheck className="w-8 h-8 text-green-500" />}
                            title="Seguridad Bancaria"
                            description="Tus certificados digitales están encriptados. Nadie más tiene acceso a tu firma."
                        />
                        <FeatureCard 
                            icon={<CheckCircle2 className="w-8 h-8 text-blue-500" />}
                            title="Reportes Automáticos"
                            description="Olvídate del 606, 607 y 608. DigitBill los prepara por ti automáticamente."
                        />
                    </div>
                 </div>
            </section>

             {/* Footer */}
             <footer className="bg-gray-50 py-12 border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-gray-500">© 2024 DigitBill Dominicana S.R.L. Todos los derechos reservados.</p>
                </div>
             </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }: { icon: any, title: string, description: string }) => (
    <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
        <div className="bg-white w-14 h-14 rounded-xl flex items-center justify-center shadow-sm mb-6">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
);
