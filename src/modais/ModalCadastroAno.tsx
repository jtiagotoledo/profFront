import React, { useState } from 'react';
import { TextInput, TouchableOpacity, Text, StyleSheet, View, ActivityIndicator, Alert } from 'react-native';
import { ModalGenerico } from '../components/ModalGenerico';
import { useCadastrosEscolares } from '../hooks/useEscolarMutations';
import { colors } from '../theme/colors';

interface ModalCadastroAnoProps {
  visible: boolean;
  onClose: () => void;
}

export const ModalCadastroAno = ({ visible, onClose }: ModalCadastroAnoProps) => {
  const [rotulo, setRotulo] = useState('');
  const { mutationAno } = useCadastrosEscolares();

  const handleSalvar = () => {
    if (!rotulo.trim()) {
      Alert.alert("Campo Obrigatório", "Por favor, digite o rótulo do ano letivo.");
      return;
    }

    mutationAno.mutate(rotulo, {
      onSuccess: () => {
        setRotulo('');
        onClose();
      },
      onError: (error: any) => {
        Alert.alert("Erro", error.response?.data?.message || "Não foi possível salvar.");
      }
    });
  };

  return (
    <ModalGenerico visible={visible} onClose={onClose} titulo="Novo Ano Letivo">
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Ex: 2026 - 1º Bimestre"
          value={rotulo}
          onChangeText={setRotulo}
          autoFocus={true} 
        />
        
        <TouchableOpacity 
          style={[
            styles.button, 
            (!rotulo.trim() || mutationAno.isPending) && styles.buttonDisabled 
          ]} 
          onPress={handleSalvar}
          disabled={mutationAno.isPending}
        >
          {mutationAno.isPending ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>Salvar Ano</Text>
          )}
        </TouchableOpacity>
      </View>
    </ModalGenerico>
  );
};

const styles = StyleSheet.create({
  container: { paddingVertical: 10 },
  input: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
    color: '#333'
  },
  button: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center'
  },
  buttonDisabled: {
    backgroundColor: colors.borderLight, 
  },
  buttonText: { color: colors.white, fontWeight: 'bold' }
});