import { AlertTriangle, CheckCircle, FileUp, Lock, Save, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import axios from '../../api';
import { useAuth } from '../../context/AuthContext';

interface CompanySettingsProps {
    defaultValues: any;
    onSave: (data: any) => Promise<void>;
}

export const CompanySettings: React.FC<CompanySettingsProps> = ({ defaultValues, onSave }) => {
    const { register, handleSubmit, reset } = useForm();
    const [uploading, setUploading] = useState(false);
    const [certFile, setCertFile] = useState<File | null>(null);
    const { profile } = useAuth();

    const plan = profile?.plan || 'free';
    const canEnableECF = ['pyme', 'enterprise'].includes(plan);

    const handleFileUpload = async () => {
        if (!certFile) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('certificate', certFile);

        try {
            await axios.post('/api/settings/upload-certificate', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Certificado subido correctamente');
            setCertFile(null);
            // We don't necessarily need to reset the whole form, 
            // the backend just updated company_settings
            // the backend just updated company_settings
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.error || 'Error al subir el certificado');
        } finally {
            setUploading(false);
        }
    };

    const handleReset = async () => {
        const input = window.prompt("⚠️ PELIGRO CRÍTICO ⚠️\n\nEsta acción borrará PERMANENTEMENTE:\n- Todas las facturas y cotizaciones\n- Todos los clientes y proveedores\n- Todo el inventario y configuraciones\n\nPara confirmar, escribe textualmente: BORRAR TODO");

        if (input === "BORRAR TODO") {
            try {
                await axios.post('/api/settings/reset-data');
                toast.success('Base de datos reseteada correctamente');
                window.location.reload();
            } catch (error) {
                console.error(error);
                toast.error('Error al resetear la base de datos');
            }
        }
    };

    useEffect(() => {
        if (defaultValues) {
            reset(defaultValues);
        }
    }, [defaultValues, reset]);

    return (
        <form onSubmit={handleSubmit(onSave)} className="max-w-3xl space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Razón Social</label>
                    <input {...register('name')} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white dark:bg-background-dark dark:border-border-dark dark:text-white dark:focus:bg-card-dark" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">RNC / Cédula</label>
                    <input {...register('rnc')} disabled className="w-full px-4 py-2 border rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed dark:bg-background-dark/50 dark:border-border-dark dark:text-slate-500" title="Contacta soporte para cambiar esto" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Teléfono</label>
                    <input {...register('phone')} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white dark:bg-background-dark dark:border-border-dark dark:text-white dark:focus:bg-card-dark" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Email Corporativo</label>
                    <input {...register('email')} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white dark:bg-background-dark dark:border-border-dark dark:text-white dark:focus:bg-card-dark" />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Dirección Física</label>
                    <input {...register('address')} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white dark:bg-background-dark dark:border-border-dark dark:text-white dark:focus:bg-card-dark" />
                </div>

                <div className={`md:col-span-2 p-6 rounded-2xl border space-y-4 ${canEnableECF ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800/30' : 'bg-slate-50 border-slate-200 dark:bg-background-dark/30 dark:border-border-dark'}`}>
                    <label className={`flex items-center gap-3 cursor-pointer group ${!canEnableECF ? 'pointer-events-none' : ''}`}>
                        <div className="relative">
                            <input
                                type="checkbox"
                                {...register('electronic_invoicing')}
                                className="sr-only peer"
                                disabled={!canEnableECF}
                            />
                            <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${!canEnableECF ? 'bg-gray-300 dark:bg-slate-600' : 'bg-gray-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:bg-primary'}`}></div>
                        </div>
                        <div>
                            <span className={`text-sm font-bold transition-colors ${!canEnableECF ? 'text-gray-400 dark:text-slate-500' : 'text-gray-900 dark:text-white group-hover:text-primary dark:group-hover:text-blue-400'}`}>Facturación Electrónica Activa</span>
                            {!canEnableECF ? (
                                <div className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400 font-bold mt-0.5">
                                    <Lock size={12} /> Desbloquea con Plan Pyme
                                </div>
                            ) : (
                                <p className="text-xs text-gray-500 dark:text-slate-400">Habilita la firma digital y el envío automático a la DGII.</p>
                            )}
                        </div>
                    </label>

                    {canEnableECF && (
                        <>
                            <div className="pt-4 border-t border-blue-100 dark:border-blue-800/30">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Contraseña del Certificado (.p12)</label>
                                <input
                                    type="password"
                                    {...register('certificate_password')}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white dark:bg-background-dark dark:border-border-dark dark:text-white dark:focus:bg-card-dark"
                                    placeholder="••••••••"
                                />
                                <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1 italic">La contraseña se encripta para mayor seguridad.</p>
                            </div>

                            <div className="pt-4 border-t border-blue-100 dark:border-blue-800/30">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Archivo del Certificado (.p12 / .pfx)</label>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 relative">
                                        <input
                                            type="file"
                                            accept=".p12,.pfx"
                                            onChange={(e) => setCertFile(e.target.files?.[0] || null)}
                                            className="hidden"
                                            id="cert-upload"
                                        />
                                        <label
                                            htmlFor="cert-upload"
                                            className="flex items-center justify-between w-full px-4 py-2 border border-dashed rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors bg-white/50 dark:bg-background-dark/50 dark:border-border-dark"
                                        >
                                            <span className="text-sm text-slate-500 dark:text-slate-400 truncate mr-2">
                                                {certFile ? certFile.name : (defaultValues?.certificate_path?.split(/[\\/]/).pop() || 'Seleccionar archivo...')}
                                            </span>
                                            <FileUp size={18} className="text-primary dark:text-blue-400 shrink-0" />
                                        </label>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleFileUpload}
                                        disabled={!certFile || uploading}
                                        className="bg-primary hover:bg-blue-700 border border-transparent disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:border-slate-200 dark:disabled:border-slate-700 disabled:text-slate-400 dark:disabled:text-slate-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all active:scale-95 flex items-center gap-2 whitespace-nowrap"
                                    >
                                        {uploading ? 'Subiendo...' : 'Subir'}
                                    </button>
                                </div>
                                {defaultValues?.certificate_path && !certFile && (
                                    <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-600 dark:text-emerald-400">
                                        <CheckCircle size={10} /> Certificado configurado
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-border-dark">
                <button type="submit" className="bg-primary hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 font-bold transition-colors">
                    <Save size={18} /> Guardar Cambios
                </button>
            </div>

            <div className="mt-12 pt-8 border-t border-rose-200 dark:border-rose-900/30">
                <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="text-rose-500" size={24} />
                    <h3 className="text-lg font-bold text-rose-700 dark:text-rose-400">Zona de Peligro</h3>
                </div>

                <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-xl p-6">
                    <h4 className="font-bold text-rose-800 dark:text-rose-300 mb-2">Reiniciar Base de Datos</h4>
                    <p className="text-sm text-rose-700 dark:text-rose-400 mb-6">
                        Esta acción eliminará todos los datos transaccionales (facturas, pagos, clientes, productos) de tu cuenta.
                        Úsalo solo si deseas empezar desde cero. <span className="font-bold">Esta acción no se puede deshacer.</span>
                    </p>
                    <button
                        type="button"
                        onClick={handleReset}
                        className="bg-white dark:bg-transparent border-2 border-rose-600 text-rose-600 dark:text-rose-400 dark:border-rose-500 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600 dark:hover:text-white px-6 py-2.5 rounded-lg font-bold transition-all flex items-center gap-2 shadow-sm"
                    >
                        <Trash2 size={18} /> Borrar todos mis datos
                    </button>
                </div>
            </div>
        </form>
    );
};
