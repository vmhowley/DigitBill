import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';

const ClientsScreen = () => {
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchClients = async () => {
        setLoading(true);
        try {
            const res = await api.get('/clients');
            setClients(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const renderItem = ({ item }: { item: any }) => (
        <View className="bg-white p-4 mb-3 rounded-xl border border-gray-100 shadow-sm">
            <Text className="font-bold text-gray-800 text-lg">{item.name}</Text>
            <Text className="text-gray-500 text-sm mt-1">{item.rnc_ci}</Text>
            {item.email && <Text className="text-gray-400 text-xs mt-1">{item.email}</Text>}
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
            <View className="p-6 pb-2">
                <Text className="text-2xl font-bold text-gray-800">Clientes</Text>
            </View>
            <FlatList
                data={clients}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={{ padding: 24, paddingTop: 10 }}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchClients} />}
                ListEmptyComponent={<Text className="text-center text-gray-500 mt-10">No hay clientes registrados</Text>}
            />
        </SafeAreaView>
    );
};

export default ClientsScreen;
