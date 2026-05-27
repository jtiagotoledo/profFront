import React, { useState } from 'react';
import { 
  TextInput, TouchableOpacity, Text, StyleSheet, 
  View, ActivityIndicator, Alert 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { ModalGenerico } from '../components/ModalGenerico';
import { ModalImportacaoExcel } from './ModalImportacaoExcel'; // <-- Importação do novo modal
import { useCadastrosEscolares } from '../hooks/useEscolarMutations';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';

interface ModalCadastroAlunoProps {
  visible: boolean;
  onClose: () => void;
  idClasseSelecionada: string | null;
}

export const ModalCadastroAluno = ({ visible, onClose, idClasseSelecionada }: ModalCadastroAlunoProps) => {
  const [nome, setNome] = useState('');
  const [numero, setNumero] = useState(''); 
  const [modalExcelVisivel, setModalExcelVisivel] = useState(false); // Estado para abrir o novo modal
  
  const { mutationAluno } = useCadastrosEscolares();
  const { user } = useAppStore();

  const isFormInvalido = !nome.trim() || !numero || !idClasseSelecionada;

  const handleSalvarManual = () => {
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

  const handleAbrirInstrucoesExcel = () => {
    // A trava premium continua aqui
    if (!user?.isPremium) {
      Alert.alert(
        "Funcionalidade Premium 💎", 
        "A importação de alunos em massa via Excel é exclusiva para assinantes Premium. Faça o upgrade para economizar tempo!"
      );
      return;
    }
    // Abre o novo modal visual
    setModalExcelVisivel(true);
  };

  return (
    <>
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
            onPress={handleSalvarManual}
            disabled={isFormInvalido || mutationAluno.isPending}
          >
            {mutationAluno.isPending ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.buttonText}>Cadastrar Aluno</Text>
            )}
          </TouchableOpacity>

          <View style={styles.separadorOu}>
            <View style={styles.linhaSeparador} />
            <Text style={styles.textoOu}>OU</Text>
            <View style={styles.linhaSeparador} />
          </View>

          {/* Botão que agora abre o modal de instruções */}
          <TouchableOpacity 
            style={[styles.btnImportar, !user?.isPremium && styles.btnImportarBloqueado]} 
            onPress={handleAbrirInstrucoesExcel}
          >
            <Icon name={user?.isPremium ? "file-excel" : "lock"} size={22} color={colors.white} />
            <Text style={styles.btnImportarTexto}>
              Importar via Excel (.xls)
            </Text>
          </TouchableOpacity>

        </View>
      </ModalGenerico>

      {/* Renderiza o novo Modal por cima deste */}
      <ModalImportacaoExcel 
        visible={modalExcelVisivel} 
        onClose={() => setModalExcelVisivel(false)} 
        idClasseSelecionada={idClasseSelecionada}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: { paddingVertical: 10 },
  labelField: { fontSize: 12, color: colors.mutedText, marginBottom: 6, fontWeight: '600', textTransform: 'uppercase' },
  input: { borderWidth: 1, borderColor: colors.borderLight, padding: 12, borderRadius: 8, marginBottom: 15, fontSize: 16, backgroundColor: '#F9F9F9', color: '#333' },
  button: { backgroundColor: colors.primary, padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonDisabled: { backgroundColor: colors.borderLight, opacity: 0.8 },
  buttonText: { color: colors.white, fontWeight: 'bold', fontSize: 16 },
  separadorOu: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  linhaSeparador: { flex: 1, height: 1, backgroundColor: colors.borderLight },
  textoOu: { color: colors.mutedText, fontWeight: 'bold', marginHorizontal: 15, fontSize: 12 },
  btnImportar: { flexDirection: 'row', backgroundColor: '#107C41', padding: 14, borderRadius: 8, alignItems: 'center', justifyContent: 'center', gap: 8 },
  btnImportarBloqueado: { backgroundColor: colors.mutedText },
  btnImportarTexto: { color: colors.white, fontWeight: 'bold', fontSize: 15 },
});