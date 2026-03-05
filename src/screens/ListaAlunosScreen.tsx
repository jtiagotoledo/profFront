import React from 'react';
import { View, FlatList, Text, StyleSheet, ActivityIndicator, StatusBar } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { useAlunos } from '../hooks/useEscolar';
import { colors } from '../theme/colors';
import { FiltrosEscolar } from '../components/FiltroEscolar';
import { AlunoCard } from '../components/AlunoCard';

function ListaAlunosScreen() {
  const { idClasseSelecionada, idAnoSelecionado } = useAppStore();
  const { data: alunos, isLoading, isError } = useAlunos(idClasseSelecionada);
  console.log('idAnoSelecionado', idAnoSelecionado);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <FiltrosEscolar />

      <View style={styles.content}>
        {!idClasseSelecionada ? (
          <View style={styles.center}>
            <Text style={styles.emptyText}>Selecione uma classe para listar os alunos.</Text>
          </View>
        ) : isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.secondary} />
            <Text style={[styles.emptyText, { marginTop: 10 }]}>Carregando alunos...</Text>
          </View>
        ) : isError ? (
          <View style={styles.center}>
            <Text style={[styles.emptyText, { color: colors.danger }]}>Erro ao carregar alunos.</Text>
          </View>
        ) : (
          <FlatList
            data={alunos}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => <AlunoCard aluno={item} />}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Nenhum aluno cadastrado nesta turma.</Text>
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // O novo fundo cinza claro
  },
  content: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 30, // Espaço extra para não cobrir o último card com a TabBar
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.mutedText,
    fontSize: 14,
    lineHeight: 20,
  },
});

export default ListaAlunosScreen;