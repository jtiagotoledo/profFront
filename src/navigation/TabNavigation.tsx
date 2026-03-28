import React, { useMemo } from 'react';
import { TouchableOpacity, Image, StyleSheet, View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Feather'; 

import ListaAlunosScreen from '../screens/ListaAlunosScreen';
import FrequenciaScreen from '../screens/FrequenciaScreen';
import NotasScreen from '../screens/NotasScreen';
import { useAppStore } from '../store/useAppStore';

const Tab = createBottomTabNavigator();

const ProfileHeaderButton = ({ navigation, user }: any) => (
  <TouchableOpacity 
    onPress={() => navigation.navigate('Perfil')} 
    style={styles.headerButton}
  >
    {user?.fotoPerfil ? (
      <Image source={{ uri: user.fotoPerfil }} style={styles.avatarMini} />
    ) : (
      <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarInitial}>{user?.nome?.charAt(0) || 'P'}</Text>
      </View>
    )}
  </TouchableOpacity>
);

const makeIcon = (name: string) => ({ color, size }: any) => (
  <Icon name={name} size={size} color={color} />
);

export function TabNavigator({ navigation }: any) {
  const { user } = useAppStore();

  const headerRightComponent = useMemo(() => {
    return () => <ProfileHeaderButton navigation={navigation} user={user} />;
  }, [navigation, user]);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerTitleAlign: 'center',
        tabBarActiveTintColor: '#2E7D32',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: styles.tabBar,
        headerRight: headerRightComponent,
      }}
    >
      <Tab.Screen 
        name="Alunos" 
        component={ListaAlunosScreen} 
        options={{ 
          title: 'Meus Alunos',
          tabBarIcon: makeIcon('users') 
        }}
      />
      <Tab.Screen 
        name="Chamada" 
        component={FrequenciaScreen} 
        options={{ 
          title: 'Frequência Diária',
          tabBarIcon: makeIcon('check-square')
        }}
      />
      <Tab.Screen 
        name="Notas" 
        component={NotasScreen} 
        options={{ 
          title: 'Lançar Notas',
          tabBarIcon: makeIcon('edit-3')
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 65,
    paddingBottom: 10,
    paddingTop: 5,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  headerButton: {
    marginRight: 15,
  },
  avatarMini: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#2E7D32',
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});