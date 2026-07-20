import React, { useState } from 'react';
import { TouchableOpacity, Alert, ActivityIndicator, Modal, View, Text, TextInput, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../store/useAppStore';
import  api  from '../services/api'; 
import { gerarEPDFDeNotas } from '../utils/pdfGenerator';
import { colors } from '../theme/colors';

export const ExportarNotasBotao = () => {
  const { user, idAnoSelecionado, idClasseSelecionada } = useAppStore();
  const navigation = useNavigation<any>();
  
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  const abrirFiltro = () => {
    if (!user?.isPremium) {
       Alert.alert(
         "Recurso Premium", 
         "A exportação de relatórios em PDF é exclusiva para professores Premium.",
         [
           { text: "Cancelar", style: "cancel" },
           { 
             text: "Assinar Premium", 
             onPress: () => navigation.navigate("ModalUpgrade") 
           } 
         ]
       );
       return;
    }

    if (!idAnoSelecionado && !idClasseSelecionada) {
       Alert.alert("Aviso", "Selecione um Ano ou uma Turma primeiro para exportar o relatório.");
       return;
    }

    setModalVisible(true);
  };

  const handleExportar = async () => {
    if (!dataInicio || !dataFim) {
        Alert.alert("Aviso", "Por favor, preencha as datas de início e fim do período.");
        return;
    }

    setModalVisible(false);
    setLoading(true);
    
    try {
      const tipo = idClasseSelecionada ? 'classe' : 'ano';
      const id = idClasseSelecionada || idAnoSelecionado;
      
      const response = await api.get(`/alunos/exportar/notas?tipo=${tipo}&id=${id}&dataInicio=${dataInicio}&dataFim=${dataFim}`);
      const alunos = response.data.data;

      if (alunos.length === 0) {
        Alert.alert("Aviso", "Nenhum aluno encontrado.");
        setLoading(false);
        return;
      }

      const temNotasNoPeriodo = alunos.some((a: any) => a.notas && a.notas.length > 0);
      if (!temNotasNoPeriodo) {
         Alert.alert("Aviso", "Não há notas lançadas neste período selecionado.");
         setLoading(false);
         return;
      }

      const tituloRelatorio = tipo === 'classe' ? 'Turma Específica' : 'Ano Completo';
      await gerarEPDFDeNotas(alunos, tituloRelatorio);
      
    } catch (error) {
      Alert.alert("Erro", "Não foi possível gerar o PDF da turma.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TouchableOpacity onPress={abrirFiltro} style={{ marginRight: 15 }}>
        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Icon name="file-pdf-box" size={28} color="#FF0000" /> 
        )}
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filtrar Período</Text>
            
            <Text style={styles.label}>Data de Início (AAAA-MM-DD):</Text>
            <TextInput 
              style={styles.input} 
              value={dataInicio} 
              onChangeText={setDataInicio} 
              placeholder="Ex: 2026-02-01" 
              keyboardType="numeric"
            />

            <Text style={styles.label}>Data Final (AAAA-MM-DD):</Text>
            <TextInput 
              style={styles.input} 
              value={dataFim} 
              onChangeText={setDataFim} 
              placeholder="Ex: 2026-06-30" 
              keyboardType="numeric"
            />

            <View style={styles.rowButtons}>
              <TouchableOpacity style={styles.btnCancelar} onPress={() => setModalVisible(false)}>
                <Text style={styles.txtBtnCancelar}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.btnExportar} onPress={handleExportar}>
                <Text style={styles.txtBtnExportar}>Gerar PDF</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 10,
    elevation: 5
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center'
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 6,
    padding: 10,
    marginBottom: 15,
    color: '#333'
  },
  rowButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10
  },
  btnCancelar: {
    padding: 12,
    borderRadius: 6,
    backgroundColor: '#EEE',
    flex: 0.45,
    alignItems: 'center'
  },
  txtBtnCancelar: {
    color: '#555',
    fontWeight: 'bold'
  },
  btnExportar: {
    padding: 12,
    borderRadius: 6,
    backgroundColor: '#2E7D32',
    flex: 0.45,
    alignItems: 'center'
  },
  txtBtnExportar: {
    color: '#FFF',
    fontWeight: 'bold'
  }
});