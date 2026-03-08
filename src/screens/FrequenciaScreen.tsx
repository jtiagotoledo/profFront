import React, { useState } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { useAppStore } from '../store/useAppStore';
import { useAlunos } from '../hooks/useEscolar';
import { useCadastrosEscolares } from '../hooks/useEscolarMutations';
import { FiltrosEscolar } from '../components/FiltroEscolar';
import { colors } from '../theme/colors';

interface Frequencia {
  data: string;
  presente: boolean;
}

interface Aluno {
  _id: string;
  nome: string;
  numeroChamada: number;
  frequencias: Frequencia[];
  ativo: boolean;
}

export const FrequenciaScreen = () => {
  const { idClasseSelecionada } = useAppStore();
  const { data: alunos, isLoading } = useAlunos(idClasseSelecionada);
  const { mutationUpdateFrequencia } = useCadastrosEscolares();

  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  // Filtra apenas alunos ativos para a chamada
  const alunosAtivos = alunos?.filter((a: Aluno) => a.ativo) || [];

  const handleToggleFrequencia = (alunoId: string, presenteAtual: boolean) => {
    mutationUpdateFrequencia.mutate({
      alunoId,
      presente: !presenteAtual,
      data: format(dataSelecionada, 'yyyy-MM-dd')
    });
  };

  const handleConfirmDate = (date: Date) => {
    setDataSelecionada(date);
    setDatePickerVisibility(false);
  };

  const renderAluno = ({ item }: { item: Aluno }) => {
    const dataAlvo = format(dataSelecionada, 'yyyy-MM-dd');
    
    // Verifica presença ignorando horas/minutos se vierem do banco
    const registroFrequencia = item.frequencias?.find(f => f.data.includes(dataAlvo));
    const isPresente = registroFrequencia ? registroFrequencia.presente : true;

    // Verifica se este aluno específico está sendo atualizado no momento
    const isMutating = mutationUpdateFrequencia.isPending && 
                       mutationUpdateFrequencia.variables?.alunoId === item._id;

    return (
      <View style={styles.alunoRow}>
        <View style={styles.alunoInfo}>
          <View style={styles.numeroBadge}>
            <Text style={styles.numeroText}>{item.numeroChamada.toString().padStart(2, '0')}</Text>
          </View>
          <Text style={styles.nome} numberOfLines={1}>{item.nome}</Text>
        </View>

        <TouchableOpacity
          onPress={() => handleToggleFrequencia(item._id, isPresente)}
          disabled={isMutating}
          style={[
            styles.statusBtn,
            isPresente ? styles.btnPresente : styles.btnAusente,
            isMutating && { opacity: 0.7 }
          ]}
        >
          {isMutating ? (
            <ActivityIndicator size="small" color={isPresente ? colors.white : colors.danger} />
          ) : (
            <>
              <Text style={[styles.statusBtnText, { color: isPresente ? colors.white : colors.danger }]}>
                {isPresente ? 'PRESENTE' : 'AUSENTE'}
              </Text>
              <Icon
                name={isPresente ? "check-circle" : "close-circle"}
                size={20}
                color={isPresente ? colors.white : colors.danger}
              />
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FiltrosEscolar />

      {/* Seletor de Data Estilizado */}
      <View style={styles.headerChamada}>
        <TouchableOpacity style={styles.dateSelector} onPress={() => setDatePickerVisibility(true)}>
          <View style={styles.calendarIconBox}>
            <Icon name="calendar-month" size={24} color={colors.white} />
          </View>
          <View style={styles.dateTextBox}>
            <Text style={styles.labelData}>Data da Chamada</Text>
            <Text style={styles.textData}>
              {format(dataSelecionada, "dd 'de' MMMM", { locale: ptBR })}
            </Text>
          </View>
          <Icon name="chevron-down" size={20} color={colors.mutedText} />
        </TouchableOpacity>
      </View>

      {!idClasseSelecionada ? (
        <View style={styles.center}>
          <Icon name="selection-marker" size={48} color={colors.borderLight} />
          <Text style={styles.infoText}>Selecione uma turma para carregar a lista de presença.</Text>
        </View>
      ) : isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={alunosAtivos}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          renderItem={renderAluno}
          ListEmptyComponent={
            <Text style={styles.infoText}>Nenhum aluno ativo encontrado nesta turma.</Text>
          }
        />
      )}

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirmDate}
        onCancel={() => setDatePickerVisibility(false)}
        date={dataSelecionada}
        locale="pt_BR"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerChamada: {
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 10,
  },
  calendarIconBox: {
    backgroundColor: colors.primary,
    padding: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  dateTextBox: { flex: 1 },
  labelData: { fontSize: 10, color: colors.mutedText, textTransform: 'uppercase', fontWeight: 'bold' },
  textData: { fontSize: 15, fontWeight: 'bold', color: '#1F2937' },
  list: { padding: 16, paddingBottom: 40 },
  alunoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
    // Sombra leve para aspecto de card profissional
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  alunoInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  numeroBadge: {
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  numeroText: { fontSize: 12, fontWeight: 'bold', color: colors.secondary },
  nome: { fontSize: 14, color: '#374151', fontWeight: '600', flexShrink: 1 },
  statusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    minWidth: 110,
    justifyContent: 'center',
  },
  btnPresente: { backgroundColor: colors.secondary },
  btnAusente: { 
    backgroundColor: colors.danger + '10', 
    borderWidth: 1, 
    borderColor: colors.danger 
  },
  statusBtnText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  infoText: { textAlign: 'center', color: colors.mutedText, marginTop: 12, fontSize: 14 },
});