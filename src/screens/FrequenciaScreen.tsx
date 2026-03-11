import React, { useState } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { useAppStore } from '../store/useAppStore';
import { useAlunos, useClasses } from '../hooks/useEscolar'; // Certifique-se de ter o hook useClasses
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
  frequenciaPorcentagem?: number;
}

function FrequenciaScreen() {
  const { idClasseSelecionada, idAnoSelecionado } = useAppStore();
  
  const { data: alunos, isLoading: loadingAlunos } = useAlunos(idClasseSelecionada);
  const { data: classes } = useClasses(idAnoSelecionado);
  
  const { mutationUpdateFrequencia, mutationConfirmarDiaTotal } = useCadastrosEscolares();

  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const dataFormatada = format(dataSelecionada, 'yyyy-MM-dd');
  const classeAtual = classes?.find((c: any) => c._id === idClasseSelecionada);
  const diaJaRegistrado = classeAtual?.diasLetivos?.includes(dataFormatada);

  const alunosAtivos = alunos?.filter((a: Aluno) => a.ativo) || [];

  const handleToggleFrequencia = (alunoId: string, presenteAtual: boolean) => {
    mutationUpdateFrequencia.mutate({
      alunoId,
      presente: !presenteAtual,
      data: dataFormatada
    });
  };

  const handleConfirmarPresencaTotal = () => {
    if (!idClasseSelecionada) return;
    
    Alert.alert(
      "Confirmar Dia",
      `Deseja registrar presença total para todos os alunos em ${format(dataSelecionada, "dd/MM")}?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Confirmar", 
          onPress: () => mutationConfirmarDiaTotal.mutate({ 
            classeId: idClasseSelecionada, 
            data: dataFormatada 
          }) 
        }
      ]
    );
  };

  const renderAluno = ({ item }: { item: Aluno }) => {
    const registroFrequencia = item.frequencias?.find(f => f.data.includes(dataFormatada));
    const isPresente = registroFrequencia ? registroFrequencia.presente : true;

    const isMutating = mutationUpdateFrequencia.isPending && 
                       mutationUpdateFrequencia.variables?.alunoId === item._id;

    return (
      <View style={styles.alunoRow}>
        <View style={styles.alunoInfo}>
          <View style={styles.numeroBadge}>
            <Text style={styles.numeroText}>{item.numeroChamada.toString().padStart(2, '0')}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.nome} numberOfLines={1}>{item.nome}</Text>
            <Text style={[
              styles.porcentagemTexto, 
              { color: (item.frequenciaPorcentagem || 0) < 75 ? colors.danger : colors.mutedText }
            ]}>
              Freq: {item.frequenciaPorcentagem}%
            </Text>
          </View>
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
          <Icon name={diaJaRegistrado ? "check-decagram" : "chevron-down"} size={20} color={diaJaRegistrado ? colors.secondary : colors.mutedText} />
        </TouchableOpacity>
      </View>

      {idClasseSelecionada && !loadingAlunos && (
        <View style={styles.actionBar}>
          <View style={styles.statusIndicator}>
             <View style={[styles.statusDot, { backgroundColor: diaJaRegistrado ? colors.secondary : '#FFB100' }]} />
             <Text style={styles.statusText}>
               {diaJaRegistrado ? "Chamada Realizada" : "Pendente"}
             </Text>
          </View>

          {!diaJaRegistrado && (
            <TouchableOpacity 
              style={styles.confirmAllBtn} 
              onPress={handleConfirmarPresencaTotal}
              disabled={mutationConfirmarDiaTotal.isPending}
            >
              {mutationConfirmarDiaTotal.isPending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Icon name="check-all" size={16} color="#fff" />
                  <Text style={styles.confirmAllText}>Presença Total</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}

      {!idClasseSelecionada ? (
        <View style={styles.center}>
          <Icon name="selection-marker" size={48} color={colors.borderLight} />
          <Text style={styles.infoText}>Selecione uma turma para carregar a lista.</Text>
        </View>
      ) : loadingAlunos ? (
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
            <Text style={styles.infoText}>Nenhum aluno ativo encontrado.</Text>
          }
        />
      )}

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={(date) => { setDataSelecionada(date); setDatePickerVisibility(false); }}
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
    zIndex: 1,
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
  
  // Barra de Ações
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  statusIndicator: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  statusText: { fontSize: 12, fontWeight: '600', color: colors.mutedText },
  confirmAllBtn: {
    backgroundColor: colors.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4
  },
  confirmAllText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },

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
    elevation: 1,
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
  nome: { fontSize: 14, color: '#374151', fontWeight: '600' },
  porcentagemTexto: { fontSize: 10, fontWeight: '500', marginTop: 2 },
  
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

export default FrequenciaScreen;