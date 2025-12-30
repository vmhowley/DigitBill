import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
// import { Home, FileText, Users, Package, User } from 'lucide-react-native'; // Removed due to metro error
import DashboardScreen from '../screens/DashboardScreen';
import InvoicesScreen from '../screens/InvoicesScreen';
import ClientsScreen from '../screens/ClientsScreen';
import ProductsScreen from '../screens/ProductsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
            borderTopWidth: 0,
            elevation: 0,
            backgroundColor: '#ffffff',
            height: 65,
            paddingBottom: 10,
            paddingTop: 10,
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarShowLabel: true,
        tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
        }
      }}
    >
      <Tab.Screen 
        name="Inicio" 
        component={DashboardScreen} 
        options={{
            tabBarIcon: ({ color, size }) => <Feather name="home" color={color} size={size} />
        }}
      />
      <Tab.Screen 
        name="Facturas" 
        component={InvoicesScreen} 
        options={{
            tabBarIcon: ({ color, size }) => <Feather name="file-text" color={color} size={size} />
        }}
      />
      <Tab.Screen 
        name="Clientes" 
        component={ClientsScreen} 
        options={{
            tabBarIcon: ({ color, size }) => <Feather name="users" color={color} size={size} />
        }}
      />
       <Tab.Screen 
        name="Productos" 
        component={ProductsScreen} 
        options={{
            tabBarIcon: ({ color, size }) => <Feather name="package" color={color} size={size} />
        }}
      />
      <Tab.Screen 
        name="Perfil" 
        component={ProfileScreen} 
        options={{
            tabBarIcon: ({ color, size }) => <Feather name="user" color={color} size={size} />
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
