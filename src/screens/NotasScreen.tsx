import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, FlatList, Text, StyleSheet, TextInput,
  TouchableOpacity, ActivityIndicator, Alert, Keyboard,
  KeyboardAvoidingView, Platform
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
  
  const { data: alunos, isLoading } = useAlunos(idClasseSelecionada);
  const { data: classes } = useClasses(idAnoSelecionado);
  const { mutationLancarNotasEmLote, mutationConfirmarProva } = useCadastrosEscolares();

  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [tituloProva, setTituloProva] = useState("");
  const [notasLocais, setNotasLocais] = useState<{[key: string]: string}>({});
  
  // ESTADO CRÍTICO: Controla se estamos editando para esconder os filtros
  const [isEditing, setIsEditing] = useState(false);

  const inputRefs = useRef<{[key: string]: TextInput | null}>({});
  const dataFormatadaStr = format(dataSelecionada, 'yyyy-MM-dd');
  const classeAtual = classes?.find((c: any) => c._id === idClasseSelecionada);
  const provaDoDia = classeAtual?.diasProvas?.find((p: any) => p.data === dataFormatadaStr);

  // Monitora o teclado para voltar os filtros automaticamente ao fechar
  useEffect(() => {
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setIsEditing(false);
    });
    return () => hideSubscription.remove();
  }, []);

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
    if (!tituloProva.trim()) return Alert.alert("Atenção", "Dê um título para a avaliação.");

    const payloadNotas = Object.keys(notasLocais).map(alunoId => ({
      alunoId,
      valor: parseFloat(notasLocais[alunoId].replace(',', '.')) || 0
    }));

    mutationConfirmarProva.mutate({ classeId: idClasseSelecionada, data: dataFormatadaStr, titulo: tituloProva });
    mutationLancarNotasEmLote.mutate({ data: dataFormatadaStr, notas: payloadNotas }, {
      onSuccess: () => {
        Keyboard.dismiss();
        setIsEditing(false);
        Alert.alert("Sucesso", "Notas salvas!");
      }
    });
  };

  const renderAluno = ({ item, index }: any) => {
    return (
      <View style={styles.alunoRow}>
        <View style={styles.alunoInfo}>
          <View style={styles.numeroBadge}>
            <Text style={styles.numeroText}>{item.numeroChamada.toString().padStart(2, '0')}</Text>
          </View>
          <Text style={styles.nome} numberOfLines={1}>{item.nome}</Text>
        </View>

        <TextInput
          ref={(el) => { inputRefs.current[item._id] = el; }}
          style={styles.notaInput}
          keyboardType="decimal-pad" // Melhor para notas (tem o ponto/vírgula)
          placeholder="0.0"
          value={notasLocais[item._id] || ""}
          selectTextOnFocus={true}
          onFocus={() => setIsEditing(true)} // ESCONDE OS FILTROS
          onChangeText={(val) => setNotasLocais(prev => ({ ...prev, [item._id]: val }))}
          returnKeyType={index === alunos.length - 1 ? "done" : "next"}
          onSubmitEditing={() => {
            const proximo = alunos[index + 1];
            if (proximo) inputRefs.current[proximo._id]?.focus();
            else {
                Keyboard.dismiss();
                setIsEditing(false);
            }
          }}
        />
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      {/* SÓ MOSTRA FILTROS SE NÃO ESTIVER EDITANDO */}
      {!isEditing && <FiltrosEscolar />}

      <View style={styles.headerNotas}>
        <View style={styles.topRow}>
          <TouchableOpacity
            style={[styles.dateSelector, !!provaDoDia && styles.dateSelectorSuccess]}
            onPress={() => setShowCalendar(true)}
          >
            <Icon name="calendar-star" size={18} color={!!provaDoDia ? colors.secondary : colors.primary} />
            <Text style={styles.textData}>
                {format(dataSelecionada, "dd 'de' MMMM", { locale: ptBR })}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnSalvar} onPress={handleSalvarTudo}>
             <Icon name="content-save-check" size={24} color={colors.secondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.tituloInputContainer}>
            <Icon name="pencil-outline" size={16} color={colors.mutedText} />
            <TextInput
              style={styles.tituloInput}
              placeholder="Título da Avaliação..."
              value={tituloProva}
              onFocus={() => setIsEditing(true)}
              onChangeText={setTituloProva}
            />
        </View>
      </View>

      <FlatList
        data={alunos?.filter((a: any) => a.ativo)}
        keyExtractor={(item) => item._id}
        renderItem={renderAluno}
        contentContainerStyle={styles.list}
        // ESSENCIAL: Impede o teclado de fechar ao tocar na lista
        keyboardShouldPersistTaps="always" 
        // Melhora performance de listas com inputs
        removeClippedSubviews={false} 
        ListEmptyComponent={
            <View style={styles.center}><Text style={styles.emptyText}>Nenhum aluno ativo.</Text></View>
        }
      />

      <CalendarioModal
        visivel={showCalendar}
        fechar={() => setShowCalendar(false)}
        dataSelecionada={dataSelecionada}
        aoSelecionarData={setDataSelecionada}
        diasMarcados={classeAtual?.diasProvas?.map((p: any) => p.data) || []}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerNotas: { 
    padding: 12, 
    backgroundColor: '#fff', 
    borderBottomWidth: 1, 
    borderBottomColor: colors.borderLight,
    elevation: 2 
  },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  dateSelector: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F3F4F6', 
    borderRadius: 8, 
    padding: 10,
    gap: 8 
  },
  dateSelectorSuccess: { backgroundColor: colors.secondary + '10', borderWidth: 1, borderColor: colors.secondary },
  textData: { fontSize: 14, fontWeight: '700', color: '#1F2937' },
  btnSalvar: { backgroundColor: colors.secondary + '15', padding: 10, borderRadius: 8 },
  tituloInputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F9FAFB', 
    borderRadius: 8, 
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.borderLight
  },
  tituloInput: { flex: 1, height: 40, fontSize: 14, color: '#374151', marginLeft: 5 },
  list: { padding: 16, paddingBottom: 50 },
  alunoRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    padding: 12, 
    borderRadius: 12, 
    marginBottom: 8, 
    elevation: 1 
  },
  alunoInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  nome: { fontWeight: '600', color: '#111827', fontSize: 13, flex: 1 },
  numeroBadge: { backgroundColor: '#F3F4F6', padding: 4, borderRadius: 6, width: 32, alignItems: 'center' },
  numeroText: { fontSize: 12, fontWeight: 'bold', color: colors.secondary },
  notaInput: { 
    width: 60, 
    height: 45, 
    backgroundColor: '#fff', 
    borderWidth: 2, 
    borderColor: colors.borderLight, 
    borderRadius: 8, 
    textAlign: 'center', 
    fontWeight: 'bold', 
    fontSize: 18,
    color: colors.primary 
  },
  center: { marginTop: 50, alignItems: 'center' },
  emptyText: { color: colors.mutedText }
});

export default NotasScreen;