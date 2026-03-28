import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { RootStackParamList } from './types';
import { TabNavigator } from './TabNavigation';
import PerfilScreen from '../screens/PerfilScreen'; // <-- Importe a tela aqui

import { colors } from '../theme/colors';
import Login from '../screens/Login';
import { getToken } from '../utils/authStorage';
import { useAppStore } from '../store/useAppStore';
import { getMeAPI } from '../services/usersApi';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { userToken, setToken, setUser } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrapAsync = async () => {
      console.log("🚀 1. Iniciando bootstrapAsync...");
      const token = await getToken();
console.log("🔍 2. Token recuperado do storage:", token ? "EXISTE" : "NULO");
      if (token) {
        setToken(token);
        try {
          console.log("📡 3. Chamando getMeAPI...");
          const userData = await getMeAPI();
          setUser(userData); 
          console.log("✅ Perfil sincronizado no boot:", userData.nome);
        } catch (e) {
          console.log("Erro ao sincronizar ou token expirado.");
        }
      }
      setIsLoading(false);
    };
    bootstrapAsync();
  }, [setToken, setUser]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.secondary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.primary }
      }}
    >
      {userToken == null ? (
        <Stack.Screen name="Login" component={Login} />
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={TabNavigator} />

          <Stack.Screen
            name="Perfil"
            component={PerfilScreen}
            options={{
              headerShown: true,
              title: 'Meu Perfil',
              headerTintColor: '#FFF',
              headerStyle: { backgroundColor: colors.primary },
              headerTitleAlign: 'center',
              animation: 'slide_from_right'
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
});