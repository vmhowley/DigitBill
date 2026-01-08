import { Feather } from '@expo/vector-icons';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';

const InvoicesScreen = () => {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation<any>();
    const isFocused = useIsFocused();

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
        if (isFocused) {
            fetchInvoices();
        }
    }, [isFocused]);

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
                <Text className={`text-xs uppercase font-bold ${item.status === 'sent' ? 'text-green-600' :
                    item.status === 'signed' ? 'text-blue-600' :
                        'text-gray-500'
                    }`}>{item.status}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }} edges={['top']}>
            <View className="p-6 pb-2 flex-row justify-between items-center">
                <Text className="text-2xl font-bold text-gray-800">Facturas</Text>
            </View>
            <FlatList
                data={invoices}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={{ padding: 24, paddingTop: 10, paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchInvoices} />}
                ListEmptyComponent={<Text className="text-center text-gray-500 mt-10">No hay facturas registradas</Text>}
            />

            <TouchableOpacity
                onPress={() => navigation.navigate('CreateInvoice')}
                className="absolute bottom-6 right-6 bg-blue-600 w-14 h-14 rounded-full justify-center items-center shadow-lg"
                style={{ elevation: 5 }}
            >
                <Feather name="plus" size={24} color="white" />
            </TouchableOpacity>
        </SafeAreaView>
    );
};

export default InvoicesScreen;
