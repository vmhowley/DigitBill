import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

const DashboardScreen = () => {
    const { user, logout } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ totalRevenue: 0, count: 0 });
    const [recentInvoices, setRecentInvoices] = useState<any[]>([]);

    console.log('[DashboardScreen] Rendering...');

    const fetchDashboardData = async () => {
        console.log('[DashboardScreen] Fetching data...');
        setLoading(true);
        try {
            console.log('[DashboardScreen] API Call Start');
            const res = await api.get('/invoices');
            console.log('[DashboardScreen] API Call Success', res.status);
            const invoices = res.data;

            // Calculate revenue from total_paid (matching web logic)
            const revenue = invoices
                .filter((i: any) => i.status !== 'draft')
                .reduce((acc: number, curr: any) => acc + (curr.total_paid ? parseFloat(curr.total_paid) : 0), 0);

            const invoiceCount = invoices.filter((i: any) => i.status !== 'draft').length;

            setStats({
                totalRevenue: revenue,
                count: invoiceCount
            });

            // Get top 5 recent
            setRecentInvoices(invoices.slice(0, 5));
            console.log('[DashboardScreen] Data processed');
            console.log('[DashboardScreen] Stats:', { totalRevenue: revenue, count: invoiceCount });
            console.log('[DashboardScreen] Recent invoices count:', invoices.slice(0, 5).length);
        } catch (error) {
            console.error('[DashboardScreen] Error fetching dashboard:', error);
        } finally {
            setLoading(false);
            console.log('[DashboardScreen] Loading finished');
        }
    };

    useEffect(() => {
        console.log('[DashboardScreen] Mounted');
        fetchDashboardData();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(amount);
    };

    console.log('[DashboardScreen] About to return JSX...');

    return (
        <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
            {/* Header */}
            <View style={{ paddingHorizontal: 24, paddingVertical: 16, paddingTop: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}>
                <View>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1f2937' }}>Hola, {user?.username}!</Text>
                    <Text style={{ color: '#6b7280', fontSize: 12 }}>{user?.email}</Text>
                </View>
                <TouchableOpacity
                    onPress={logout}
                    style={{ backgroundColor: '#fef2f2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#fee2e2' }}
                >
                    <Text style={{ color: '#dc2626', fontWeight: '500', fontSize: 12 }}>Salir</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24 }}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={fetchDashboardData} />
                }
            >
                {/* Stats Card */}
                <View style={{ backgroundColor: '#2563eb', padding: 24, borderRadius: 16, marginBottom: 32 }}>
                    <Text style={{ color: '#dbeafe', fontSize: 14, marginBottom: 4, textTransform: 'uppercase', fontWeight: '600' }}>Total Facturado</Text>
                    <Text style={{ fontSize: 30, fontWeight: 'bold', color: 'white', marginBottom: 8 }}>{formatCurrency(stats.totalRevenue)}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#3b82f6', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 }}>
                        <Text style={{ color: 'white', fontSize: 12, fontWeight: '500' }}>{stats.count} facturas generadas</Text>
                    </View>
                </View>

                {/* Recent Activity */}
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 16 }}>Actividad Reciente</Text>

                {recentInvoices.length === 0 && !loading && (
                    <Text style={{ color: '#6b7280', fontStyle: 'italic', textAlign: 'center', paddingVertical: 32 }}>No hay facturas recientes</Text>
                )}

                {recentInvoices.map((inv) => (
                    <View key={inv.id} style={{ backgroundColor: 'white', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#f3f4f6', marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontWeight: 'bold', color: '#1f2937', fontSize: 16 }}>{inv.client_name || 'Cliente Desconocido'}</Text>
                            <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>
                                {new Date(inv.created_at).toLocaleDateString()} • {inv.type_code === '01' ? 'Crédito Fiscal' : 'Consumo'}
                            </Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={{ fontWeight: 'bold', color: '#111827' }}>{formatCurrency(inv.total)}</Text>
                            <StatusBadge status={inv.status} />
                        </View>
                    </View>
                ))}

                <View style={{ height: 80 }} />
            </ScrollView>
        </View>
    );
};

const StatusBadge = ({ status }: { status: string }) => {
    let bgColor = '#f3f4f6'; // bg-gray-100
    let textColor = '#4b5563'; // text-gray-600
    let label = status;

    switch (status) {
        case 'draft':
            bgColor = '#f3f4f6';
            textColor = '#4b5563';
            label = 'Borrador';
            break;
        case 'signed':
            bgColor = '#dbeafe'; // bg-blue-100
            textColor = '#2563eb'; // text-blue-600
            label = 'Firmada';
            break;
        case 'sent':
            bgColor = '#dcfce7'; // bg-green-100
            textColor = '#16a34a'; // text-green-600
            label = 'Enviada';
            break;
    }

    return (
        <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginTop: 4, backgroundColor: bgColor, alignSelf: 'flex-start' }}>
            <Text style={{ color: textColor, fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }}>{label}</Text>
        </View>
    )
}

export default DashboardScreen;
