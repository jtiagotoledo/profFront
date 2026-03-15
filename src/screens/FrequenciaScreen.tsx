import React, { useState, useEffect } from 'react';
import {
  View, FlatList, Text, StyleSheet, TextInput,
  TouchableOpacity, ActivityIndicator, Alert
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
  const [conteudoAula, setConteudoAula] = useState("");

  const dataFormatadaStr = format(dataSelecionada, 'yyyy-MM-dd');
  const classeAtual = classes?.find((c: any) => c._id === idClasseSelecionada);
  
  const registroDoDia = classeAtual?.diasLetivos?.find((d: any) => 
    (typeof d === 'string' ? d === dataFormatadaStr : d.data === dataFormatadaStr)
  );

  const diaJaRegistrado = !!registroDoDia || alunos?.some((a: any) => 
    a.frequencias?.some((f: any) => f.data.startsWith(dataFormatadaStr))
  );

  useEffect(() => {
    setConteudoAula(registroDoDia?.conteudo || "");
  }, [dataFormatadaStr, idClasseSelecionada, registroDoDia]);

  const handleToggleFrequencia = (alunoId: string, novoStatus: boolean) => {
    mutationUpdateFrequencia.mutate({ 
      alunoId, 
      presente: novoStatus, 
      data: dataFormatadaStr,
      conteudo: conteudoAula 
    });
  };

  const handleConfirmarPresencaTotal = () => {
    if (!idClasseSelecionada) return;
    Alert.alert(
      "Presença Total", 
      "Marcar todos como presentes?", 
      [
        { text: "Não" },
        { onPress: () => mutationConfirmarDiaTotal.mutate({ 
            classeId: idClasseSelecionada, 
            data: dataFormatadaStr, 
            conteudo: conteudoAula 
          }) 
        }
      ]
    );
  };

  const renderAluno = ({ item }: any) => {
    const registro = item.frequencias?.find((f: any) => f.data.startsWith(dataFormatadaStr));
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
            <Text style={[styles.porcentagemTexto, { color: (item.frequenciaPorcentagem || 0) < 75 ? colors.danger : colors.mutedText }]}>
              Freq: {item.frequenciaPorcentagem || 0}%
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => handleToggleFrequencia(item._id, !isPresente)}
          disabled={isMutating}
          style={[styles.statusBtn, isPresente ? styles.btnPresente : styles.btnAusente]}
        >
          {isMutating ? (
            <ActivityIndicator size="small" color={isPresente ? "#fff" : colors.danger} />
          ) : (
            <>
              <Text style={[styles.statusBtnText, { color: isPresente ? '#fff' : colors.danger }]}>
                {isPresente ? 'PRESENTE' : 'AUSENTE'}
              </Text>
              <Icon name={isPresente ? "check-circle" : "close-circle"} size={18} color={isPresente ? "#fff" : colors.danger} />
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
        <View style={styles.dateSelectorRow}>
          <TouchableOpacity
            style={[styles.dateSelector, diaJaRegistrado && styles.dateSelectorSuccess]}
            onPress={() => setShowCalendar(true)}
          >
            <View style={styles.dateTextBox}>
              <Text style={styles.textData}>
                <Icon name="calendar-month" size={16} color={diaJaRegistrado ? colors.secondary : colors.primary} />
                {"  "}{format(dataSelecionada, "dd 'de' MMMM", { locale: ptBR })}
              </Text>
            </View>
            <Icon 
              name={diaJaRegistrado ? "check-decagram" : "chevron-down"} 
              size={20} 
              color={diaJaRegistrado ? colors.secondary : colors.mutedText} 
            />
          </TouchableOpacity>

          {idClasseSelecionada && !diaJaRegistrado && (
            <TouchableOpacity style={styles.headerActionBtn} onPress={handleConfirmarPresencaTotal}>
              <Icon name="check-all" size={22} color={colors.secondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {idClasseSelecionada && (
        <View key={dataFormatadaStr} style={styles.diarioContainer}>
          <View style={styles.diarioInputRow}>
            <Icon name="book-open-variant" size={20} color={colors.mutedText} style={{ marginTop: 8 }} />
            <TextInput
              style={styles.diarioInput}
              placeholder="O que foi trabalhado hoje?"
              placeholderTextColor={colors.mutedText}
              multiline
              defaultValue={conteudoAula}
              onChangeText={setConteudoAula}
            />
          </View>
        </View>
      )}

      <CalendarioModal
        visivel={showCalendar}
        fechar={() => setShowCalendar(false)}
        dataSelecionada={dataSelecionada}
        aoSelecionarData={setDataSelecionada}
        diasMarcados={classeAtual?.diasLetivos?.map((d: any) => typeof d === 'string' ? d : d.data) || []}
      />

      {!idClasseSelecionada ? (
        <View style={styles.center}>
          <Icon name="account-search-outline" size={60} color={colors.borderLight} />
          <Text style={styles.emptyText}>Selecione uma classe para listar os alunos.</Text>
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
        <FlatList
          data={alunos?.filter((a: any) => a.ativo)}
          keyExtractor={(item) => item._id}
          renderItem={renderAluno}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="always"
          extraData={diaJaRegistrado} 
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerChamada: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  dateSelectorRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dateSelector: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  dateSelectorSuccess: { borderColor: colors.secondary, backgroundColor: colors.secondary + '10' },
  dateTextBox: { flex: 1 },
  textData: { fontSize: 14, fontWeight: '700', color: '#1F2937' },
  headerActionBtn: { backgroundColor: colors.secondary + '15', padding: 8, borderRadius: 8 },
  diarioContainer: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.borderLight, elevation: 1 },
  diarioInputRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  diarioInput: { flex: 1, fontSize: 14, color: '#374151', minHeight: 45, maxHeight: 100, textAlignVertical: 'top' },
  list: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 40 },
  alunoRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 10, borderRadius: 10, marginBottom: 8, elevation: 1 },
  alunoInfo: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  nome: { fontWeight: '600', color: '#111827', fontSize: 14 },
  porcentagemTexto: { fontSize: 10, color: colors.mutedText },
  numeroBadge: { marginRight: 10, backgroundColor: '#F3F4F6', padding: 4, borderRadius: 4, width: 30, alignItems: 'center' },
  numeroText: { fontSize: 11, fontWeight: 'bold', color: colors.secondary },
  statusBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 6, gap: 4, minWidth: 95, justifyContent: 'center' },
  statusBtnText: { fontSize: 8, fontWeight: '900' },
  btnPresente: { backgroundColor: colors.secondary },
  btnAusente: { backgroundColor: colors.danger + '15', borderWidth: 1, borderColor: colors.danger },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 100 },
  emptyText: { textAlign: 'center', color: colors.mutedText, fontSize: 14, fontWeight: '500' },
});

export default FrequenciaScreen;