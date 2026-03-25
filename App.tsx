import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as IAP from 'react-native-iap';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 10, gcTime: 1000 * 60 * 60 },
  },
});

export default function App() {
  useEffect(() => {
    IAP.initConnection()
      .then(() => console.log("IAP: Conectado com sucesso!"))
      .catch((err) => console.warn("IAP: Erro na conexão", err));

    return () => {
      IAP.endConnection();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <NavigationContainer> 
          <AppNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}