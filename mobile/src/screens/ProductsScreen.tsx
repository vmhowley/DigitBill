import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';

const ProductsScreen = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await api.get('/products');
            setProducts(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const renderItem = ({ item }: { item: any }) => (
        <View className="bg-white p-4 mb-3 rounded-xl border border-gray-100 shadow-sm flex-row justify-between items-center">
            <View className="flex-1 mr-4">
                <Text className="font-bold text-gray-800 text-base">{item.description || 'Producto'}</Text>
                <Text className="text-gray-400 text-xs mt-1">SKU: {item.sku || 'N/A'}</Text>
            </View>
            <View>
                 <Text className="font-bold text-green-600 text-right">
                    {new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(item.price || 0)}
                </Text>
                <Text className="text-gray-500 text-xs text-right text-[10px] mt-0.5">Stock: {item.stock_quantity || 0}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
            <View className="p-6 pb-2">
                <Text className="text-2xl font-bold text-gray-800">Productos</Text>
            </View>
            <FlatList
                data={products}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={{ padding: 24, paddingTop: 10 }}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchProducts} />}
                ListEmptyComponent={<Text className="text-center text-gray-500 mt-10">No hay productos registrados</Text>}
            />
        </SafeAreaView>
    );
};

export default ProductsScreen;
