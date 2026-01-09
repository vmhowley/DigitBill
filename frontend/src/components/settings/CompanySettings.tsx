import { CheckCircle, FileUp, Lock, Save } from 'lucide-react';
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
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.error || 'Error al subir el certificado');
        } finally {
            setUploading(false);
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Razón Social</label>
                    <input {...register('name')} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">RNC / Cédula</label>
                    <input {...register('rnc')} disabled className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed" title="Contacta soporte para cambiar esto" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input {...register('phone')} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Corporativo</label>
                    <input {...register('email')} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dirección Física</label>
                    <input {...register('address')} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>

                <div className={`md:col-span-2 p-6 rounded-2xl border space-y-4 ${canEnableECF ? 'bg-blue-50/50 border-blue-100' : 'bg-gray-50 border-gray-200'}`}>
                    <label className={`flex items-center gap-3 cursor-pointer group ${!canEnableECF ? 'pointer-events-none' : ''}`}>
                        <div className="relative">
                            <input
                                type="checkbox"
                                {...register('electronic_invoicing')}
                                className="sr-only peer"
                                disabled={!canEnableECF}
                            />
                            <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${!canEnableECF ? 'bg-gray-300' : 'bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:bg-blue-600'}`}></div>
                        </div>
                        <div>
                            <span className={`text-sm font-bold transition-colors ${!canEnableECF ? 'text-gray-400' : 'text-gray-900 group-hover:text-blue-600'}`}>Facturación Electrónica Activa</span>
                            {!canEnableECF ? (
                                <div className="flex items-center gap-1 text-xs text-orange-600 font-medium mt-0.5">
                                    <Lock size={12} /> Desbloquea con Plan Pyme
                                </div>
                            ) : (
                                <p className="text-xs text-gray-500">Habilita la firma digital y el envío automático a la DGII.</p>
                            )}
                        </div>
                    </label>

                    {canEnableECF && (
                        <>
                            <div className="pt-4 border-t border-blue-100">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña del Certificado (.p12)</label>
                                <input
                                    type="password"
                                    {...register('certificate_password')}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                    placeholder="••••••••"
                                />
                                <p className="text-[10px] text-gray-400 mt-1 italic">La contraseña se encripta para mayor seguridad.</p>
                            </div>

                            <div className="pt-4 border-t border-blue-100">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Archivo del Certificado (.p12 / .pfx)</label>
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
                                            className="flex items-center justify-between w-full px-4 py-2 border border-dashed rounded-lg cursor-pointer hover:bg-white transition-colors bg-white/50"
                                        >
                                            <span className="text-sm text-gray-500 truncate mr-2">
                                                {certFile ? certFile.name : (defaultValues?.certificate_path?.split(/[\\/]/).pop() || 'Seleccionar archivo...')}
                                            </span>
                                            <FileUp size={18} className="text-blue-500 flex-shrink-0" />
                                        </label>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleFileUpload}
                                        disabled={!certFile || uploading}
                                        className="bg-blue-600 border border-blue-600 disabled:bg-gray-100 disabled:border-gray-200 disabled:text-gray-400 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all hover:bg-blue-700 active:scale-95 flex items-center gap-2 whitespace-nowrap"
                                    >
                                        {uploading ? 'Subiendo...' : 'Subir'}
                                    </button>
                                </div>
                                {defaultValues?.certificate_path && !certFile && (
                                    <div className="flex items-center gap-1 mt-1 text-[10px] text-green-600">
                                        <CheckCircle size={10} /> Certificado configurado
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
            <div className="flex justify-end pt-4 border-t">
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors">
                    <Save size={18} /> Guardar Cambios
                </button>
            </div>
        </form>
    );
};
