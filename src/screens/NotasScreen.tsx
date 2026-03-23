import React, { useState, useEffect, useRef } from 'react';
import {
  View, FlatList, Text, StyleSheet, TextInput,
  TouchableOpacity, ActivityIndicator, Keyboard,
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
  const { mutationUpdateNota, mutationConfirmarProva } = useCadastrosEscolares();

  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [tituloProva, setTituloProva] = useState("");
  const [notasLocais, setNotasLocais] = useState<{[key: string]: string}>({});
  const [isEditing, setIsEditing] = useState(false);

  const inputRefs = useRef<{[key: string]: TextInput | null}>({});
  const dataFormatadaStr = format(dataSelecionada, 'yyyy-MM-dd');
  const classeAtual = classes?.find((c: any) => c._id === idClasseSelecionada);
  const provaDoDia = classeAtual?.diasProvas?.find((p: any) => p.data === dataFormatadaStr);

  useEffect(() => {
    setTituloProva(provaDoDia?.titulo || "");
    const novasNotas: {[key: string]: string} = {};
    alunos?.forEach((aluno: any) => {
      const notaExistente = aluno.notas?.find((n: any) => n.data === dataFormatadaStr);
      novasNotas[aluno._id] = notaExistente ? notaExistente.valor.toString() : "";
    });
    setNotasLocais(novasNotas);
  }, [dataFormatadaStr, idClasseSelecionada, provaDoDia, alunos]);

  const garantirTituloNoBanco = (tituloAtual: string) => {
    if (!idClasseSelecionada) return;

    let tituloFinal = tituloAtual.trim();
    if (!tituloFinal) {
      tituloFinal = `Avaliação ${format(dataSelecionada, 'dd/MM/yyyy')}`;
      setTituloProva(tituloFinal);
    }

    mutationConfirmarProva.mutate({ 
      classeId: idClasseSelecionada, 
      data: dataFormatadaStr, 
      titulo: tituloFinal 
    });
  };

  const salvarNotaIndividual = (alunoId: string, valorStr: string) => {
    const valorNum = parseFloat(valorStr.replace(',', '.'));
    
    if (!isNaN(valorNum)) {
      garantirTituloNoBanco(tituloProva);
      mutationUpdateNota.mutate({
        alunoId,
        data: dataFormatadaStr,
        valor: valorNum
      });
    }
  };

  const renderAluno = ({ item, index }: any) => {
    const ativos = alunos?.filter((a: any) => a.ativo) || [];
    const isUltimo = index === (ativos.length - 1);
    const estaSalvando = mutationUpdateNota.isPending && mutationUpdateNota.variables?.alunoId === item._id;

    return (
      <View style={styles.alunoRow}>
        <View style={styles.alunoInfo}>
          <View style={styles.numeroBadge}>
            <Text style={styles.numeroText}>{item.numeroChamada.toString().padStart(2, '0')}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.nome} numberOfLines={1}>{item.nome}</Text>
            {estaSalvando && <Text style={styles.salvandoTexto}>Salvando...</Text>}
          </View>
        </View>

        <TextInput
          ref={(el) => { inputRefs.current[item._id] = el; }}
          style={styles.notaInput}
          keyboardType="decimal-pad"
          placeholder="0.0"
          value={notasLocais[item._id] || ""}
          selectTextOnFocus={true}
          blurOnSubmit={false} 
          onFocus={() => setIsEditing(true)}
          onChangeText={(val) => setNotasLocais(prev => ({ ...prev, [item._id]: val }))}
          
          onBlur={() => {
            salvarNotaIndividual(item._id, notasLocais[item._id] || "");
          }}

          returnKeyType={isUltimo ? "done" : "next"}
          onSubmitEditing={() => {
            const proximo = ativos[index + 1];
            if (proximo) {
              inputRefs.current[proximo._id]?.focus();
            } else {
              setIsEditing(false);
              Keyboard.dismiss();
            }
          }}
        />
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {!isEditing && <FiltrosEscolar />}

      <View style={styles.headerNotas}>
        <View style={styles.topRow}>
          <TouchableOpacity
            style={[styles.dateSelector, provaDoDia && styles.dateSelectorSuccess]}
            onPress={() => setShowCalendar(true)}
          >
            <Icon name="calendar-star" size={18} color={provaDoDia ? colors.secondary : colors.primary} />
            <Text style={styles.textData}>
                {format(dataSelecionada, "dd/MM/yyyy", { locale: ptBR })}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tituloInputContainer}>
            <Icon name="pencil-outline" size={16} color={colors.mutedText} />
            <TextInput
              style={styles.tituloInput}
              placeholder="Título (vazio = padrão)..."
              value={tituloProva}
              onFocus={() => setIsEditing(true)}
              onChangeText={setTituloProva}
              onBlur={() => garantirTituloNoBanco(tituloProva)}
            />
            {isEditing && (
              <TouchableOpacity onPress={() => { Keyboard.dismiss(); setIsEditing(false); }}>
                <Icon name="keyboard-close" size={20} color={colors.mutedText} />
              </TouchableOpacity>
            )}
        </View>
      </View>

      {!idClasseSelecionada ? (
        <View style={styles.center}>
          <Icon name="file-percent-outline" size={60} color={colors.borderLight} />
          <Text style={styles.emptyText}>Selecione uma classe.</Text>
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
          keyboardShouldPersistTaps="always"
          removeClippedSubviews={false}
        />
      )}

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
  headerNotas: { padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: colors.borderLight, elevation: 2 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  dateSelector: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 8, padding: 10, gap: 8 },
  dateSelectorSuccess: { backgroundColor: colors.secondary + '10', borderWidth: 1, borderColor: colors.secondary },
  textData: { fontSize: 14, fontWeight: '700', color: '#1F2937' },
  tituloInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 8, paddingHorizontal: 10, borderWidth: 1, borderColor: colors.borderLight },
  tituloInput: { flex: 1, height: 40, fontSize: 14, color: '#374151', marginLeft: 5 },
  list: { padding: 16, paddingBottom: 50 },
  alunoRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 8, elevation: 1 },
  alunoInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  nome: { fontWeight: '600', color: '#111827', fontSize: 13, flex: 1 },
  salvandoTexto: { fontSize: 10, color: colors.secondary, fontWeight: 'bold' },
  numeroBadge: { backgroundColor: '#F3F4F6', padding: 4, borderRadius: 6, width: 32, alignItems: 'center' },
  numeroText: { fontSize: 12, fontWeight: 'bold', color: colors.secondary },
  notaInput: { width: 60, height: 45, backgroundColor: '#fff', borderWidth: 2, borderColor: colors.borderLight, borderRadius: 8, textAlign: 'center', fontWeight: 'bold', fontSize: 18, color: colors.primary },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 100 },
  emptyText: { textAlign: 'center', color: colors.mutedText, fontSize: 14, fontWeight: '500' },
});

export default NotasScreen;