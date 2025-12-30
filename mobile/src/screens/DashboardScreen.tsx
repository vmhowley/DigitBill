import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

const DashboardScreen = () => {
    const { user, logout } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ totalRevenue: 0, count: 0 });
    const [recentInvoices, setRecentInvoices] = useState<any[]>([]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/invoices');
            const invoices = res.data;
            
            // Calculate stats (Align with Web Dashboard: ONLY signed or sent)
            const revenue = invoices
                .filter((i: any) => i.status === 'signed' || i.status === 'sent')
                .reduce((sum: number, inv: any) => sum + parseFloat(inv.total || 0), 0);
            
            setStats({
                totalRevenue: revenue,
                count: invoices.filter((i: any) => i.status === 'signed' || i.status === 'sent').length
            });
            
            // Get top 5 recent
            setRecentInvoices(invoices.slice(0, 5));
        } catch (error) {
            console.error('Error fetching dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(amount);
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="px-6 py-4 flex-row justify-between items-center bg-white shadow-sm z-10">
                <View>
                    <Text className="text-xl font-bold text-gray-800">Hola, {user?.username}!</Text>
                    <Text className="text-gray-500 text-xs">{user?.email}</Text>
                </View>
                <TouchableOpacity 
                    onPress={logout}
                    className="bg-red-50 px-3 py-1.5 rounded-lg border border-red-100"
                >
                    <Text className="text-red-600 font-medium text-xs">Salir</Text>
                </TouchableOpacity>
            </View>

            <ScrollView 
                className="flex-1 px-6 pt-6"
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={fetchDashboardData} />
                }
            >
                {/* Stats Card */}
                <View className="bg-blue-600 p-6 rounded-2xl shadow-lg mb-8">
                    <Text className="text-blue-100 text-sm mb-1 uppercase font-semibold tracking-wider">Total Facturado</Text>
                    <Text className="text-3xl font-bold text-white mb-2">{formatCurrency(stats.totalRevenue)}</Text>
                    <View className="flex-row items-center bg-blue-500 self-start px-3 py-1 rounded-full">
                        <Text className="text-white text-xs font-medium">{stats.count} facturas generadas</Text>
                    </View>
                </View>

                {/* Recent Activity */}
                <Text className="text-lg font-bold text-gray-800 mb-4">Actividad Reciente</Text>
                
                {recentInvoices.length === 0 && !loading && (
                    <Text className="text-gray-500 italic text-center py-8">No hay facturas recientes</Text>
                )}

                {recentInvoices.map((inv) => (
                    <View key={inv.id} className="bg-white p-4 rounded-xl border border-gray-100 mb-3 shadow-sm flex-row justify-between items-center">
                        <View>
                            <Text className="font-bold text-gray-800 text-base">{inv.client_name || 'Cliente Desconocido'}</Text>
                            <Text className="text-gray-500 text-xs mt-0.5">
                                {new Date(inv.created_at).toLocaleDateString()} • {inv.type_code === '01' ? 'Crédito Fiscal' : 'Consumo'}
                            </Text>
                        </View>
                        <View className="items-end">
                            <Text className="font-bold text-gray-900">{formatCurrency(inv.total)}</Text>
                            <StatusBadge status={inv.status} />
                        </View>
                    </View>
                ))}
                
                <View className="h-10" />
            </ScrollView>
        </SafeAreaView>
    );
};

const StatusBadge = ({ status }: { status: string }) => {
    let colorClass = 'bg-gray-100 text-gray-600';
    let label = status;

    switch(status) {
        case 'draft':
            colorClass = 'bg-gray-100 text-gray-600';
            label = 'Borrador';
            break;
        case 'signed':
            colorClass = 'bg-blue-100 text-blue-600';
            label = 'Firmada';
            break;
        case 'sent':
            colorClass = 'bg-green-100 text-green-600';
            label = 'Enviada';
            break;
    }

    return (
        <View className={`px-2 py-0.5 rounded text-xs mt-1 ${colorClass.split(' ')[0]}`}>
            <Text className={`${colorClass.split(' ')[1]} text-[10px] font-bold uppercase`}>{label}</Text>
        </View>
    )
}

export default DashboardScreen;
