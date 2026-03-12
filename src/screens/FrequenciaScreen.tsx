import React, { useState, useMemo } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Calendar, LocaleConfig } from 'react-native-calendars'; // Import do Calendário
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { useAppStore } from '../store/useAppStore';
import { useAlunos, useClasses } from '../hooks/useEscolar';
import { useCadastrosEscolares } from '../hooks/useEscolarMutations';
import { FiltrosEscolar } from '../components/FiltroEscolar';
import { colors } from '../theme/colors';

// Configuração do calendário para Português
LocaleConfig.locales['pt-br'] = {
  monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
  monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
  dayNames: ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'],
  dayNamesShort: ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'],
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt-br';

function FrequenciaScreen() {
  const { idClasseSelecionada, idAnoSelecionado } = useAppStore();
  const { data: alunos, isLoading: loadingAlunos } = useAlunos(idClasseSelecionada);
  const { data: classes } = useClasses(idAnoSelecionado);
  const { mutationUpdateFrequencia, mutationConfirmarDiaTotal } = useCadastrosEscolares();

  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  const dataFormatadaStr = format(dataSelecionada, 'yyyy-MM-dd');
  const classeAtual = classes?.find((c: any) => c._id === idClasseSelecionada);
  const diaJaRegistrado = classeAtual?.diasLetivos?.includes(dataFormatadaStr);

  // --- LÓGICA DAS BOLINHAS (Marcadores) ---
  const markedDates = useMemo(() => {
    const marks: any = {};

    // 1. Coloca bolinha em todos os dias que já tiveram chamada
    classeAtual?.diasLetivos?.forEach((data: string) => {
      marks[data] = {
        marked: true,
        dotColor: colors.secondary, // Cor da bolinha
      };
    });

    // 2. Destaca o dia que está atualmente selecionado na tela
    marks[dataFormatadaStr] = {
      ...marks[dataFormatadaStr],
      selected: true,
      selectedColor: colors.primary,
    };

    return marks;
  }, [classeAtual?.diasLetivos, dataFormatadaStr]);

  const handleDayPress = (day: any) => {
    // day.dateString vem no formato 'yyyy-MM-dd'
    const novaData = new Date(day.timestamp + (new Date().getTimezoneOffset() * 60000));
    setDataSelecionada(novaData);
    setShowCalendar(false);
  };

  const handleConfirmarPresencaTotal = () => {
    if (!idClasseSelecionada) return;
    Alert.alert(
      "Confirmar Presença Total",
      `Registrar presença para todos em ${format(dataSelecionada, "dd/MM")}?`,
      [
        { text: "Cancelar", style: "cancel" },
        { onPress: () => mutationConfirmarDiaTotal.mutate({ classeId: idClasseSelecionada, data: dataFormatadaStr }) }
      ]
    );
  };

  const renderAluno = ({ item }: any) => {
    const registro = item.frequencias?.find((f: any) => f.data.includes(dataFormatadaStr));
    const isPresente = registro ? registro.presente : true;
    const isMutating = mutationUpdateFrequencia.isPending && mutationUpdateFrequencia.variables?.alunoId === item._id;

    return (
      <View style={styles.alunoRow}>
        <View style={styles.alunoInfo}>
          <View style={styles.numeroBadge}>
            <Text style={styles.numeroText}>{item.numeroChamada.toString().padStart(2, '0')}</Text>
          </View>
          <View>
            <Text style={styles.nome}>{item.nome}</Text>
            <Text style={styles.porcentagemTexto}>Frequência: {item.frequenciaPorcentagem || 0}%</Text>
          </View>
        </View>
        <TouchableOpacity 
          onPress={() => mutationUpdateFrequencia.mutate({ alunoId: item._id, presente: !isPresente, data: dataFormatadaStr })}
          disabled={isMutating}
          style={[styles.statusBtn, isPresente ? styles.btnPresente : styles.btnAusente]}
        >
          {isMutating ? <ActivityIndicator size="small" color="#fff" /> : (
            <Icon name={isPresente ? "check-circle" : "close-circle"} size={20} color={isPresente ? "#fff" : colors.danger} />
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FiltrosEscolar />

      {/* Botão que abre o Calendário Customizado */}
      <View style={styles.headerChamada}>
        <TouchableOpacity 
          style={[styles.dateSelector, diaJaRegistrado && styles.dateSelectorSuccess]} 
          onPress={() => setShowCalendar(true)}
        >
          <View style={[styles.calendarIconBox, diaJaRegistrado && { backgroundColor: colors.secondary }]}>
            <Icon name="calendar-month" size={24} color={colors.white} />
          </View>
          <View style={styles.dateTextBox}>
            <Text style={styles.labelData}>{diaJaRegistrado ? "Chamada Realizada" : "Data da Chamada"}</Text>
            <Text style={styles.textData}>{format(dataSelecionada, "dd 'de' MMMM", { locale: ptBR })}</Text>
          </View>
          <Icon name="chevron-down" size={20} color={colors.mutedText} />
        </TouchableOpacity>
      </View>

      <Modal visible={showCalendar} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.calendarCard}>
            <View style={styles.calendarHeader}>
              <Text style={styles.calendarTitle}>Selecione a Data</Text>
              <TouchableOpacity onPress={() => setShowCalendar(false)}>
                <Icon name="close" size={24} color={colors.darkText} />
              </TouchableOpacity>
            </View>
            
            <Calendar
              current={dataFormatadaStr}
              markedDates={markedDates}
              onDayPress={handleDayPress}
              theme={{
                selectedDayBackgroundColor: colors.primary,
                todayTextColor: colors.primary,
                dotColor: colors.secondary,
                arrowColor: colors.primary,
              }}
            />
            
            <View style={styles.calendarFooter}>
              <View style={styles.legendItem}>
                <View style={[styles.dot, { backgroundColor: colors.secondary }]} />
                <Text style={styles.legendText}>Dias com chamada feita</Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {idClasseSelecionada && !loadingAlunos && (
        <View style={styles.actionBar}>
           <Text style={styles.statusText}>
             {diaJaRegistrado ? "✅ Registro salvo" : "⏳ Pendente"}
           </Text>
          {!diaJaRegistrado && (
            <TouchableOpacity style={styles.confirmAllBtn} onPress={handleConfirmarPresencaTotal}>
              <Text style={styles.confirmAllText}>Presença Total</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <FlatList
        data={alunos?.filter((a: any) => a.ativo)}
        keyExtractor={(item) => item._id}
        renderItem={renderAluno}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerChamada: { padding: 16, backgroundColor: '#fff' },
  dateSelector: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 12, padding: 10 },
  dateSelectorSuccess: { borderColor: colors.secondary, borderWidth: 1, backgroundColor: colors.secondary + '10' },
  calendarIconBox: { backgroundColor: colors.primary, padding: 8, borderRadius: 8, marginRight: 12 },
  dateTextBox: { flex: 1 },
  labelData: { fontSize: 10, fontWeight: 'bold', color: colors.mutedText },
  textData: { fontSize: 15, fontWeight: 'bold' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  calendarCard: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', paddingBottom: 10 },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  calendarTitle: { fontSize: 16, fontWeight: 'bold' },
  calendarFooter: { padding: 16, borderTopWidth: 1, borderTopColor: '#eee' },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  legendText: { fontSize: 12, color: colors.mutedText },

  actionBar: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  confirmAllBtn: { backgroundColor: colors.secondary, paddingHorizontal: 15, paddingVertical: 6, borderRadius: 20 },
  confirmAllText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  statusText: { fontSize: 12, fontWeight: '600' },
  
  list: { padding: 16 },
  alunoRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 8 },
  alunoInfo: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  nome: { fontWeight: '600' },
  porcentagemTexto: { fontSize: 10, color: colors.mutedText },
  numeroBadge: { marginRight: 10, backgroundColor: '#eee', padding: 5, borderRadius: 5 },
  numeroText: { fontSize: 12, fontWeight: 'bold' },
  statusBtn: { padding: 10, borderRadius: 8 },
  btnPresente: { backgroundColor: colors.secondary },
  btnAusente: { backgroundColor: colors.danger + '20' },
});

export default FrequenciaScreen;