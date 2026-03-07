import React, { useState, useEffect } from 'react';
import { TextInput, TouchableOpacity, Text, StyleSheet, View, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ModalGenerico } from '../components/ModalGenerico';
import { useCadastrosEscolares } from '../hooks/useEscolarMutations';
import { colors } from '../theme/colors';

interface Props {
  visible: boolean;
  onClose: () => void;
  classe: { _id: string; nome: string } | null;
}

export const ModalEditarClasse = ({ visible, onClose, classe }: Props) => {
  const [nome, setNome] = useState('');
  const { mutationAtualizarClasse, mutationDeletarClasse } = useCadastrosEscolares();

  useEffect(() => {
    if (classe) setNome(classe.nome);
  }, [classe, visible]);

  const handleSalvar = () => {
    if (!nome.trim() || !classe) return;
    
    mutationAtualizarClasse.mutate({ id: classe._id, nome: nome.trim() }, {
      onSuccess: () => onClose(),
      onError: (err: any) => Alert.alert("Erro", err.response?.data?.message || "Erro ao atualizar")
    });
  };

  const handleDeletar = () => {
    if (!classe) return;

    Alert.alert(
      "Confirmar Exclusão",
      `Deseja excluir a turma "${classe.nome}"? Isso apagará todos os alunos dela.`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sim, Excluir", 
          style: "destructive",
          onPress: () => {
            mutationDeletarClasse.mutate(classe._id, {
              onSuccess: () => onClose()
            });
          }
        }
      ]
    );
  };

  return (
    <ModalGenerico visible={visible} onClose={onClose} titulo="Editar Turma">
      <View style={styles.container}>
        <Text style={styles.label}>Nome da Turma</Text>
        <TextInput
          style={styles.input}
          value={nome}
          onChangeText={setNome}
          autoFocus
        />

        <TouchableOpacity 
          style={[styles.button, !nome.trim() && styles.buttonDisabled]} 
          onPress={handleSalvar}
          disabled={mutationAtualizarClasse.isPending}
        >
          {mutationAtualizarClasse.isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Salvar Alterações</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDeletar}>
          <Icon name="trash-can-outline" size={20} color={colors.danger} />
          <Text style={styles.deleteText}>Excluir Turma</Text>
        </TouchableOpacity>
      </View>
    </ModalGenerico>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.mutedText,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
    color: '#333',
    marginBottom: 20,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  buttonDisabled: {
    backgroundColor: colors.borderLight,
    elevation: 0,
  },
  buttonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  deleteButton: {
    marginTop: 15,
    padding: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8
  },
  deleteText: {
    color: colors.danger || '#FF5252',
    fontWeight: '600',
    fontSize: 14,
  }
});