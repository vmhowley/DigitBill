import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import { useAuthStore } from './src/store/authStore';

import { NavigationContainer } from '@react-navigation/native';
import TabNavigator from './src/navigation/TabNavigator';

export default function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <NavigationContainer>
        {isAuthenticated ? <TabNavigator /> : <LoginScreen />}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
