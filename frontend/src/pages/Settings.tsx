import { Building2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import axios from '../api';
import { CompanySettings } from '../components/settings/CompanySettings';
import { SecuritySettings } from '../components/settings/SecuritySettings';
import { SequenceSettings } from '../components/settings/SequenceSettings';
import { UserSettings } from '../components/settings/UserSettings';

export const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState('company');
    const [company, setCompany] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [sequences, setSequences] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [companyRes, usersRes, sequencesRes] = await Promise.all([
                axios.get('/api/settings/company'),
                axios.get('/api/settings/users'),
                axios.get('/api/settings/sequences')
            ]);
            setCompany(companyRes.data);
            setUsers(usersRes.data);
            setSequences(sequencesRes.data);
        } catch (err) {
            console.error(err);
            toast.error('Error cargando configuración');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const onUpdateCompany = async (data: any) => {
        try {
            await axios.put('/api/settings/company', data);
            toast.success('Información actualizada');
            fetchAllData();
        } catch (err) {
            toast.error('Error al guardar');
        }
    };

    const onUpdateSequence = async (id: number, next_number: number, end_date: string, current_end_number?: number) => {
        try {
            await axios.put(`/api/settings/sequences/${id}`, { next_number, end_date, current_end_number });
            toast.success('Secuencia actualizada');
            fetchAllData();
        } catch (err) {
            toast.error('Error actualizando secuencia');
        }
    }

    if (loading) return <div>Cargando configuración...</div>;

    return (
        <div>
            <div className="flex items-center gap-3 mb-8">
                <div className="bg-slate-100 dark:bg-background-dark p-3 rounded-xl border border-slate-200 dark:border-border-dark">
                    <Building2 className="text-slate-600 dark:text-slate-400 w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Configuración</h1>
                    <p className="text-gray-500 dark:text-slate-400">Administra tu empresa, usuarios y secuencias fiscales.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-border-dark mb-8 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('company')}
                    className={`px-6 py-3 font-bold text-sm transition-colors relative ${activeTab === 'company' ? 'text-primary dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                >
                    Empresa
                    {activeTab === 'company' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary dark:bg-blue-400 rounded-t-full"></div>}
                </button>
                <button
                    onClick={() => setActiveTab('sequences')}
                    className={`px-6 py-3 font-bold text-sm transition-colors relative ${activeTab === 'sequences' ? 'text-primary dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                >
                    Secuencias Fiscales (NCF)
                    {activeTab === 'sequences' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary dark:bg-blue-400 rounded-t-full"></div>}
                </button>
                <button
                    onClick={() => setActiveTab('users')}
                    className={`px-6 py-3 font-bold text-sm transition-colors relative ${activeTab === 'users' ? 'text-primary dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                >
                    Usuarios
                    {activeTab === 'users' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary dark:bg-blue-400 rounded-t-full"></div>}
                </button>
                <button
                    onClick={() => setActiveTab('security')}
                    className={`px-6 py-3 font-bold text-sm transition-colors relative ${activeTab === 'security' ? 'text-primary dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                >
                    Seguridad
                    {activeTab === 'security' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary dark:bg-blue-400 rounded-t-full"></div>}
                </button>
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm border border-slate-100 dark:border-border-dark p-8">

                {/* COMPANY TAB */}
                {activeTab === 'company' && (
                    <CompanySettings defaultValues={company} onSave={onUpdateCompany} />
                )}

                {/* SEQUENCES TAB */}
                {activeTab === 'sequences' && (
                    <SequenceSettings sequences={sequences} onUpdate={onUpdateSequence} />
                )}

                {/* USERS TAB */}
                {activeTab === 'users' && (
                    <UserSettings users={users} onRefresh={fetchAllData} />
                )}

                {/* SECURITY TAB */}
                {activeTab === 'security' && (
                    <SecuritySettings />
                )}
            </div>
        </div>
    );
};
