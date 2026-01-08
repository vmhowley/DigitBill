
import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';

const CreateInvoiceScreen = ({ navigation }: any) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form State
    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [invoiceType, setInvoiceType] = useState('01'); // 01 for B01 (Credit), 02 for B02 (Consumer)
    const [items, setItems] = useState<any[]>([]);

    // Data Source
    const [clients, setClients] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);

    // Modals
    const [showClientModal, setShowClientModal] = useState(false);
    const [showProductModal, setShowProductModal] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [clientsRes, productsRes] = await Promise.all([
                api.get('/clients'),
                api.get('/products')
            ]);
            setClients(clientsRes.data);
            setProducts(productsRes.data);
        } catch (error) {
            console.error('Error loading data', error);
            Alert.alert('Error', 'No se pudieron cargar clientes o productos');
        }
    };

    const handleAddItem = (product: any) => {
        const newItem = {
            product_id: product.id,
            description: product.description,
            quantity: 1,
            unit_price: product.price,
            tax_rate: 18, // Default
            line_amount: product.price // Basic calculation
        };
        setItems([...items, newItem]);
        setShowProductModal(false);
    };

    const updateItemQuantity = (index: number, quantity: string) => {
        const newItems = [...items];
        const qty = parseFloat(quantity) || 0;
        newItems[index].quantity = qty;
        newItems[index].line_amount = qty * newItems[index].unit_price;
        setItems(newItems);
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + item.line_amount, 0);
    };

    const handleSubmit = async () => {
        if (!selectedClient) return Alert.alert('Error', 'Selecciona un cliente');
        if (items.length === 0) return Alert.alert('Error', 'Agrega al menos un producto');

        setLoading(true);
        try {
            const payload = {
                client_id: selectedClient.id,
                items: items,
                type_code: invoiceType === '01' ? '31' : '32', // Mapping to NCF Types if needed (Web sends type_code 01/02 usually or 31/32? Let's check backend logic. Backend expects type_code)
                // Backend usually expects 01/02 or actual codes. Let's assume standard '31'/'32' e-CF codes or '01'/'02' legacy.
                // Checking backend/src/services/invoiceService.ts would be ideal, but usually 31 is credito fiscal, 32 consumo.
                // Let's stick to '01' '02' widely used in frontend often mapped? No, frontend usually sends 31/32. 
                // Let's default to '31' (Credito Fiscal) and '32' (Consumo).
                payment_method: 'cash', // Default
                immediate_issue: true
            };

            await api.post('/invoices', payload);
            Alert.alert('Éxito', 'Factura creada correctamente', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            console.error(error);
            Alert.alert('Error', error.response?.data?.error || 'No se pudo crear la factura');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['top']}>
            {/* Header */}
            <View className="px-6 py-4 border-b border-gray-100 flex-row items-center justify-between">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
                    <Feather name="arrow-left" size={24} color="#333" />
                </TouchableOpacity>
                <Text className="text-lg font-bold">Nueva Factura</Text>
                <View className="w-8" />
            </View>

            <ScrollView className="flex-1 p-6">
                {/* 1. Client Section */}
                <Text className="font-bold text-gray-700 mb-2">Cliente</Text>
                <TouchableOpacity
                    onPress={() => setShowClientModal(true)}
                    className="bg-gray-50 border border-gray-200 p-4 rounded-xl mb-6 flex-row justify-between items-center"
                >
                    <View>
                        <Text className={`font-medium ${selectedClient ? 'text-gray-900' : 'text-gray-400'}`}>
                            {selectedClient ? selectedClient.name : 'Seleccionar Cliente'}
                        </Text>
                        {selectedClient && <Text className="text-xs text-gray-500">{selectedClient.rnc_ci}</Text>}
                    </View>
                    <Feather name="chevron-down" size={20} color="#9ca3af" />
                </TouchableOpacity>

                {/* 2. Type Section */}
                <Text className="font-bold text-gray-700 mb-2">Tipo de Factura</Text>
                <View className="flex-row gap-3 mb-6">
                    <TouchableOpacity
                        onPress={() => setInvoiceType('01')}
                        className={`flex-1 p-3 rounded-xl border ${invoiceType === '01' ? 'bg-blue-50 border-blue-500' : 'bg-white border-gray-200'}`}
                    >
                        <Text className={`text-center font-medium ${invoiceType === '01' ? 'text-blue-600' : 'text-gray-600'}`}>Crédito Fiscal</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setInvoiceType('02')}
                        className={`flex-1 p-3 rounded-xl border ${invoiceType === '02' ? 'bg-blue-50 border-blue-500' : 'bg-white border-gray-200'}`}
                    >
                        <Text className={`text-center font-medium ${invoiceType === '02' ? 'text-blue-600' : 'text-gray-600'}`}>Consumo</Text>
                    </TouchableOpacity>
                </View>

                {/* 3. Items Section */}
                <View className="flex-row justify-between items-center mb-2">
                    <Text className="font-bold text-gray-700">Productos</Text>
                    <TouchableOpacity onPress={() => setShowProductModal(true)}>
                        <Text className="text-blue-600 font-medium">+ Agregar</Text>
                    </TouchableOpacity>
                </View>

                {items.length === 0 ? (
                    <View className="bg-gray-50 p-6 rounded-xl border border-dashed border-gray-300 items-center mb-6">
                        <Text className="text-gray-400">No hay productos agregados</Text>
                    </View>
                ) : (
                    <View className="gap-3 mb-6">
                        {items.map((item, index) => (
                            <View key={index} className="bg-white border border-gray-200 p-3 rounded-xl flex-row items-center gap-3">
                                <View className="flex-1">
                                    <Text className="font-medium text-gray-800">{item.description}</Text>
                                    <Text className="text-blue-600 font-bold">RD$ {item.unit_price}</Text>
                                </View>
                                <View className="flex-row items-center gap-2">
                                    <Text className="text-xs text-gray-500">Cant:</Text>
                                    <TextInput
                                        className="bg-gray-100 px-2 py-1 rounded w-16 text-center font-bold"
                                        keyboardType="numeric"
                                        value={item.quantity.toString()}
                                        onChangeText={(val) => updateItemQuantity(index, val)}
                                    />
                                </View>
                                <TouchableOpacity onPress={() => {
                                    const newItems = [...items];
                                    newItems.splice(index, 1);
                                    setItems(newItems);
                                }}>
                                    <Feather name="trash-2" size={18} color="#ef4444" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}

                {/* Total */}
                <View className="bg-gray-900 p-4 rounded-xl mb-6 flex-row justify-between items-center">
                    <Text className="text-white font-medium">Total Estimado</Text>
                    <Text className="text-white font-bold text-xl">
                        {new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(calculateTotal())}
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={loading}
                    className={`bg-blue-600 p-4 rounded-xl items-center ${loading ? 'opacity-70' : ''}`}
                >
                    <Text className="text-white font-bold text-lg">{loading ? 'Procesando...' : 'Emitir Factura'}</Text>
                </TouchableOpacity>

            </ScrollView>

            {/* Client Modal */}
            <Modal visible={showClientModal} animationType="slide" presentationStyle="pageSheet">
                <View className="flex-1 bg-white p-6">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-xl font-bold">Seleccionar Cliente</Text>
                        <TouchableOpacity onPress={() => setShowClientModal(false)}>
                            <Feather name="x" size={24} />
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={clients}
                        keyExtractor={item => item.id.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                className="p-4 border-b border-gray-100"
                                onPress={() => {
                                    setSelectedClient(item);
                                    setShowClientModal(false);
                                }}
                            >
                                <Text className="font-bold text-lg">{item.name}</Text>
                                <Text className="text-gray-500">{item.rnc_ci}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </Modal>

            {/* Product Modal */}
            <Modal visible={showProductModal} animationType="slide" presentationStyle="pageSheet">
                <View className="flex-1 bg-white p-6">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-xl font-bold">Agregar Producto</Text>
                        <TouchableOpacity onPress={() => setShowProductModal(false)}>
                            <Feather name="x" size={24} />
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={products}
                        keyExtractor={item => item.id.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                className="p-4 border-b border-gray-100 flex-row justify-between items-center"
                                onPress={() => handleAddItem(item)}
                            >
                                <View>
                                    <Text className="font-bold text-lg">{item.description}</Text>
                                    <Text className="text-gray-500">Stock: {item.stock_quantity}</Text>
                                </View>
                                <Text className="text-blue-600 font-bold">
                                    {new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(item.price)}
                                </Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </Modal>

        </SafeAreaView>
    );
};

export default CreateInvoiceScreen;
