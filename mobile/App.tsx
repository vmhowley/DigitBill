import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LoginScreen from './src/screens/LoginScreen';
import { useAuthStore } from './src/store/authStore';


import CustomTabBar from './src/components/CustomTabBar';

export default function App() {
  const { isAuthenticated } = useAuthStore();

  console.log('[App] isAuthenticated:', isAuthenticated);

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      {isAuthenticated ? <CustomTabBar /> : <LoginScreen />}
    </SafeAreaProvider>
  );
}
