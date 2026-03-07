import React, { useState } from 'react';
import { TextInput, TouchableOpacity, Text, StyleSheet, View, ActivityIndicator, Alert } from 'react-native';
import { ModalGenerico } from '../components/ModalGenerico';
import { useCadastrosEscolares } from '../hooks/useEscolarMutations';
import { colors } from '../theme/colors';

interface ModalCadastroAlunoProps {
  visible: boolean;
  onClose: () => void;
  idClasseSelecionada: string | null;
}

export const ModalCadastroAluno = ({ visible, onClose, idClasseSelecionada }: ModalCadastroAlunoProps) => {
  const [nome, setNome] = useState('');
  const [numero, setNumero] = useState(''); 
  
  const { mutationAluno } = useCadastrosEscolares();

  const isFormInvalido = !nome.trim() || !numero || !idClasseSelecionada;

  const handleSalvar = () => {
    if (isFormInvalido) {
      Alert.alert("Aviso", "Preencha o nome, o número e selecione uma turma.");
      return;
    }

    mutationAluno.mutate({
      nome: nome.trim(),
      numeroChamada: Number(numero),
      classeId: idClasseSelecionada
    }, {
      onSuccess: () => {
        setNome('');
        setNumero('');
        onClose();
      },
      onError: (error: any) => {
        Alert.alert("Erro", error.response?.data?.message || "Erro ao cadastrar aluno.");
      }
    });
  };

  return (
    <ModalGenerico visible={visible} onClose={onClose} titulo="Novo Aluno">
      <View style={styles.container}>
        
        <Text style={styles.labelField}>Nome do Aluno</Text>
        <TextInput
          style={styles.input}
          placeholder="Nome completo"
          value={nome}
          onChangeText={setNome}
          autoFocus={true}
        />

        <Text style={styles.labelField}>Número da Chamada</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 15"
          value={numero}
          onChangeText={setNumero}
          keyboardType="numeric" 
        />

        <TouchableOpacity 
          style={[
            styles.button, 
            (isFormInvalido || mutationAluno.isPending) && styles.buttonDisabled
          ]} 
          onPress={handleSalvar}
          disabled={isFormInvalido || mutationAluno.isPending}
        >
          {mutationAluno.isPending ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>Cadastrar Aluno</Text>
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
    marginBottom: 6,
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  input: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
    color: '#333'
  },
  button: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10
  },
  buttonDisabled: {
    backgroundColor: colors.borderLight,
    opacity: 0.8
  },
  buttonText: { 
    color: colors.white, 
    fontWeight: 'bold', 
    fontSize: 16 
  }
});