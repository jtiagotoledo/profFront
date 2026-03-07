import React, { useState, useEffect } from 'react';
import { TextInput, TouchableOpacity, Text, StyleSheet, View, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ModalGenerico } from '../components/ModalGenerico';
import { useCadastrosEscolares } from '../hooks/useEscolarMutations';
import { colors } from '../theme/colors';

interface Props {
  visible: boolean;
  onClose: () => void;
  ano: { _id: string; rotulo: string } | null;
}

export const ModalEditarAno = ({ visible, onClose, ano }: Props) => {
  const [rotulo, setRotulo] = useState('');
  
  const { mutationAtualizarAno, mutationDeletarAno } = useCadastrosEscolares();

  useEffect(() => {
    if (ano) setRotulo(ano.rotulo);
  }, [ano, visible]);

  const handleSalvar = () => {
    if (!rotulo.trim() || !ano) return;
    
    mutationAtualizarAno.mutate({ id: ano._id, rotulo: rotulo.trim() }, {
      onSuccess: () => onClose(),
      onError: (err: any) => Alert.alert("Erro", err.response?.data?.message || "Erro ao atualizar")
    });
  };

  const handleDeletar = () => {
    if (!ano) return;

    Alert.alert(
      "Confirmar Exclusão",
      `Deseja realmente excluir o ano "${ano.rotulo}"? Isso apagará todas as turmas e alunos vinculados a ele.`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sim, Excluir", 
          style: "destructive",
          onPress: () => {
            mutationDeletarAno.mutate(ano._id, {
              onSuccess: () => {
                onClose();
              },
              onError: (err: any) => {
                const mensagem = err.response?.data?.message || "Não foi possível excluir o ano.";
                Alert.alert("Erro", mensagem);
              }
            });
          }
        }
      ]
    );
  };

  return (
    <ModalGenerico visible={visible} onClose={onClose} titulo="Editar Ano Letivo">
      <View style={styles.container}>
        <Text style={styles.label}>Rótulo do Ano</Text>
        <TextInput
          style={styles.input}
          value={rotulo}
          onChangeText={setRotulo}
          autoFocus
        />

        <TouchableOpacity 
          style={[styles.button, (!rotulo.trim() || mutationAtualizarAno.isPending) && styles.buttonDisabled]} 
          onPress={handleSalvar}
          disabled={mutationAtualizarAno.isPending || mutationDeletarAno.isPending}
        >
          {mutationAtualizarAno.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Salvar Alterações</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={handleDeletar}
          disabled={mutationDeletarAno.isPending || mutationAtualizarAno.isPending}
        >
          {mutationDeletarAno.isPending ? (
            <ActivityIndicator size="small" color={colors.danger || '#FF5252'} />
          ) : (
            <>
              <Icon name="trash-can-outline" size={20} color={colors.danger || '#FF5252'} />
              <Text style={styles.deleteText}>Excluir Ano Letivo</Text>
            </>
          )}
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