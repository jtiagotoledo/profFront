import React, { useState, useEffect } from 'react';
import { TextInput, TouchableOpacity, Text, StyleSheet, View, ActivityIndicator, Alert, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ModalGenerico } from '../components/ModalGenerico';
import { useCadastrosEscolares } from '../hooks/useEscolarMutations';
import { colors } from '../theme/colors';

interface Props {
  visible: boolean;
  onClose: () => void;
  aluno: { _id: string; nome: string; numeroChamada: number; ativo: boolean } | null;
}

export const ModalEditarAluno = ({ visible, onClose, aluno }: Props) => {
  const [nome, setNome] = useState('');
  const [numero, setNumero] = useState('');
  const [ativo, setAtivo] = useState(true); // Novo estado para o Status
  
  const { mutationAtualizarAluno, mutationDeletarAluno } = useCadastrosEscolares();

  useEffect(() => {
    if (aluno) {
      setNome(aluno.nome);
      setNumero(aluno.numeroChamada.toString());
      setAtivo(aluno.ativo ?? true); 
    }
  }, [aluno, visible]);

  const handleSalvar = () => {
    if (!nome.trim() || !numero || !aluno) {
      Alert.alert("Aviso", "Preencha todos os campos.");
      return;
    }

    mutationAtualizarAluno.mutate({ 
      id: aluno._id, 
      dados: { 
        nome: nome.trim(), 
        numeroChamada: Number(numero),
        ativo: ativo 
      } 
    }, {
      onSuccess: () => onClose(),
      onError: (err: any) => Alert.alert("Erro", err.response?.data?.message || "Erro ao atualizar")
    });
  };

  const handleDeletar = () => {
    if (!aluno) return;

    Alert.alert(
      "Confirmar Exclusão",
      `Deseja excluir o aluno "${aluno.nome}"? Esta ação não pode ser desfeita.`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sim, Excluir", 
          style: "destructive",
          onPress: () => {
            mutationDeletarAluno.mutate(aluno._id, {
              onSuccess: () => onClose(),
              onError: (err: any) => {
                const msg = err.response?.data?.message || "Não foi possível excluir o aluno.";
                Alert.alert("Erro", msg);
              }
            });
          }
        }
      ]
    );
  };

  return (
    <ModalGenerico visible={visible} onClose={onClose} titulo="Editar Aluno">
      <View style={styles.container}>
        
        <Text style={styles.label}>Nome do Aluno</Text>
        <TextInput
          style={styles.input}
          value={nome}
          onChangeText={setNome}
          placeholder="Ex: João Silva"
        />

        <Text style={styles.label}>Número da Chamada</Text>
        <TextInput
          style={styles.input}
          value={numero}
          onChangeText={setNumero}
          keyboardType="numeric"
          placeholder="Ex: 12"
        />
        <View style={styles.switchContainer}>
          <View>
            <Text style={styles.statusLabel}>Status do Aluno</Text>
            <Text style={styles.statusSubLabel}>
              {ativo ? "O aluno está Ativo" : "O aluno está Inativo"}
            </Text>
          </View>
          <Switch
            trackColor={{ false: colors.borderLight, true: colors.secondary + '50' }} 
            thumbColor={ativo ? colors.secondary : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={setAtivo}
            value={ativo}
          />
        </View>
        <TouchableOpacity 
          style={[styles.button, (!nome.trim() || !numero || mutationAtualizarAluno.isPending) && styles.buttonDisabled]} 
          onPress={handleSalvar}
          disabled={mutationAtualizarAluno.isPending || mutationDeletarAluno.isPending}
        >
          {mutationAtualizarAluno.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Salvar Alterações</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={handleDeletar}
          disabled={mutationAtualizarAluno.isPending || mutationDeletarAluno.isPending}
        >
          {mutationDeletarAluno.isPending ? (
            <ActivityIndicator size="small" color={colors.danger} />
          ) : (
            <>
              <Icon name="trash-can-outline" size={20} color={colors.danger} />
              <Text style={styles.deleteText}>Excluir Aluno</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ModalGenerico>
  );
};

const styles = StyleSheet.create({
  container: { paddingVertical: 10 },
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
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  statusSubLabel: {
    fontSize: 12,
    color: colors.mutedText,
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