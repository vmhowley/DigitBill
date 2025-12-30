import { ArrowRight, KeyRound, Loader, Lock, ShieldCheck } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
export const ResetPassword = () => {
    // const { needsMFA } = useAuth(); // Removed as per instruction
    // const [email, setEmail] = useState(''); // Removed as per instruction
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [verifyCode, setVerifyCode] = useState('');
    const [showMFA] = useState(false);

    const navigate = useNavigate();
    const handleResetPassword = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        if (password !== confirmPassword) {
            toast.error('Las contraseñas no coinciden');
            return;
        }
        try {
            const { error } = await supabase.auth.updateUser({
                password,
            });

            if (error) {
                toast.error(error.message);
            } else {
                toast.success('¡Contraseña restablecida!');
                navigate('/dashboard');
                // AuthContext will handle state change to needsMFA if required
            }
        } catch (error) {
            toast.error('Ocurrió un error inesperado');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyMFA = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data, error } = await supabase.auth.mfa.listFactors();
            if (error) throw error;

            const totpFactor = data.totp.find(f => f.status === 'verified');
            if (!totpFactor) throw new Error('No valid 2FA factor found');

            const challenge = await supabase.auth.mfa.challenge({ factorId: totpFactor.id });
            if (challenge.error) throw challenge.error;

            const verify = await supabase.auth.mfa.verify({
                factorId: totpFactor.id,
                challengeId: challenge.data.id,
                code: verifyCode,
            });

            if (verify.error) throw verify.error;

            toast.success('Verificación exitosa');

            // Force session refresh
            const { error: sessionError } = await supabase.auth.getSession();
            if (sessionError) throw sessionError;

            // Redirect to dashboard to clear Login component state logic
            window.location.href = '/dashboard';

        } catch (err: any) {
            console.error(err);
            toast.error(err.message || 'Código incorrecto');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-8">
                    {!showMFA ? (
                        <>
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold text-gray-900">Restablecer Contraseña</h2>
                                <p className="text-gray-500 mt-2">Ingresa tu correo electrónico para restablecer tu contraseña.</p>
                            </div>

                            <form onSubmit={handleResetPassword} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Contraseña</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? <Loader className="animate-spin" size={20} /> : <>Ingresar <ArrowRight size={20} /></>}
                                </button>
                            </form>
                        </>
                    ) : (
                        <>
                            <div className="text-center mb-8">
                                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600">
                                    <ShieldCheck size={32} />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Verificación 2FA</h2>
                                <p className="text-gray-500 mt-2">Ingresa el código de 6 dígitos de tu aplicación de autenticación.</p>
                            </div>

                            <form onSubmit={handleVerifyMFA} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Código de Seguridad</label>
                                    <div className="relative">
                                        <KeyRound className="absolute left-3 top-3 text-gray-400" size={20} />
                                        <input
                                            type="text"
                                            value={verifyCode}
                                            onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-center text-2xl tracking-[0.5em] font-mono"
                                            placeholder="000000"
                                            maxLength={6}
                                            autoFocus
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || verifyCode.length !== 6}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? <Loader className="animate-spin" size={20} /> : 'Verificar'}
                                </button>

                                <button
                                    type="button"
                                    onClick={async () => await supabase.auth.signOut()}
                                    className="w-full text-gray-500 hover:text-gray-700 text-sm font-medium"
                                >
                                    Cancelar / Cerrar Sesión
                                </button>
                            </form>
                        </>
                    )}

                    {/* Registration disabled for public users */}

                </div>
            </div>
        </div>
    );
};
