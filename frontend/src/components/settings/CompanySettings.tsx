import { Save } from 'lucide-react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';

interface CompanySettingsProps {
    defaultValues: any;
    onSave: (data: any) => Promise<void>;
}

export const CompanySettings: React.FC<CompanySettingsProps> = ({ defaultValues, onSave }) => {
    const { register, handleSubmit, reset } = useForm();

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
                <div className="md:col-span-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative">
                            <input
                                type="checkbox"
                                {...register('electronic_invoicing')}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </div>
                        <div>
                            <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">Facturación Electrónica</span>
                            <p className="text-xs text-gray-500">Activa el envío de comprobantes e-CF a la DGII y firma digital.</p>
                        </div>
                    </label>
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
