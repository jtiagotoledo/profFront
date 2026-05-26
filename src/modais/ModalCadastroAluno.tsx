import React, { useState } from 'react';
import { 
  TextInput, TouchableOpacity, Text, StyleSheet, 
  View, ActivityIndicator, Alert 
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { ModalGenerico } from '../components/ModalGenerico';
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
  
  const { mutationAluno } = useCadastrosEscolares();
  
  // Puxa o user global para verificar o status Premium
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

  const handleSelecionarArquivo = async () => {
    // 1. VERIFICAÇÃO PREMIUM
    if (!user?.isPremium) {
      Alert.alert(
        "Funcionalidade Premium 💎", 
        "A importação de alunos em massa via Excel é exclusiva para assinantes Premium. Faça o upgrade para economizar tempo!"
      );
      return;
    }

    // 2. SELEÇÃO DO ARQUIVO (Lógica da Fase 2)
    try {
      const result = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.xls, DocumentPicker.types.xlsx],
        presentationStyle: 'fullScreen',
      });

      console.log("Arquivo selecionado:", result);
      Alert.alert("Arquivo Selecionado", `Pronto para enviar: ${result.name}`);
      
      // NOTA: Na Fase 4, chamaremos a mutation aqui para enviar o 'result' para o backend!

    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log("Usuário cancelou a seleção do arquivo.");
      } else {
        console.error("Erro ao selecionar arquivo:", err);
        Alert.alert("Erro", "Não foi possível selecionar o arquivo.");
      }
    }
  };

  return (
    <ModalGenerico visible={visible} onClose={onClose} titulo="Novo Aluno">
      <View style={styles.container}>
        
        {/* === FORMULÁRIO MANUAL === */}
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

        {/* === SEPARADOR === */}
        <View style={styles.separadorOu}>
          <View style={styles.linhaSeparador} />
          <Text style={styles.textoOu}>OU</Text>
          <View style={styles.linhaSeparador} />
        </View>

        {/* === BOTÃO DE IMPORTAÇÃO (PREMIUM) === */}
        <TouchableOpacity 
          style={[styles.btnImportar, !user?.isPremium && styles.btnImportarBloqueado]} 
          onPress={handleSelecionarArquivo}
        >
          <Icon name={user?.isPremium ? "file-excel" : "lock"} size={22} color={colors.white} />
          <Text style={styles.btnImportarTexto}>
            Importar via Excel (.xls)
          </Text>
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
  },
  
  // Estilos da nova secção de Importação
  separadorOu: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  linhaSeparador: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderLight,
  },
  textoOu: {
    color: colors.mutedText,
    fontWeight: 'bold',
    marginHorizontal: 15,
    fontSize: 12,
  },
  btnImportar: {
    flexDirection: 'row',
    backgroundColor: '#107C41', // Verde clássico do Excel
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnImportarBloqueado: {
    backgroundColor: colors.mutedText, 
  },
  btnImportarTexto: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 15,
  },
});