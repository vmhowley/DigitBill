import { Loader2, Shield, ShieldCheck } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../supabaseClient';

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
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Seguridad de la Cuenta</h2>

            <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-lg p-6">
                <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                        <div className={`p-3 rounded-full ${status === 'enabled' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                            {status === 'enabled' ? <ShieldCheck size={24} /> : <Shield size={24} />}
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Autenticación de Dos Factores (2FA)</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                                Añade una capa extra de seguridad a tu cuenta requiriendo un código desde tu celular al iniciar sesión.
                            </p>

                            {status === 'enabled' && (
                                <div className="mt-2 flex items-center gap-2 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full w-fit text-sm font-bold">
                                    <ShieldCheck size={14} />
                                    2FA está activado
                                </div>
                            )}
                        </div>
                    </div>

                    {status === 'disabled' && !qrCode && (
                        <button
                            onClick={startEnrollment}
                            className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-colors"
                        >
                            Activar 2FA
                        </button>
                    )}

                    {status === 'enabled' && (
                        <button
                            onClick={unbindFactor}
                            className="text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10 px-4 py-2 rounded-lg font-bold transition-colors border border-rose-200 dark:border-rose-800/50"
                        >
                            Desactivar
                        </button>
                    )}
                </div>

                {qrCode && status === 'disabled' && (
                    <div className="mt-8 border-t border-slate-200 dark:border-border-dark pt-8 animate-in fade-in slide-in-from-top-4 duration-300">
                        <h4 className="font-bold mb-4 text-slate-800 dark:text-white">Configurar Authenticator</h4>
                        <div className="flex flex-col md:flex-row gap-8 items-center">
                            <div className="bg-white p-4 border rounded-xl shadow-sm flex flex-col items-center gap-2">
                                <QRCodeSVG value={qrCode || ''} size={160} level="L" marginSize={2} />
                                {secret && (
                                    <div className="text-center">
                                        <p className="text-xs text-slate-400 mb-1">¿No puedes escanear?</p>
                                        <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs select-all text-slate-700 dark:text-slate-300 font-mono break-all max-w-[160px] block border border-slate-200 dark:border-slate-700">
                                            {secret}
                                        </code>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 space-y-4">
                                <ol className="list-decimal ml-4 space-y-2 text-slate-600 dark:text-slate-300 text-sm">
                                    <li>Descarga una app de autenticación como <strong>Google Authenticator</strong> o <strong>Authy</strong>.</li>
                                    <li>Escanea el código QR que ves a la izquierda.</li>
                                    <li>Ingresa el código de 6 dígitos que genera la app.</li>
                                </ol>

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        maxLength={6}
                                        placeholder="000 000"
                                        className="border border-slate-200 dark:border-border-dark rounded-lg px-4 py-2 w-32 text-center text-lg tracking-widest focus:ring-2 focus:ring-primary outline-none bg-white dark:bg-background-dark dark:text-white"
                                        value={verifyCode}
                                        onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                                    />
                                    <button
                                        onClick={verifyEnrollment}
                                        disabled={verifyCode.length !== 6}
                                        className="bg-primary hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-bold"
                                    >
                                        Verificar y Activar
                                    </button>
                                </div>
                                <button onClick={() => setQrCode(null)} className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 underline">Cancelar</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
