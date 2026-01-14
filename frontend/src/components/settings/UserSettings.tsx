import { UserPlus } from 'lucide-react';
import React, { useState } from 'react';
import { InviteUserModal } from './InviteUserModal'; // Ensure this path is correct

interface User {
    id: number;
    username: string;
    role: string;
    created_at: string;
}

interface UserSettingsProps {
    users: User[];
    onRefresh?: () => void; // Add callback to refresh list
}

export const UserSettings: React.FC<UserSettingsProps> = ({ users, onRefresh }) => {
    const [isInviteOpen, setIsInviteOpen] = useState(false);

    return (
        <div>
            <InviteUserModal
                isOpen={isInviteOpen}
                onClose={() => setIsInviteOpen(false)}
                onSuccess={() => {
                    if (onRefresh) onRefresh();
                }}
            />

            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-700 dark:text-white">Usuarios Activos</h3>
                <button
                    onClick={() => setIsInviteOpen(true)}
                    className="bg-primary text-white text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-all shadow-sm shadow-blue-200 dark:shadow-none"
                >
                    <UserPlus size={18} /> Agregar Usuario
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-slate-200 dark:border-border-dark text-slate-500 dark:text-slate-400 text-sm">
                            <th className="py-3 px-4 font-bold">Usuario / Email</th>
                            <th className="py-3 px-4 font-bold">Rol</th>
                            <th className="py-3 px-4 text-right font-bold">Fecha Registro</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-border-dark">
                        {users.map((u) => (
                            <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="py-3 px-4 font-bold text-slate-800 dark:text-white">{u.username}</td>
                                <td className="py-3 px-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${u.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300' :
                                        u.role === 'accountant' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300' :
                                            'bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300'
                                        }`}>
                                        {u.role.toUpperCase()}
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-right text-slate-500 dark:text-slate-400 text-sm">{new Date(u.created_at).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
