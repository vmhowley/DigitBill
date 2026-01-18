import { ArrowRight, XCircle, PartyPopper } from 'lucide-react';
import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export const PaymentSuccess: React.FC = () => {
    const { fetchProfile } = useAuth();
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');

    useEffect(() => {
        const verify = async () => {
            if (sessionId) {
                try {
                    // Force update on backend
                    await api.post('/api/subscriptions/verify-session', { sessionId });
                    // Then refresh local profile
                    await fetchProfile();
                } catch (err) {
                    console.error('Verification failed', err);
                }
            } else {
                // Fallback if no session ID (webhook dependent)
                setTimeout(() => fetchProfile(), 2000);
            }
        };
        verify();
    }, [sessionId]);

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 bg-gradient-to-b from-white to-green-50/30">
            <div className="max-w-md w-full text-center">
                <div className="mb-8 flex justify-center relative">
                    <div className="absolute inset-0 bg-green-200 blur-3xl opacity-20 rounded-full animate-pulse"></div>
                    <div className="bg-green-100 p-6 rounded-3xl text-green-600 relative animate-bounce shadow-xl shadow-green-100/50">
                        <PartyPopper size={64} />
                    </div>
                </div>

                <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                    ¡Bienvenido a la Nueva Era!
                </h1>

                <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                    Estamos encantados de tenerte de vuelta. Tu pago ha sido procesado con éxito y tu sistema ha sido
                    <span className="font-bold text-green-600"> totalmente reactivado</span>.
                    ¡Sigamos construyendo algo grande juntos!
                </p>

                <div className="space-y-4">
                    <Link
                        to="/dashboard"
                        className="w-full inline-flex items-center justify-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-gray-200 group"
                    >
                        Entrar al Dashboard
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <p className="text-sm text-gray-400 font-medium">
                        Tu factura llegará a tu correo en unos minutos.
                    </p>
                </div>
            </div>
        </div>
    );
};

export const PaymentCancel: React.FC = () => {
    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                <div className="mb-6 flex justify-center">
                    <div className="bg-red-100 p-4 rounded-full text-red-600">
                        <XCircle size={64} />
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Pago Cancelado</h1>
                <p className="text-gray-500 mb-8">
                    El proceso de pago no fue completado. No se ha realizado ningún cargo a tu cuenta.
                </p>
                <div className="flex flex-col gap-3">
                    <Link
                        to="/upgrade"
                        className="inline-flex items-center justify-center gap-2 bg-gray-900 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-black transition-all"
                    >
                        Reintentar Actualización
                    </Link>
                    <Link
                        to="/dashboard"
                        className="text-gray-500 font-medium hover:text-gray-700 underline"
                    >
                        Volver al Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
};
