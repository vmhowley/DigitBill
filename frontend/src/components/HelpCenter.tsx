
import { Book, HelpCircle, Mail, MessageCircle, Phone, Video, X } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';

export const HelpCenter = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'faq' | 'contact'>('faq');

    const faqs = [
        { q: '¿Cómo anular una factura?', a: 'Para anular una factura, ve al listado, selecciona la factura y usa la opción "Generar Nota de Crédito" para anularla fiscalmente.' },
        { q: '¿Cómo registrar un gasto?', a: 'Ve al módulo de Gastos > Nuevo Gasto. Asegúrate de tener el RNC del proveedor si es un gasto con valor fiscal.' },
        { q: '¿Qué hago si falla el envío a DGII?', a: 'Verifica tu conexión a internet y que el certificado digital no haya expirado. Si persiste, contacta a soporte.' },
    ];

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="size-10 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-card-dark transition-colors"
                title="Centro de Ayuda"
            >
                <HelpCircle size={20} className="text-slate-600 dark:text-slate-300" />
            </button>
        );
    }

    return createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-card-dark rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200 border border-slate-200 dark:border-border-dark">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-border-dark flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 rounded-t-2xl">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <HelpCircle className="text-primary" /> Centro de Ayuda
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Recursos y soporte para tu negocio</p>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-100 dark:border-border-dark">
                    <button
                        onClick={() => setActiveTab('faq')}
                        className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'faq' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        Preguntas Frecuentes
                    </button>
                    <button
                        onClick={() => setActiveTab('contact')}
                        className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'contact' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        Contacto y Soporte
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'faq' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                <a href="#" className="p-4 border border-slate-200 dark:border-border-dark rounded-xl hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group">
                                    <Video className="w-8 h-8 text-blue-500 mb-3 group-hover:scale-110 transition-transform" />
                                    <h3 className="font-bold text-slate-800 dark:text-white mb-1">Video Tutoriales</h3>
                                    <p className="text-xs text-slate-500">Aprende a usar la plataforma paso a paso.</p>
                                </a>
                                <a href="#" className="p-4 border border-slate-200 dark:border-border-dark rounded-xl hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all group">
                                    <Book className="w-8 h-8 text-emerald-500 mb-3 group-hover:scale-110 transition-transform" />
                                    <h3 className="font-bold text-slate-800 dark:text-white mb-1">Documentación</h3>
                                    <p className="text-xs text-slate-500">Guías detalladas de facturación y DGII.</p>
                                </a>
                            </div>

                            <h3 className="font-bold text-slate-800 dark:text-white mb-4">Preguntas Comunes</h3>
                            <div className="space-y-4">
                                {faqs.map((faq, idx) => (
                                    <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                                        <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2">{faq.q}</h4>
                                        <p className="text-sm text-slate-600 dark:text-slate-300">{faq.a}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'contact' && (
                        <div className="space-y-6">
                            <div className="text-center mb-8">
                                <div className="size-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <MessageCircle size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white">¿Necesitas ayuda personalizada?</h3>
                                <p className="text-slate-500">Nuestro equipo de soporte está disponible Lunes a Viernes de 8AM a 6PM.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4 p-4 border border-slate-200 dark:border-border-dark rounded-xl">
                                    <div className="bg-green-100 p-2 rounded-lg text-green-600">
                                        <MessageCircle size={24} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 dark:text-white">WhatsApp</p>
                                        <p className="text-sm text-slate-500">Chat directo con soporte</p>
                                    </div>
                                    <a href="https://wa.me/18290000000" target="_blank" className="ml-auto px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-bold hover:bg-green-600 transition-colors">
                                        Chatear
                                    </a>
                                </div>

                                <div className="flex items-center gap-4 p-4 border border-slate-200 dark:border-border-dark rounded-xl">
                                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                                        <Phone size={24} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 dark:text-white">Llamada</p>
                                        <p className="text-sm text-slate-500">809-555-5555</p>
                                    </div>
                                    <a href="tel:8095555555" className="ml-auto px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors">
                                        Llamar
                                    </a>
                                </div>

                                <div className="flex items-center gap-4 p-4 border border-slate-200 dark:border-border-dark rounded-xl">
                                    <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 dark:text-white">Correo Eléctronico</p>
                                        <p className="text-sm text-slate-500">soporte@digitbill.do</p>
                                    </div>
                                    <a href="mailto:soporte@digitbill.do" className="ml-auto px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors">
                                        Escribir
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};
