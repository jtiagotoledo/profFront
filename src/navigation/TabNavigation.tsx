import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Feather'; 

import ListaAlunosScreen from '../screens/ListaAlunosScreen';
import FrequenciaScreen from '../screens/FrequenciaScreen';
import NotasScreen from '../screens/NotasScreen';

const Tab = createBottomTabNavigator();

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true, // Mostra o título da tela no topo
        tabBarActiveTintColor: '#2E7D32', // Verde professor
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          height: 65,
          paddingBottom: 10,
          paddingTop: 5,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
        },
        tabBarIcon: ({ color, size }) => {
          let iconName: string = 'users';

          if (route.name === 'Alunos') iconName = 'users';
          else if (route.name === 'Chamada') iconName = 'check-square';
          else if (route.name === 'Notas') iconName = 'edit-3';

          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="Alunos" 
        component={ListaAlunosScreen} 
        options={{ title: 'Meus Alunos' }}
      />
      <Tab.Screen 
        name="Chamada" 
        component={FrequenciaScreen} 
        options={{ title: 'Frequência Diária' }}
      />
      <Tab.Screen 
        name="Notas" 
        component={NotasScreen} 
        options={{ title: 'Lançar Notas' }}
      />
    </Tab.Navigator>
  );
}