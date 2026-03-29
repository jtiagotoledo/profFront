import React, { useState } from 'react';
import {
  View, FlatList, Text, StyleSheet, ActivityIndicator,
  StatusBar, TouchableOpacity
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useAppStore } from '../store/useAppStore';
import { useAlunos } from '../hooks/useEscolar';
import { colors } from '../theme/colors';
import { FiltrosEscolar } from '../components/FiltroEscolar';
import { AlunoCard } from '../components/AlunoCard';
import { ModalCadastroAluno } from '../modais/ModalCadastroAluno';
import { ModalEditarAluno } from '../modais/ModalEditarAluno';
import { useIAPManager } from '../hooks/useIAPManager';
import { ModalUpgrade } from '../modais/ModalUpgrade';

function ListaAlunosScreen() {
  const { idClasseSelecionada, user } = useAppStore();
  const { data: alunos, isLoading, isError } = useAlunos(idClasseSelecionada);
  const { comprarIlimitado } = useIAPManager();
  const [modalCadastroVisible, setModalCadastroVisible] = useState(false);
  const [modalEditarVisible, setModalEditarVisible] = useState(false);
  const [modalUpgradeVisible, setModalUpgradeVisible] = useState(false);
  const [alunoParaEditar, setAlunoParaEditar] = useState<any>(null);

  const handleLongPressAluno = (aluno: any) => {
    setAlunoParaEditar(aluno);
    setModalEditarVisible(true);
  };

  const handlePressFAB = () => {
    const isPremium = user?.isPremium;
    const totalAlunos = alunos?.length || 0;

    if (!isPremium && totalAlunos >= 10) {
      setModalUpgradeVisible(true); 
    } else {
      setModalCadastroVisible(true); 
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <FiltrosEscolar />

      <View style={styles.content}>
        {!idClasseSelecionada ? (
          <View style={styles.center}>
            <Icon name="account-search-outline" size={60} color={colors.borderLight} />
            <Text style={styles.emptyText}>Selecione uma classe para listar os alunos.</Text>
          </View>
        ) : isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.secondary} />
          </View>
        ) : isError ? (
          <View style={styles.center}>
            <Icon name="alert-circle-outline" size={50} color={colors.danger} />
            <Text style={[styles.emptyText, { color: colors.danger }]}>Erro ao carregar alunos.</Text>
          </View>
        ) : (
          <FlatList
            data={alunos}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity onLongPress={() => handleLongPressAluno(item)} activeOpacity={0.7}>
                <AlunoCard aluno={item} />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.center}>
                <Text style={styles.emptyText}>Nenhum aluno cadastrado.</Text>
              </View>
            }
          />
        )}
      </View>

      <TouchableOpacity
        style={[styles.fab, !idClasseSelecionada && { backgroundColor: colors.borderLight }]}
        onPress={handlePressFAB}
        disabled={!idClasseSelecionada}
      >
        <Icon 
          name={(!user?.isPremium && (alunos?.length || 0) >= 10) ? "lock" : "account-plus"} 
          size={28} 
          color={colors.white} 
        />
      </TouchableOpacity>

      <ModalCadastroAluno
        visible={modalCadastroVisible}
        onClose={() => setModalCadastroVisible(false)}
        idClasseSelecionada={idClasseSelecionada}
      />

      <ModalUpgrade 
        visible={modalUpgradeVisible}
        onClose={() => setModalUpgradeVisible(false)}
        onUpgrade={() => {
          setModalUpgradeVisible(false);
          comprarIlimitado(); 
        }}
      />

      <ModalEditarAluno
        visible={modalEditarVisible}
        onClose={() => {
          setModalEditarVisible(false);
          setAlunoParaEditar(null);
        }}
        aluno={alunoParaEditar}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1 },
  listContainer: { padding: 16, paddingBottom: 100 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, marginTop: 50 },
  emptyText: { textAlign: 'center', color: colors.mutedText, fontSize: 14, marginTop: 8 },
  fab: {
    position: 'absolute', right: 20, bottom: 20, backgroundColor: colors.primary,
    width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center',
    elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3,
  }
});

export default ListaAlunosScreen;