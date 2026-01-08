import {
    ArrowRight,
    Check,
    CheckCircle2,
    ChevronDown,
    Globe,
    MessageSquare,
    PieChart,
    Play,
    ShieldCheck,
    Smartphone,
    Star,
    Zap
} from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { NavbarPublic } from '../components/NavbarPublic';

export const Landing: React.FC = () => {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    return (
        <div className="min-h-screen bg-white font-sans overflow-x-hidden selection:bg-blue-100 selection:text-blue-900">
            <NavbarPublic />

            {/* Hero Section */}
            <header className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-100/50 blur-[100px] rounded-full opacity-50" />
                    <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-50/50 blur-[120px] rounded-full opacity-30" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
                    <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-blue-50 border border-blue-100 text-blue-700 font-medium text-sm mb-8 animate-fade-in-up">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        Nueva Actualización: Facturación Electrónica al 100%
                    </div>

                    <h1 className="text-4xl md:text-7xl lg:text-8xl font-bold tracking-tight text-gray-900 mb-8 max-w-5xl leading-[1.1]">
                        Tu negocio, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">organizado</span><br />
                        y en cumplimiento.
                    </h1>

                    <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600 mb-12 leading-relaxed">
                        La plataforma de facturación electrónica favorita de las PYMES dominicanas.
                        Emite e-CFs, controla tu inventario y gestiona tus clientes en una sola app moderna y rápida.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto mb-20">
                        <Link to="/register" className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-300 bg-blue-600 rounded-full hover:bg-blue-700 hover:scale-105 shadow-xl shadow-blue-600/20 active:scale-95 group">
                            Comenzar Gratis
                            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                        </Link>
                        <button className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-gray-700 transition-all duration-300 bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 group">
                            <Play size={18} className="mr-2 fill-gray-700" />
                            Ver Demo
                        </button>
                    </div>

                    {/* Dashboard Preview Mockup */}
                    <div className="relative w-full max-w-6xl mx-auto transform hover:scale-[1.01] transition-transform duration-500">
                        <div className="absolute inset-0 bg-blue-600 blur-3xl opacity-10 rounded-[3rem]"></div>
                        <div className="relative bg-white border border-gray-200 rounded-2xl md:rounded-[2rem] shadow-2xl overflow-hidden animate-slide-up">
                            {/* Browser Bar */}
                            <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex items-center gap-2">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                </div>
                                <div className="mx-auto bg-white border border-gray-200 px-4 py-1.5 rounded-lg text-xs text-gray-400 font-medium hidden sm:block w-96 text-center">
                                    app.digitbill.do/dashboard
                                </div>
                            </div>
                            {/* UI Content Placeholder */}
                            <div className="p-6 md:p-10 bg-gray-50/30">
                                <div className="grid grid-cols-12 gap-6">
                                    {/* Sidebar Mock */}
                                    <div className="hidden md:block col-span-2 space-y-4">
                                        <div className="h-8 w-8 bg-blue-600 rounded-lg mb-8"></div>
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <div key={i} className={`h-2.5 rounded-full w-2/3 ${i === 1 ? 'bg-blue-100' : 'bg-gray-200'}`}></div>
                                        ))}
                                    </div>
                                    {/* Main Content Mock */}
                                    <div className="col-span-12 md:col-span-10">
                                        <div className="flex justify-between items-center mb-8">
                                            <div className="h-4 w-32 bg-gray-200 rounded-full"></div>
                                            <div className="h-8 w-24 bg-blue-600 rounded-lg"></div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                                    <div className="h-8 w-8 bg-blue-50 rounded-lg mb-4"></div>
                                                    <div className="h-3 w-20 bg-gray-100 rounded-full mb-2"></div>
                                                    <div className="h-6 w-32 bg-gray-800 rounded-full"></div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="bg-white h-64 rounded-xl border border-gray-100 shadow-sm p-6 flex items-end justify-between gap-4">
                                            {[40, 60, 45, 70, 50, 80, 65, 85, 75, 90, 60, 95].map((h, i) => (
                                                <div key={i} className="w-full bg-blue-100 rounded-t-lg relative group" style={{ height: `${h}%` }}>
                                                    <div className="absolute bottom-0 w-full bg-blue-500 rounded-t-lg transition-all duration-1000" style={{ height: `${h * 0.6}%` }}></div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Trusted By Section */}
            <section className="py-10 border-y border-gray-100 bg-gray-50/50">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-8">Confían en nosotros</p>
                    <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        {['Asociación Norte', 'TechDominicana', 'Ferretería Central', 'Consultores & Asoc.', 'LegalGroup'].map((name) => (
                            <span key={name} className="text-xl md:text-2xl font-bold font-serif text-gray-400 hover:text-gray-800 transition-colors cursor-default">{name}</span>
                        ))}
                    </div>
                </div>
            </section>

            {/* Value Prop / Bento Grid */}
            <section className="py-24 bg-white" id="features">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h2 className="text-4xl font-bold text-gray-900 mb-6">Todo lo que necesitas para crecer</h2>
                        <p className="text-xl text-gray-600">DigitBill no es solo una herramienta de facturación, es el sistema operativo financiero de tu empresa.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Large Card 1 */}
                        <div className="md:col-span-2 bg-gray-50 rounded-3xl p-8 md:p-12 border border-gray-100 overflow-hidden relative group">
                            <div className="relative z-10">
                                <span className="p-3 bg-blue-100 text-blue-700 rounded-xl inline-block mb-6"><Zap size={24} /></span>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Facturación Ultra Rápida</h3>
                                <p className="text-gray-600 text-lg max-w-md">Emite comprobantes válidos para la DGII en segundos. Nuestro motor inteligente valida cada RNC y NCF al instante para evitar errores.</p>
                            </div>
                            <div className="absolute right-0 bottom-0 w-1/2 h-full bg-gradient-to-l from-white/50 to-transparent z-0"></div>
                            {/* Decorative Elements */}
                            <div className="absolute -right-10 bottom-10 bg-white p-4 rounded-xl shadow-lg border border-gray-100 w-64 transform rotate-[-5deg] group-hover:rotate-0 transition-all duration-300">
                                <div className="flex gap-4 items-center">
                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600"><Check size={20} /></div>
                                    <div>
                                        <p className="text-xs text-gray-500">Estado</p>
                                        <p className="font-bold text-gray-800">Aceptado DGII</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tall Card */}
                        <div className="md:row-span-2 bg-gray-900 text-white rounded-3xl p-8 md:p-12 overflow-hidden relative">
                            <div className="relative z-10">
                                <span className="p-3 bg-gray-800 text-blue-400 rounded-xl inline-block mb-6"><Smartphone size={24} /></span>
                                <h3 className="text-2xl font-bold mb-4">Tu negocio en tu bolsillo</h3>
                                <p className="text-gray-400 text-lg mb-8">Accede a tus datos desde cualquier lugar. Nuestra app es 100% responsive y funciona en cualquier dispositivo.</p>
                                <div className="flex flex-col gap-3">
                                    {['Reportes en tiempo real', 'Envío por WhatsApp', 'Notificaciones de pago'].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 text-gray-300">
                                            <CheckCircle2 size={18} className="text-blue-500" /> {item}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-600 blur-[80px] opacity-30 rounded-full"></div>
                        </div>

                        {/* Small Card 2 */}
                        <div className="bg-blue-50 rounded-3xl p-8 border border-blue-100 relative overflow-hidden group">
                            <span className="p-3 bg-white text-blue-600 rounded-xl inline-block mb-4 shadow-sm"><PieChart size={24} /></span>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Reportes Inteligentes</h3>
                            <p className="text-gray-600">Olvídate de Excel. Visualiza tus ventas, impuestos y gastos automáticamente.</p>
                        </div>

                        {/* Small Card 3 */}
                        <div className="bg-purple-50 rounded-3xl p-8 border border-purple-100 relative overflow-hidden group">
                            <span className="p-3 bg-white text-purple-600 rounded-xl inline-block mb-4 shadow-sm"><ShieldCheck size={24} /></span>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Seguridad Grado Bancario</h3>
                            <p className="text-gray-600">Tus datos encriptados y respaldados diariamente. Tranquilidad total.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-24 bg-gray-900 text-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                        <div>
                            <span className="text-blue-400 font-bold tracking-wider uppercase text-sm">Testimonios</span>
                            <h2 className="text-3xl md:text-5xl font-bold mt-2">Lo que dicen nuestros clientes</h2>
                        </div>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="fill-yellow-400 text-yellow-400" size={24} />)}
                            <span className="ml-2 text-xl font-medium">4.9/5 de 500+ reseñas</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <TestimonialCard
                            quote="Desde que usamos DigitBill, el tiempo que dedicábamos a facturación se redujo en un 80%. Es increíblemente fácil de usar."
                            author="Carlos Rodríguez"
                            role="CEO, TechSolutions SRL"
                            image="https://randomuser.me/api/portraits/men/32.jpg"
                        />
                        <TestimonialCard
                            quote="Cumplir con la DGII era un dolor de cabeza. Con esta plataforma, la facturación electrónica es automática y sin estrés."
                            author="María González"
                            role="Admin, Farmacia El Sol"
                            image="https://randomuser.me/api/portraits/women/44.jpg"
                        />
                        <TestimonialCard
                            quote="El soporte es excelente y la plataforma nunca falla. Mis clientes agradecen recibir sus facturas al instante en su correo."
                            author="José Pérez"
                            role="Gerente, Almacenes Unicos"
                            image="https://randomuser.me/api/portraits/men/67.jpg"
                        />
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-24 bg-white max-w-4xl mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">Preguntas Frecuentes</h2>
                    <p className="text-gray-600 text-lg">Resolvemos tus dudas sobre la facturación electrónica.</p>
                </div>

                <div className="space-y-4">
                    {[
                        { q: "¿Necesito certificado digital para usar DigitBill?", a: "Sí, para emitir facturas electrónicas válidas ante la DGII necesitas un certificado digital. Nosotros te guiamos en el proceso de obtenerlo." },
                        { q: "¿Es compatible con impresoras fiscales?", a: "DigitBill reemplaza a las impresoras fiscales tradicionales. Puedes imprimir tus facturas en cualquier impresora estándar o enviarlas por correo digitalmente." },
                        { q: "¿Qué pasa si se cae el internet?", a: "Puedes seguir trabajando. El sistema guardará tus facturas y las sincronizará con la DGII automáticamente cuando regrese la conexión." },
                        { q: "¿Tienen planes para contadores?", a: "Sí, tenemos un panel especial para contadores que gestionan múltiples empresas. Contáctanos para más información." }
                    ].map((item, index) => (
                        <div key={index} className="border border-gray-200 rounded-2xl overflow-hidden">
                            <button
                                onClick={() => toggleFaq(index)}
                                className="w-full flex justify-between items-center p-6 bg-white hover:bg-gray-50 transition-colors text-left"
                            >
                                <span className="font-semibold text-gray-900 text-lg">{item.q}</span>
                                <ChevronDown
                                    className={`transition-transform duration-300 text-gray-500 ${openFaq === index ? 'rotate-180' : ''}`}
                                />
                            </button>
                            <div className={`overflow-hidden transition-all duration-300 ${openFaq === index ? 'max-h-48' : 'max-h-0'}`}>
                                <div className="p-6 pt-0 text-gray-600 leading-relaxed bg-white">
                                    {item.a}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Final */}
            <section className="py-24 bg-blue-600 relative overflow-hidden">
                {/* Patterns */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    <div className="absolute right-0 top-0 w-96 h-96 bg-white rounded-full blur-[100px] transform translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute left-0 bottom-0 w-96 h-96 bg-purple-500 rounded-full blur-[100px] transform -translate-x-1/2 translate-y-1/2"></div>
                </div>

                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">¿Listo para modernizar tu negocio?</h2>
                    <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">Únete a más de 500 empresas dominicanas que ya facturan sin papel y sin complicaciones.</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link to="/register" className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-blue-600 transition-all duration-200 bg-white rounded-full hover:bg-gray-100 shadow-xl">
                            Crear Cuenta Gratis
                        </Link>
                        <Link to="/contact" className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-transparent border-2 border-white/30 rounded-full hover:bg-white/10">
                            Hablar con Ventas
                        </Link>
                    </div>
                    <p className="mt-6 text-sm text-blue-200 opacity-80">No requiere tarjeta de crédito • 14 días de prueba gratis</p>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white pt-20 pb-10 border-t border-gray-100 text-gray-600">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">D</div>
                            <span className="text-xl font-bold text-gray-900">DigitBill</span>
                        </div>
                        <p className="text-sm leading-relaxed mb-6">
                            La solución integral para la facturación electrónica en República Dominicana. Simple, segura y cumpliendo con la DGII.
                        </p>
                        <div className="flex gap-4">
                            {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-blue-100 hover:text-blue-600 transition-colors flex items-center justify-center cursor-pointer"><Globe size={16} /></div>)}
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-900 mb-6">Producto</h4>
                        <ul className="space-y-4 text-sm">
                            <li><Link to="#" className="hover:text-blue-600 transition-colors">Características</Link></li>
                            <li><Link to="#" className="hover:text-blue-600 transition-colors">Precios</Link></li>
                            <li><Link to="#" className="hover:text-blue-600 transition-colors">API para Desarrolladores</Link></li>
                            <li><Link to="#" className="hover:text-blue-600 transition-colors">Casos de Éxito</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-900 mb-6">Compañía</h4>
                        <ul className="space-y-4 text-sm">
                            <li><Link to="#" className="hover:text-blue-600 transition-colors">Sobre Nosotros</Link></li>
                            <li><Link to="#" className="hover:text-blue-600 transition-colors">Carreras</Link></li>
                            <li><Link to="#" className="hover:text-blue-600 transition-colors">Blog</Link></li>
                            <li><Link to="#" className="hover:text-blue-600 transition-colors">Contacto</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-900 mb-6">Legal</h4>
                        <ul className="space-y-4 text-sm">
                            <li><Link to="#" className="hover:text-blue-600 transition-colors">Términos de Uso</Link></li>
                            <li><Link to="#" className="hover:text-blue-600 transition-colors">Privacidad</Link></li>
                            <li><Link to="#" className="hover:text-blue-600 transition-colors">Seguridad</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm">© 2024 DigitBill Dominicana S.R.L. Todos los derechos reservados.</p>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Sistemas Operativos
                    </div>
                </div>
            </footer>
        </div>
    );
};

const TestimonialCard = ({ quote, author, role, image }: { quote: string, author: string, role: string, image: string }) => (
    <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 hover:border-blue-500/50 transition-colors relative">
        <div className="mb-6 text-blue-400">
            <MessageSquare size={32} />
        </div>
        <p className="text-gray-300 text-lg italic mb-8 leading-relaxed">"{quote}"</p>
        <div className="flex items-center gap-4">
            <img src={image} alt={author} className="w-12 h-12 rounded-full border-2 border-gray-600" />
            <div>
                <h4 className="font-bold text-white">{author}</h4>
                <p className="text-sm text-gray-400">{role}</p>
            </div>
        </div>
    </div>
);
