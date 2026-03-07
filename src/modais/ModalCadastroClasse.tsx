import React, { useState } from 'react';
import { TextInput, TouchableOpacity, Text, StyleSheet, View, ActivityIndicator, Alert } from 'react-native';
import { ModalGenerico } from '../components/ModalGenerico';
import { useCadastrosEscolares } from '../hooks/useEscolarMutations';
import { colors } from '../theme/colors';

interface ModalCadastroClasseProps {
  visible: boolean;
  onClose: () => void;
  idAnoSelecionado: string | null;
}

export const ModalCadastroClasse = ({ visible, onClose, idAnoSelecionado }: ModalCadastroClasseProps) => {
  const [nome, setNome] = useState('');
  const { mutationClasse } = useCadastrosEscolares();

  // Verifica se o formulário é válido (nome preenchido e ano selecionado)
  const isFormInvalido = !nome.trim() || !idAnoSelecionado;

  const handleSalvar = () => {
    if (!nome.trim()) {
      Alert.alert("Aviso", "Por favor, digite o nome da classe.");
      return;
    }

    if (!idAnoSelecionado) {
      Alert.alert("Erro", "Selecione um Ano Letivo primeiro.");
      return;
    }

    mutationClasse.mutate({
      nome: nome.trim(),
      anoLetivoId: idAnoSelecionado
    }, {
      onSuccess: () => {
        setNome('');
        onClose();
      },
      onError: (error: any) => {
        Alert.alert("Erro", error.response?.data?.message || "Não foi possível salvar a classe.");
      }
    });
  };

  return (
    <ModalGenerico visible={visible} onClose={onClose} titulo="Nova Classe">
      <View style={styles.container}>
        
        <Text style={styles.labelField}>Nome da Turma</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 9º Ano A"
          value={nome}
          onChangeText={setNome}
          autoFocus={true} 
          placeholderTextColor={colors.mutedText}
        />

        <TouchableOpacity 
          style={[
            styles.button, 
            (isFormInvalido || mutationClasse.isPending) && styles.buttonDisabled
          ]} 
          onPress={handleSalvar}
          disabled={isFormInvalido || mutationClasse.isPending}
        >
          {mutationClasse.isPending ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>Salvar Classe</Text>
          )}
        </TouchableOpacity>
      </View>
    </ModalGenerico>
  );
};

const styles = StyleSheet.create({
  container: { paddingVertical: 10 },
  labelField: {
    fontSize: 12,
    color: colors.mutedText,
    marginBottom: 8,
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  input: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
    color: '#333'
  },
  button: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2, 
  },
  buttonDisabled: {
    backgroundColor: colors.borderLight,
    elevation: 0, 
    opacity: 0.8
  },
  buttonText: { 
    color: colors.white, 
    fontWeight: 'bold', 
    fontSize: 16 
  }
});