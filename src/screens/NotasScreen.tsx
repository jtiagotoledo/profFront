import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';

function NotasScreen() {
  const logout = useAppStore((state) => state.logout);

  return (
    <View style={styles.container}>
      <Text style={styles.textoTitulo}>Lançar Notas</Text>
      <Text style={styles.texto}>Estamos em manutenção, voltamos em breve!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  textoTitulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.lightText,
    marginBottom: 10,
  },
  texto: {
    fontSize: 16,
    color: colors.lightText,
    marginBottom: 40,
  },
  botaoLogout: {
    backgroundColor: colors.secondary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    marginBottom: 24
    ,
    borderRadius: 8,
    elevation: 2,
    shadowColor: colors.white,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  textoBotao: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default NotasScreen;