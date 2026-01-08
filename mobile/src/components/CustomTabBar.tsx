import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ClientsScreen from '../screens/ClientsScreen';
import DashboardScreen from '../screens/DashboardScreen';
import InvoicesScreen from '../screens/InvoicesScreen';
import ProductsScreen from '../screens/ProductsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const CustomTabBar = () => {
    const [activeTab, setActiveTab] = useState('dashboard');

    const renderScreen = () => {
        switch (activeTab) {
            case 'dashboard':
                return <DashboardScreen key="dashboard" />;
            case 'invoices':
                return <InvoicesScreen key="invoices" />;
            case 'clients':
                return <ClientsScreen key="clients" />;
            case 'products':
                return <ProductsScreen key="products" />;
            case 'profile':
                return <ProfileScreen key="profile" />;
            default:
                return <DashboardScreen key="dashboard-default" />;
        }
    };

    const TabButton = ({ name, icon, label }: { name: string; icon: string; label: string }) => {
        const isActive = activeTab === name;
        return (
            <TouchableOpacity
                style={styles.tabButton}
                onPress={() => setActiveTab(name)}
            >
                <Feather
                    name={icon as any}
                    size={24}
                    color={isActive ? '#2563eb' : '#94a3b8'}
                />
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                    {label}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.screenContainer}>
                {renderScreen()}
            </View>

            <View style={styles.tabBar}>
                <TabButton name="dashboard" icon="home" label="Inicio" />
                <TabButton name="invoices" icon="file-text" label="Facturas" />
                <TabButton name="clients" icon="users" label="Clientes" />
                <TabButton name="products" icon="package" label="Productos" />
                <TabButton name="profile" icon="user" label="Perfil" />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    screenContainer: {
        flex: 1,
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        height: 65,
        paddingBottom: 10,
        paddingTop: 10,
        borderTopWidth: 0,
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: '#94a3b8',
        marginTop: 4,
    },
    tabLabelActive: {
        color: '#2563eb',
    },
});

export default CustomTabBar;
