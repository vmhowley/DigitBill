import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'react-hot-toast';
import { Shield, ShieldCheck, Loader2 } from 'lucide-react';

export const SecuritySettings: React.FC = () => {
    const [status, setStatus] = useState<'loading' | 'enabled' | 'disabled'>('loading');
    const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [secret, setSecret] = useState<string | null>(null);
    const [verifyCode, setVerifyCode] = useState('');

    useEffect(() => {
        checkStatus();
    }, []);

    const checkStatus = async () => {
        try {
            const { data, error } = await supabase.auth.mfa.listFactors();
            if (error) throw error;

            const totpFactor = data.totp.find(f => f.status === 'verified');
            if (totpFactor) {
                setStatus('enabled');
                setEnrollmentId(totpFactor.id);
            } else {
                setStatus('disabled');
            }
        } catch (err: any) {
            console.error(err);
            setStatus('disabled');
        }
    };

    const startEnrollment = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { data, error } = await supabase.auth.mfa.enroll({
                factorType: 'totp',
            });
            if (error) throw error;

            setEnrollmentId(data.id);
            
            const secret = (data.totp as any).secret;
            const issuer = 'DigitBill';
            const account = user?.email || 'Usuario';
            
            const customUri = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
            
            setQrCode(customUri);
            
            if (secret) {
                 setSecret(secret);
            }
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const verifyEnrollment = async () => {
        if (!enrollmentId) return;

        try {
            const challenge = await supabase.auth.mfa.challenge({ factorId: enrollmentId });
            if (challenge.error) throw challenge.error;

            const verify = await supabase.auth.mfa.verify({
                factorId: enrollmentId,
                challengeId: challenge.data.id,
                code: verifyCode,
            });
            if (verify.error) throw verify.error;

            toast.success('2FA Activado Correctamente');
            setStatus('enabled');
            setQrCode(null);
            setVerifyCode('');
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const unbindFactor = async () => {
        if (!enrollmentId) return;
        
        if (!window.confirm('¿Estás seguro de que deseas desactivar la autenticación de dos factores? Tu cuenta será menos segura.')) {
            return;
        }

        try {
            const { error } = await supabase.auth.mfa.unenroll({
                factorId: enrollmentId,
            });
            if (error) throw error;

            toast.success('2FA Desactivado');
            setStatus('disabled');
            setEnrollmentId(null);
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    if (status === 'loading') {
        return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
    }

    return (
        <div className="max-w-3xl">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Seguridad de la Cuenta</h2>
            
            <div className="bg-white border rounded-lg p-6">
                <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                        <div className={`p-3 rounded-full ${status === 'enabled' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                            {status === 'enabled' ? <ShieldCheck size={24} /> : <Shield size={24} />}
                        </div>
                        <div>
                            <h3 className="font-medium text-lg">Autenticación de Dos Factores (2FA)</h3>
                            <p className="text-gray-500 text-sm mt-1">
                                Añade una capa extra de seguridad a tu cuenta requiriendo un código desde tu celular al iniciar sesión.
                            </p>
                            
                            {status === 'enabled' && (
                                <div className="mt-2 flex items-center gap-2 text-green-700 bg-green-50 px-3 py-1 rounded-full w-fit text-sm">
                                    <ShieldCheck size={14} />
                                    2FA está activado
                                </div>
                            )}
                        </div>
                    </div>

                    {status === 'disabled' && !qrCode && (
                        <button 
                            onClick={startEnrollment}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                            Activar 2FA
                        </button>
                    )}

                    {status === 'enabled' && (
                        <button 
                            onClick={unbindFactor}
                            className="text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg font-medium transition-colors border border-red-200"
                        >
                            Desactivar
                        </button>
                    )}
                </div>

                {qrCode && status === 'disabled' && (
                    <div className="mt-8 border-t pt-8 animate-in fade-in slide-in-from-top-4 duration-300">
                        <h4 className="font-medium mb-4">Configurar Authenticator</h4>
                        <div className="flex flex-col md:flex-row gap-8 items-center">
                            <div className="bg-white p-4 border rounded-xl shadow-sm flex flex-col items-center gap-2">
                                <QRCodeSVG value={qrCode} size={160} level="L" marginSize={2} />
                                {secret && (
                                    <div className="text-center">
                                        <p className="text-xs text-gray-400 mb-1">¿No puedes escanear?</p>
                                        <code className="bg-gray-100 px-2 py-1 rounded text-xs select-all text-gray-700 font-mono break-all max-w-[160px] block border border-gray-200">
                                            {secret}
                                        </code>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 space-y-4">
                                <ol className="list-decimal ml-4 space-y-2 text-gray-600 text-sm">
                                    <li>Descarga una app de autenticación como <strong>Google Authenticator</strong> o <strong>Authy</strong>.</li>
                                    <li>Escanea el código QR que ves a la izquierda.</li>
                                    <li>Ingresa el código de 6 dígitos que genera la app.</li>
                                </ol>
                                
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        maxLength={6}
                                        placeholder="000 000"
                                        className="border rounded-lg px-4 py-2 w-32 text-center text-lg tracking-widest focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={verifyCode}
                                        onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                                    />
                                    <button
                                        onClick={verifyEnrollment}
                                        disabled={verifyCode.length !== 6}
                                        className="bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium"
                                    >
                                        Verificar y Activar
                                    </button>
                                </div>
                                <button onClick={() => setQrCode(null)} className="text-sm text-gray-500 underline">Cancelar</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
