import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { TabNavigator } from './TabNavigation';

import { colors } from '../theme/colors';
import Login from '../screens/Login';
import { getToken } from '../utils/authStorage';
import { useAppStore } from '../store/useAppStore'

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { userToken, setToken } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrapAsync = async () => {
      const res = await getToken();
      setToken(res ?? null); 
      setIsLoading(false);
    };
    bootstrapAsync();
  }, []);

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
        <Stack.Screen name="MainTabs" component={TabNavigator} />
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
  stackContent: {
    backgroundColor: colors.primary,
  },
});