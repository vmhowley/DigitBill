import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';

const InvoicesScreen = () => {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const res = await api.get('/invoices');
            setInvoices(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    const renderItem = ({ item }: { item: any }) => (
        <View className="bg-white p-4 mb-3 rounded-xl border border-gray-100 shadow-sm">
            <View className="flex-row justify-between mb-1">
                <Text className="font-bold text-gray-800">{item.client_name || 'Consumidor Final'}</Text>
                <Text className="font-bold text-blue-600">
                    {new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(item.total)}
                </Text>
            </View>
            <View className="flex-row justify-between">
                <Text className="text-gray-500 text-xs">#{item.id} • {new Date(item.created_at).toLocaleDateString()}</Text>
                <Text className={`text-xs uppercase font-bold ${
                    item.status === 'sent' ? 'text-green-600' :
                    item.status === 'signed' ? 'text-blue-600' : 
                    'text-gray-500'
                }`}>{item.status}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
            <View className="p-6 pb-2">
                <Text className="text-2xl font-bold text-gray-800">Facturas</Text>
            </View>
            <FlatList
                data={invoices}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={{ padding: 24, paddingTop: 10 }}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchInvoices} />}
                ListEmptyComponent={<Text className="text-center text-gray-500 mt-10">No hay facturas registradas</Text>}
            />
        </SafeAreaView>
    );
};

export default InvoicesScreen;
