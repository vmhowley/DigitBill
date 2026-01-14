import { Mail, Shield, X } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import axios from '../../api';

interface InviteUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const InviteUserModal: React.FC<InviteUserModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('user');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await axios.post('/api/settings/users/invite', { email, role });
            toast.success('Invitación enviada correctamente');
            onSuccess();
            onClose();
            setEmail('');
            setRole('user');
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.error || 'Error al enviar invitación');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-card-dark rounded-2xl w-full max-w-md shadow-xl dark:shadow-none dark:border dark:border-border-dark">
                <div className="p-6 border-b border-gray-100 dark:border-border-dark flex justify-between items-center bg-gray-50/50 dark:bg-background-dark/50 rounded-t-2xl">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Invitar Usuario</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 dark:text-slate-300 block">Correo Electrónico</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" size={18} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-border-dark bg-white dark:bg-background-dark text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                                placeholder="colaborador@empresa.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 dark:text-slate-300 block">Rol / Permisos</label>
                        <div className="relative">
                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" size={18} />
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-border-dark bg-white dark:bg-background-dark text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none appearance-none"
                            >
                                <option value="user">Usuario Básico (Facturar)</option>
                                <option value="accountant">Contable (Ver Reportes)</option>
                                <option value="admin">Administrador (Control Total)</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 px-4 border border-gray-200 dark:border-border-dark text-gray-600 dark:text-slate-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex-1 py-2.5 px-4 bg-primary text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-200 dark:shadow-none ${loading ? 'opacity-70 cursor-wait' : ''}`}
                        >
                            {loading ? 'Enviando...' : 'Enviar Invitación'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
