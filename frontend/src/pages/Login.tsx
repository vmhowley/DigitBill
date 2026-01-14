import { ArrowRight, KeyRound, Loader, Lock, Mail, ShieldCheck } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

export const Login = () => {
    const navigate = useNavigate();
    const { needsMFA, session } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [verifyCode, setVerifyCode] = useState('');
    const [showMFA, setShowMFA] = useState(false);

    useEffect(() => {
        if (session) {
            navigate('/dashboard');
        }
        if (needsMFA) {
            setShowMFA(true);
        }
    }, [needsMFA]);

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                toast.error(error.message === 'Invalid login credentials'
                    ? 'Credenciales incorrectas'
                    : 'Error al iniciar sesión');
            } else {
                toast.success('¡Bienvenido!');
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
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-background-dark px-4 font-manrope">
            <div className="max-w-md w-full bg-white dark:bg-card-dark rounded-2xl shadow-xl dark:shadow-none dark:border dark:border-border-dark overflow-hidden">
                <div className="p-8">
                    {!showMFA ? (
                        <>
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Bienvenido de nuevo</h2>
                                <p className="text-gray-500 dark:text-slate-400 mt-2">Ingresa a tu cuenta para gestionar tu facturación.</p>
                            </div>

                            <form onSubmit={handleLogin} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Correo Electrónico</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 text-gray-400 dark:text-slate-500" size={20} />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-border-dark bg-white dark:bg-background-dark text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-slate-500"
                                            placeholder="tu@empresa.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Contraseña</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 text-gray-400 dark:text-slate-500" size={20} />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-border-dark bg-white dark:bg-background-dark text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-slate-500"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30 dark:shadow-none flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? <Loader className="animate-spin" size={20} /> : <>Ingresar <ArrowRight size={20} /></>}
                                </button>
                            </form>

                            <div className="mt-8 text-center border-t border-gray-100 dark:border-border-dark pt-6">
                                <p className="text-gray-600 dark:text-slate-400 text-sm">
                                    ¿Nuevo en DigitBill?{' '}
                                    <button
                                        type="button"
                                        onClick={() => navigate('/register')}
                                        className="text-primary hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-bold hover:underline underline-offset-4"
                                    >
                                        Crea tu cuenta gratis
                                    </button>
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="text-center mb-8">
                                <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-500/20 rounded-full flex items-center justify-center mb-4 text-primary dark:text-blue-400">
                                    <ShieldCheck size={32} />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Verificación 2FA</h2>
                                <p className="text-gray-500 dark:text-slate-400 mt-2">Ingresa el código de 6 dígitos de tu aplicación de autenticación.</p>
                            </div>

                            <form onSubmit={handleVerifyMFA} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Código de Seguridad</label>
                                    <div className="relative">
                                        <KeyRound className="absolute left-3 top-3 text-gray-400 dark:text-slate-500" size={20} />
                                        <input
                                            type="text"
                                            value={verifyCode}
                                            onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-border-dark bg-white dark:bg-background-dark text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-center text-2xl tracking-[0.5em] font-mono"
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
                                    className="w-full bg-primary hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30 dark:shadow-none flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? <Loader className="animate-spin" size={20} /> : 'Verificar'}
                                </button>

                                <button
                                    type="button"
                                    onClick={async () => await supabase.auth.signOut()}
                                    className="w-full text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 text-sm font-bold"
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
