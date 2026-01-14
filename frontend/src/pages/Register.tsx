import { ArrowRight, Briefcase, Building2, Lock, Mail, MapPin, Phone, User } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../api';

export const Register: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = async (data: any) => {
        setLoading(true);
        try {
            await axios.post('/api/auth/public/register', {
                ...data,
                plan: 'free' // Basic registration is always free
            });
            toast.success('¡Registro exitoso! Ya puedes iniciar sesión.');
            navigate('/login');
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.error || 'Error al registrarse. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-background-dark flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-manrope">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="bg-primary p-3 rounded-2xl shadow-lg shadow-blue-600/20">
                        <Building2 className="text-white w-10 h-10" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                    Crea tu cuenta en DigitBill
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 dark:text-slate-400">
                    Empieza gratis y escala tu negocio cuando lo necesites
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
                <div className="bg-white dark:bg-card-dark py-8 px-4 shadow-xl shadow-blue-900/5 dark:shadow-none dark:border dark:border-border-dark sm:rounded-3xl sm:px-10 border border-slate-100">
                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Company Information */}
                            <div className="col-span-2">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-4">
                                    <Briefcase size={18} className="text-primary dark:text-blue-400" /> Datos de la Empresa
                                </h3>
                            </div>

                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300">Nombre de la Empresa</label>
                                <div className="mt-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Building2 className="h-5 w-5 text-gray-400 dark:text-slate-500" />
                                    </div>
                                    <input
                                        required
                                        {...register('company_name', { required: 'El nombre es obligatorio' })}
                                        className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 dark:border-border-dark dark:bg-background-dark dark:text-white rounded-xl shadow-sm placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                        placeholder="Ej: Mi Negocio SRL"
                                    />
                                </div>
                                {errors.company_name && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.company_name.message as string}</p>}
                            </div>

                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300">RNC o Cédula</label>
                                <div className="mt-1 relative">
                                    <div className="absolute  inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400 dark:text-slate-500" />
                                    </div>
                                    <input
                                        required
                                        {...register('rnc', { required: 'El RNC es obligatorio' })}
                                        className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 dark:border-border-dark dark:bg-background-dark dark:text-white rounded-xl shadow-sm placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                        placeholder="Ej: 101-00000-1"
                                    />
                                </div>
                                {errors.rnc && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.rnc.message as string}</p>}
                            </div>

                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300">Teléfono</label>
                                <div className="mt-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Phone className="h-5 w-5 text-gray-400 dark:text-slate-500" />
                                    </div>
                                    <input
                                        required
                                        {...register('phone')}
                                        className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 dark:border-border-dark dark:bg-background-dark dark:text-white rounded-xl shadow-sm placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                        placeholder="809-000-0000"
                                    />
                                </div>
                            </div>

                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300">Tipo de Contribuyente</label>
                                <select
                                    {...register('type')}
                                    className="mt-1 border block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-border-dark dark:bg-background-dark dark:text-white focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-xl"
                                >
                                    <option value="juridico">Persona Jurídica</option>
                                    <option value="fisico">Persona Física</option>
                                </select>
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300">Dirección</label>
                                <div className="mt-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <MapPin className="h-5 w-5 text-gray-400 dark:text-slate-500" />
                                    </div>
                                    <input
                                        required
                                        {...register('address')}
                                        className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 dark:border-border-dark dark:bg-background-dark dark:text-white rounded-xl shadow-sm placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                        placeholder="Ave. Churchill #123, Santo Domingo"
                                    />
                                </div>
                            </div>

                            {/* User Information */}
                            <div className="col-span-2 mt-6">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-4">
                                    <User size={18} className="text-primary dark:text-blue-400" /> Credenciales de Acceso
                                </h3>
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300">Email del Administrador</label>
                                <div className="mt-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400 dark:text-slate-500" />
                                    </div>
                                    <input
                                        required
                                        type="email"
                                        {...register('email', { required: 'El email es obligatorio' })}
                                        className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 dark:border-border-dark dark:bg-background-dark dark:text-white rounded-xl shadow-sm placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                        placeholder="admin@empresa.com"
                                    />
                                </div>
                                {errors.email && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.email.message as string}</p>}
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300">Contraseña</label>
                                <div className="mt-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400 dark:text-slate-500" />
                                    </div>
                                    <input
                                        required
                                        type="password"
                                        {...register('password', {
                                            required: 'La contraseña es obligatoria',
                                            minLength: { value: 6, message: 'Mínimo 6 caracteres' }
                                        })}
                                        className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 dark:border-border-dark dark:bg-background-dark dark:text-white rounded-xl shadow-sm placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                        placeholder="••••••••"
                                    />
                                </div>
                                {errors.password && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.password.message as string}</p>}
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-500/30 text-sm font-bold text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 gap-2 items-center"
                            >
                                {loading ? 'Creando cuenta...' : 'Crear mi cuenta gratis'}
                                {!loading && <ArrowRight size={18} />}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600 dark:text-slate-400">
                            ¿Ya tienes una cuenta?{' '}
                            <Link to="/login" className="font-bold text-primary dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 underline decoration-blue-200 dark:decoration-blue-800 decoration-2 underline-offset-4">
                                Inicia sesión aquí
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
