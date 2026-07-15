import React, { useState } from 'react';
import { TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppStore } from '../store/useAppStore';
import  api  from '../services/api'; 
import { gerarEPDFDeNotas } from '../utils/pdfGenerator';
import { colors } from '../theme/colors';

export const ExportarNotasBotao = () => {
  const { user, idAnoSelecionado, idClasseSelecionada } = useAppStore();
  const [loading, setLoading] = useState(false);

  const handleExportar = async () => {
    if (!user?.isPremium) {
       Alert.alert("Recurso Premium", "A exportação de relatórios em PDF é exclusiva para professores Premium.");
       return;
    }

    if (!idAnoSelecionado && !idClasseSelecionada) {
       Alert.alert("Aviso", "Selecione um Ano ou uma Turma primeiro.");
       return;
    }

    setLoading(true);
    try {
      const tipo = idClasseSelecionada ? 'classe' : 'ano';
      const id = idClasseSelecionada || idAnoSelecionado;
      
      const response = await api.get(`/alunos/exportar/notas?tipo=${tipo}&id=${id}`);
      const alunos = response.data.data;

      if (alunos.length === 0) {
        Alert.alert("Aviso", "Nenhum aluno encontrado para gerar relatório.");
        setLoading(false);
        return;
      }

      const tituloRelatorio = tipo === 'classe' ? 'Turma_Especifica' : 'Ano_Completo';
      await gerarEPDFDeNotas(alunos, tituloRelatorio);
      
    } catch (error) {
      Alert.alert("Erro", "Não foi possível gerar o PDF.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity onPress={handleExportar} style={{ marginRight: 15 }}>
      {loading ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
        <Icon name="file-pdf-box" size={28} color="#FF0000" /> 
      )}
    </TouchableOpacity>
  );
};