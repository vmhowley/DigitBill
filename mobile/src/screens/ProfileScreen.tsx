import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';

const ProfileScreen = () => {
    const { user, logout } = useAuthStore();

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb', padding: 24 }}>
            <Text className="text-2xl font-bold text-gray-800 mb-8">Perfil</Text>

            <View className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
                <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-4 self-center">
                    <Text className="text-2xl font-bold text-blue-600">
                        {user?.username?.substring(0, 2)?.toUpperCase() || 'U'}
                    </Text>
                </View>
                <Text className="text-center font-bold text-xl text-gray-800 mb-1">{user?.username}</Text>
                <Text className="text-center text-gray-500 mb-4">{user?.email}</Text>

                <View className="border-t border-gray-100 pt-4 mt-2">
                    <Text className="text-xs text-gray-400 uppercase font-bold mb-1">Empresa / Tenant</Text>
                    <Text className="text-gray-700 font-medium">{user?.tenant_id}</Text>
                </View>

                <View className="border-t border-gray-100 pt-4 mt-4">
                    <Text className="text-xs text-gray-400 uppercase font-bold mb-1">Rol</Text>
                    <Text className="text-gray-700 font-medium capitalize">{user?.role}</Text>
                </View>
            </View>

            <TouchableOpacity
                onPress={logout}
                className="bg-red-50 border border-red-100 py-4 rounded-xl items-center"
            >
                <Text className="text-red-600 font-bold">Cerrar Sesión</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

export default ProfileScreen;
