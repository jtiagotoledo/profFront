import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { pick, isErrorWithCode, errorCodes } from '@react-native-documents/picker';

import { ModalGenerico } from '../components/ModalGenerico';
import { colors } from '../theme/colors';

interface ModalImportacaoExcelProps {
  visible: boolean;
  onClose: () => void;
}

export const ModalImportacaoExcel = ({ visible, onClose }: ModalImportacaoExcelProps) => {

  const handleSelecionarArquivo = async () => {
    try {
      const [result] = await pick({
        type: [
          'application/vnd.ms-excel', 
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ],
        presentationStyle: 'fullScreen',
      });

      console.log("Arquivo selecionado:", result);
      Alert.alert("Arquivo Selecionado", `Pronto para enviar: ${result.name}`);
      
      // Fecha este modal após selecionar o arquivo com sucesso
      onClose();
      // NOTA: Na Fase 4, chamaremos a mutation aqui para enviar para o backend!

    } catch (err) {
      if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) {
        console.log("Usuário cancelou a seleção.");
      } else {
        console.error("Erro ao selecionar arquivo:", err);
        Alert.alert("Erro", "Não foi possível acessar o gerenciador de arquivos.");
      }
    }
  };

  return (
    <ModalGenerico visible={visible} onClose={onClose} titulo="Como formatar a planilha?">
      <View style={styles.container}>
        
        <Text style={styles.textoInstrucao}>
          Para que o sistema leia os dados corretamente, crie sua planilha exatamente com este padrão:
        </Text>

        {/* --- EXEMPLO VISUAL DE PLANILHA (Construído com Views) --- */}
        <View style={styles.planilhaContainer}>
          {/* Cabeçalho das Colunas (A, B) */}
          <View style={styles.linhaLetras}>
            <View style={styles.celulaIndex}><Text style={styles.textoIndex}></Text></View>
            <View style={styles.celulaLetra}><Text style={styles.textoLetra}>A</Text></View>
            <View style={styles.celulaLetra}><Text style={styles.textoLetra}>B</Text></View>
          </View>
          
          {/* Linha 1: Títulos */}
          <View style={styles.linhaPlanilha}>
            <View style={styles.celulaIndex}><Text style={styles.textoIndex}>1</Text></View>
            <View style={styles.celulaDestaque}><Text style={styles.textoDestaque}>Numero</Text></View>
            <View style={styles.celulaDestaque}><Text style={styles.textoDestaque}>Nome</Text></View>
          </View>

          {/* Linha 2: Dados */}
          <View style={styles.linhaPlanilha}>
            <View style={styles.celulaIndex}><Text style={styles.textoIndex}>2</Text></View>
            <View style={styles.celulaDados}><Text style={styles.textoDados}>1</Text></View>
            <View style={styles.celulaDados}><Text style={styles.textoDados}>Ana Beatriz</Text></View>
          </View>

          {/* Linha 3: Dados */}
          <View style={styles.linhaPlanilha}>
            <View style={styles.celulaIndex}><Text style={styles.textoIndex}>3</Text></View>
            <View style={styles.celulaDados}><Text style={styles.textoDados}>2</Text></View>
            <View style={styles.celulaDados}><Text style={styles.textoDados}>Carlos Eduardo</Text></View>
          </View>
        </View>

        {/* SE QUISER USAR UMA IMAGEM REAL NO FUTURO, APAGUE A VIEW ACIMA E USE ISTO:
        <Image 
          source={require('../assets/sua-imagem-planilha.png')} 
          style={{ width: '100%', height: 150, resizeMode: 'contain', marginVertical: 15 }} 
        /> 
        */}

        <View style={styles.dicasContainer}>
          <Text style={styles.dica}>• Não deixe a 1ª linha em branco.</Text>
          <Text style={styles.dica}>• Salve o arquivo no formato <Text style={{fontWeight: 'bold'}}>.xls</Text> ou <Text style={{fontWeight: 'bold'}}>.xlsx</Text></Text>
        </View>

        {/* BOTÃO QUE ABRE O GERENCIADOR */}
        <TouchableOpacity style={styles.btnSelecionar} onPress={handleSelecionarArquivo}>
          <Icon name="folder-search-outline" size={22} color={colors.white} />
          <Text style={styles.btnSelecionarTexto}>Escolher Arquivo no Celular</Text>
        </TouchableOpacity>

      </View>
    </ModalGenerico>
  );
};

const styles = StyleSheet.create({
  container: { paddingVertical: 10 },
  textoInstrucao: {
    fontSize: 14,
    color: colors.darkText,
    marginBottom: 15,
    lineHeight: 20,
  },
  
  // Estilos da "Falsa Planilha"
  planilhaContainer: {
    borderWidth: 1,
    borderColor: '#C0C0C0',
    backgroundColor: colors.white,
    marginBottom: 15,
  },
  linhaLetras: { flexDirection: 'row', backgroundColor: '#E6E6E6' },
  linhaPlanilha: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#C0C0C0' },
  celulaIndex: { width: 30, backgroundColor: '#E6E6E6', justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderRightColor: '#C0C0C0' },
  celulaLetra: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 4, borderRightWidth: 1, borderRightColor: '#C0C0C0' },
  celulaDestaque: { flex: 1, paddingVertical: 6, paddingHorizontal: 8, borderRightWidth: 1, borderRightColor: '#C0C0C0' },
  celulaDados: { flex: 1, paddingVertical: 6, paddingHorizontal: 8, borderRightWidth: 1, borderRightColor: '#C0C0C0' },
  textoIndex: { fontSize: 12, color: '#666' },
  textoLetra: { fontSize: 12, color: '#333', fontWeight: 'bold' },
  textoDestaque: { fontSize: 13, fontWeight: 'bold', color: colors.darkText },
  textoDados: { fontSize: 13, color: colors.mutedText },

  dicasContainer: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  dica: { fontSize: 13, color: colors.mutedText, marginBottom: 4 },
  
  btnSelecionar: {
    flexDirection: 'row',
    backgroundColor: colors.secondary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnSelecionarTexto: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});