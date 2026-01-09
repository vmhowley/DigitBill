import { ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
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
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                <div className="mb-6 flex justify-center">
                    <div className="bg-green-100 p-4 rounded-full text-green-600 animate-bounce">
                        <CheckCircle2 size={64} />
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Pago Exitoso!</h1>
                <p className="text-gray-500 mb-8">
                    Tu plan ha sido actualizado correctamente. Ya puedes disfrutar de todas las nuevas funciones habilitadas para tu cuenta.
                </p>
                <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                >
                    Ir al Dashboard <ArrowRight size={20} />
                </Link>
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
