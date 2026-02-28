import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { colors } from '../theme/colors';

import Login from '../screens/Login';
import Home from '../screens/Home'; 

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false, 
        contentStyle: { backgroundColor: colors.primary } 
      }}
    >
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Home" component={Home} />
    </Stack.Navigator>
  );
}