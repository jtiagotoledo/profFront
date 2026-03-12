import React, { useState, useMemo } from 'react';
import { 
  View, 
  FlatList, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { useAppStore } from '../store/useAppStore';
import { useAlunos, useClasses } from '../hooks/useEscolar';
import { useCadastrosEscolares } from '../hooks/useEscolarMutations';
import { FiltrosEscolar } from '../components/FiltroEscolar';
import { CalendarioModal } from '../components/CalendarioModal';
import { colors } from '../theme/colors';

function FrequenciaScreen() {
  const { idClasseSelecionada, idAnoSelecionado } = useAppStore();
  
  const { data: alunos, isLoading, isError } = useAlunos(idClasseSelecionada);
  const { data: classes } = useClasses(idAnoSelecionado);
  
  const { mutationUpdateFrequencia, mutationConfirmarDiaTotal } = useCadastrosEscolares();

  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  const dataFormatadaStr = format(dataSelecionada, 'yyyy-MM-dd');
  const classeAtual = classes?.find((c: any) => c._id === idClasseSelecionada);
  const diaJaRegistrado = classeAtual?.diasLetivos?.includes(dataFormatadaStr);

  const handleConfirmarPresencaTotal = () => {
    if (!idClasseSelecionada) return;
    Alert.alert(
      "Confirmar Presença Total",
      `Registrar presença para todos em ${format(dataSelecionada, "dd/MM")}?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          onPress: () => mutationConfirmarDiaTotal.mutate({ 
            classeId: idClasseSelecionada, 
            data: dataFormatadaStr 
          }) 
        }
      ]
    );
  };

  const renderAluno = ({ item }: any) => {
    const registro = item.frequencias?.find((f: any) => f.data.includes(dataFormatadaStr));
    const isPresente = registro ? registro.presente : true;
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
              Freq: {item.frequenciaPorcentagem || 0}%
            </Text>
          </View>
        </View>
        
        <TouchableOpacity
          onPress={() => mutationUpdateFrequencia.mutate({ 
            alunoId: item._id, 
            presente: !isPresente, 
            data: dataFormatadaStr 
          })}
          disabled={isMutating}
          style={[styles.statusBtn, isPresente ? styles.btnPresente : styles.btnAusente]}
        >
          {isMutating ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
               <Text style={[styles.statusBtnText, { color: isPresente ? '#fff' : colors.danger }]}>
                {isPresente ? 'PRESENTE' : 'AUSENTE'}
              </Text>
              <Icon 
                name={isPresente ? "check-circle" : "close-circle"} 
                size={20} 
                color={isPresente ? "#fff" : colors.danger} 
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
        <TouchableOpacity
          style={[styles.dateSelector, diaJaRegistrado && styles.dateSelectorSuccess]}
          onPress={() => setShowCalendar(true)}
        >
          <View style={[styles.calendarIconBox, diaJaRegistrado && { backgroundColor: colors.secondary }]}>
            <Icon name="calendar-month" size={24} color={colors.white} />
          </View>
          <View style={styles.dateTextBox}>
            <Text style={[styles.labelData, diaJaRegistrado && { color: colors.secondary }]}>
              {diaJaRegistrado ? "Chamada Realizada" : "Data da Chamada"}
            </Text>
            <Text style={styles.textData}>{format(dataSelecionada, "dd 'de' MMMM", { locale: ptBR })}</Text>
          </View>
          <Icon name={diaJaRegistrado ? "check-decagram" : "chevron-down"} size={20} color={diaJaRegistrado ? colors.secondary : colors.mutedText} />
        </TouchableOpacity>
      </View>

      <CalendarioModal 
        visivel={showCalendar}
        fechar={() => setShowCalendar(false)}
        dataSelecionada={dataSelecionada}
        aoSelecionarData={setDataSelecionada}
        diasMarcados={classeAtual?.diasLetivos || []}
      />

      <View style={styles.content}>
        {!idClasseSelecionada ? (
          <View style={styles.center}>
            <Icon name="account-search-outline" size={60} color={colors.borderLight} />
            <Text style={styles.emptyText}>Selecione uma classe para realizar a chamada.</Text>
          </View>
        ) : isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.secondary} />
            <Text style={[styles.emptyText, { marginTop: 10 }]}>Carregando alunos...</Text>
          </View>
        ) : isError ? (
          <View style={styles.center}>
            <Icon name="alert-circle-outline" size={50} color={colors.danger} />
            <Text style={[styles.emptyText, { color: colors.danger }]}>Erro ao carregar alunos.</Text>
          </View>
        ) : (
          <>
            <View style={styles.actionBar}>
              <View style={styles.statusIndicator}>
                 <View style={[styles.statusDot, { backgroundColor: diaJaRegistrado ? colors.secondary : '#FFB100' }]} />
                 <Text style={styles.statusText}>
                   {diaJaRegistrado ? "Chamada salva" : "Pendente"}
                 </Text>
              </View>
              {!diaJaRegistrado && (
                <TouchableOpacity style={styles.confirmAllBtn} onPress={handleConfirmarPresencaTotal}>
                  <Icon name="check-all" size={16} color="#fff" />
                  <Text style={styles.confirmAllText}>Presença Total</Text>
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={alunos?.filter((a: any) => a.ativo)}
              keyExtractor={(item) => item._id}
              renderItem={renderAluno}
              contentContainerStyle={styles.list}
              ListEmptyComponent={
                <View style={styles.center}>
                  <Icon name="account-off-outline" size={50} color={colors.borderLight} />
                  <Text style={styles.emptyText}>Nenhum aluno ativo encontrado nesta turma.</Text>
                </View>
              }
            />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1 },
  headerChamada: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  dateSelector: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: 'transparent' },
  dateSelectorSuccess: { borderColor: colors.secondary, backgroundColor: colors.secondary + '10' },
  calendarIconBox: { backgroundColor: colors.primary, padding: 8, borderRadius: 8, marginRight: 12 },
  dateTextBox: { flex: 1 },
  labelData: { fontSize: 10, fontWeight: 'bold', color: colors.mutedText, textTransform: 'uppercase' },
  textData: { fontSize: 15, fontWeight: 'bold', color: '#1F2937' },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { textAlign: 'center', color: colors.mutedText, fontSize: 14, marginTop: 12 },

  actionBar: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee', alignItems: 'center' },
  statusIndicator: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  statusText: { fontSize: 12, fontWeight: '600', color: colors.mutedText },
  confirmAllBtn: { backgroundColor: colors.secondary, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 4 },
  confirmAllText: { color: '#fff', fontWeight: 'bold', fontSize: 11 },

  list: { padding: 16, paddingBottom: 40 },
  alunoRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 8, elevation: 1 },
  alunoInfo: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  nome: { fontWeight: '600', color: '#111827', fontSize: 14 },
  porcentagemTexto: { fontSize: 10, color: colors.mutedText, marginTop: 2 },
  numeroBadge: { marginRight: 12, backgroundColor: '#F3F4F6', padding: 5, borderRadius: 6, width: 35, alignItems: 'center' },
  numeroText: { fontSize: 12, fontWeight: 'bold', color: colors.secondary },
  
  statusBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, gap: 4, minWidth: 100, justifyContent: 'center' },
  statusBtnText: { fontSize: 9, fontWeight: '900' },
  btnPresente: { backgroundColor: colors.secondary },
  btnAusente: { backgroundColor: colors.danger + '15', borderWidth: 1, borderColor: colors.danger },
});

export default FrequenciaScreen;