import React, { useState, useEffect, useRef } from 'react';
import {
  View, FlatList, Text, StyleSheet, TextInput,
  TouchableOpacity, ActivityIndicator, Alert, Keyboard
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

function NotasScreen() {
  const { idClasseSelecionada, idAnoSelecionado } = useAppStore();
  
  const { data: alunos, isLoading, isError } = useAlunos(idClasseSelecionada);
  const { data: classes } = useClasses(idAnoSelecionado);
  
  const { mutationLancarNotasEmLote, mutationConfirmarProva } = useCadastrosEscolares();

  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [tituloProva, setTituloProva] = useState("");
  const [notasLocais, setNotasLocais] = useState<{[key: string]: string}>({});

  const inputRefs = useRef<{[key: string]: TextInput | null}>({});

  const dataFormatadaStr = format(dataSelecionada, 'yyyy-MM-dd');
  const classeAtual = classes?.find((c: any) => c._id === idClasseSelecionada);
  
  const provaDoDia = classeAtual?.diasProvas?.find((p: any) => p.data === dataFormatadaStr);
  const diaComProva = !!provaDoDia;

  useEffect(() => {
    setTituloProva(provaDoDia?.titulo || "");

    const novasNotas: {[key: string]: string} = {};
    alunos?.forEach((aluno: any) => {
      const notaExistente = aluno.notas?.find((n: any) => n.data === dataFormatadaStr);
      novasNotas[aluno._id] = notaExistente ? notaExistente.valor.toString() : "";
    });
    setNotasLocais(novasNotas);
  }, [dataFormatadaStr, idClasseSelecionada, provaDoDia, alunos]);

  const handleSalvarTudo = () => {
    if (!idClasseSelecionada) return;
    if (!tituloProva.trim()) {
      return Alert.alert("Atenção", "Informe o título da avaliação antes de salvar.");
    }

    const payloadNotas = Object.keys(notasLocais).map(alunoId => ({
      alunoId,
      valor: parseFloat(notasLocais[alunoId].replace(',', '.')) || 0
    }));

    mutationConfirmarProva.mutate({
      classeId: idClasseSelecionada,
      data: dataFormatadaStr,
      titulo: tituloProva
    });

    mutationLancarNotasEmLote.mutate({
      data: dataFormatadaStr,
      notas: payloadNotas
    }, {
      onSuccess: () => Alert.alert("Sucesso", "Notas e título salvos com sucesso!")
    });
  };

  const renderAluno = ({ item, index }: any) => {
    const valorNota = notasLocais[item._id] || "";

    return (
      <View style={styles.alunoRow}>
        <View style={styles.alunoInfo}>
          <View style={styles.numeroBadge}>
            <Text style={styles.numeroText}>{item.numeroChamada.toString().padStart(2, '0')}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.nome} numberOfLines={1}>{item.nome}</Text>
            <Text style={styles.mediaTexto}>Média Atual: {item.media || 0}</Text>
          </View>
        </View>

        <TextInput
          ref={(el) => { inputRefs.current[item._id] = el; }}
          style={styles.notaInput}
          keyboardType="numeric"
          placeholder="0.0"
          value={valorNota}
          selectTextOnFocus={true} 
          onChangeText={(val) => setNotasLocais(prev => ({ ...prev, [item._id]: val }))}
          returnKeyType={index === alunos.length - 1 ? "done" : "next"}
          onSubmitEditing={() => {
            const proximo = alunos[index + 1];
            if (proximo) inputRefs.current[proximo._id]?.focus();
            else Keyboard.dismiss();
          }}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FiltrosEscolar />

      <View style={styles.headerNotas}>
        <View style={styles.topRow}>
          <TouchableOpacity
            style={[styles.dateSelector, diaComProva && styles.dateSelectorSuccess]}
            onPress={() => setShowCalendar(true)}
          >
            <View style={styles.dateTextBox}>
              <Text style={styles.textData}>
                <Icon name="calendar-star" size={16} color={diaComProva ? colors.secondary : colors.primary} />
                {"  "}{format(dataSelecionada, "dd 'de' MMMM", { locale: ptBR })}
              </Text>
            </View>
            <Icon 
              name={diaComProva ? "check-decagram" : "chevron-down"} 
              size={20} 
              color={diaComProva ? colors.secondary : colors.mutedText} 
            />
          </TouchableOpacity>

          {idClasseSelecionada && (
            <TouchableOpacity 
              style={styles.btnSalvarLote} 
              onPress={handleSalvarTudo}
              disabled={mutationLancarNotasEmLote.isPending}
            >
              {mutationLancarNotasEmLote.isPending ? (
                <ActivityIndicator size="small" color={colors.secondary} />
              ) : (
                <Icon name="content-save-all" size={24} color={colors.secondary} />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {idClasseSelecionada && (
        <View style={styles.tituloContainer}>
          <View style={styles.tituloInputRow}>
            <Icon name="format-title" size={20} color={colors.mutedText} />
            <TextInput
              style={styles.tituloInput}
              placeholder="Ex: Prova Mensal, Trabalho 1..."
              placeholderTextColor={colors.mutedText}
              value={tituloProva}
              onChangeText={setTituloProva}
            />
          </View>
        </View>
      )}

      <CalendarioModal
        visivel={showCalendar}
        fechar={() => setShowCalendar(false)}
        dataSelecionada={dataSelecionada}
        aoSelecionarData={setDataSelecionada}
        diasMarcados={classeAtual?.diasProvas?.map((p: any) => p.data) || []}
      />

      {!idClasseSelecionada ? (
        <View style={styles.center}>
          <Icon name="file-percent-outline" size={60} color={colors.borderLight} />
          <Text style={styles.emptyText}>Selecione uma classe para lançar notas.</Text>
        </View>
      ) : isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.secondary} />
        </View>
      ) : (
        <FlatList
          data={alunos?.filter((a: any) => a.ativo)}
          keyExtractor={(item) => item._id}
          renderItem={renderAluno}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerNotas: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dateSelector: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  dateSelectorSuccess: { borderColor: colors.secondary, backgroundColor: colors.secondary + '10', borderWidth: 1 },
  dateTextBox: { flex: 1 },
  textData: { fontSize: 14, fontWeight: '700', color: '#1F2937' },
  btnSalvarLote: { backgroundColor: colors.secondary + '15', padding: 8, borderRadius: 8 },
  tituloContainer: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  tituloInputRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tituloInput: { flex: 1, fontSize: 14, color: '#374151', height: 40 },
  list: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 40 },
  alunoRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 8, elevation: 1 },
  alunoInfo: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  nome: { fontWeight: '600', color: '#111827', fontSize: 13 },
  mediaTexto: { fontSize: 10, color: colors.mutedText },
  numeroBadge: { marginRight: 10, backgroundColor: '#F3F4F6', padding: 4, borderRadius: 4, width: 30, alignItems: 'center' },
  numeroText: { fontSize: 11, fontWeight: 'bold', color: colors.secondary },
  notaInput: { 
    width: 65, 
    height: 45, 
    backgroundColor: '#F9FAFB', 
    borderWidth: 1.5, 
    borderColor: colors.borderLight, 
    borderRadius: 8, 
    textAlign: 'center', 
    fontWeight: 'bold', 
    fontSize: 16,
    color: colors.primary 
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 100 },
  emptyText: { textAlign: 'center', color: colors.mutedText, fontSize: 14, fontWeight: '500' },
});

export default NotasScreen;