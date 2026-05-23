import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Text, 
  FlatList, 
  Modal, 
  SafeAreaView 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

// Importações do seu projeto
import { useAppStore } from '../store/useAppStore';
import { useAlunos, useClasses } from '../hooks/useEscolar'; // Supondo que useClasses exista aqui
import { colors } from '../theme/colors';

function MapaSalaScreen() {
  const navigation = useNavigation();
  
  // Estados globais do seu Store
  const { idClasseSelecionada, setClasse, idAnoSelecionado } = useAppStore();
  
  // Hooks de busca de dados
  const { data: classes } = useClasses(idAnoSelecionado); // Busca todas as classes do ano ativo
  const { data: alunos } = useAlunos(idClasseSelecionada); // Reativo à classe selecionada

  // Estados do Grid local
  const [cols, setCols] = useState(4);
  const [rows, setRows] = useState(5);
  const [cadeiras, setCadeiras] = useState<any[]>([]);

  // Estados dos Modais
  const [modalAlunosVisible, setModalAlunosVisible] = useState(false);
  const [modalClassesVisible, setModalClassesVisible] = useState(false);
  const [cadeiraAtiva, setCadeiraAtiva] = useState<number | null>(null);

  // Encontra o objeto da classe atual para mostrar o nome no Header
  const classeAtual = classes?.find((c: any) => c._id === idClasseSelecionada);

  // 1. Injeta a lista suspensa (Dropdown) customizada no Header dinamicamente
  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <TouchableOpacity 
          style={styles.headerDropdown} 
          onPress={() => setModalClassesVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.headerDropdownText}>
            {classeAtual ? classeAtual.nome : 'Selecionar Turma'}
          </Text>
          <Icon name="chevron-down" size={20} color={colors.darkText} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, classeAtual]);

  // 2. Reatividade total: Limpa ou reconstrói o mapa de sala quando o professor troca de turma
  useEffect(() => {
    const totalCadeiras = cols * rows;
    // Aqui você pode resetar o mapa ou, no futuro, carregar o layout salvo desta classe específica do backend
    setCadeiras(Array(totalCadeiras).fill(null));
  }, [idClasseSelecionada, cols, rows]);

  const handleAbrirSelecaoAluno = (index: number) => {
    setCadeiraAtiva(index);
    setModalAlunosVisible(true);
  };

  const handleSelecionarAluno = (aluno: any) => {
    if (cadeiraAtiva !== null) {
      const novasCadeiras = [...cadeiras];
      novasCadeiras[cadeiraAtiva] = aluno;
      setCadeiras(novasCadeiras);
    }
    setModalAlunosVisible(false);
  };

  const handleRemoverAluno = () => {
    if (cadeiraAtiva !== null) {
      const novasCadeiras = [...cadeiras];
      novasCadeiras[cadeiraAtiva] = null;
      setCadeiras(novasCadeiras);
    }
    setModalAlunosVisible(false);
  };

  const renderCadeira = ({ index }: { index: number }) => {
    const aluno = cadeiras[index];
    return (
      <TouchableOpacity 
        style={[styles.cadeira, aluno && styles.cadeiraOcupada]}
        onPress={() => handleAbrirSelecaoAluno(index)}
      >
        <Icon 
          name={aluno ? "account" : "chair-school"} 
          size={20} 
          color={aluno ? colors.lightText : colors.borderLight} 
        />
        <Text style={[styles.cadeiraText, aluno && styles.cadeiraTextOcupada]} numberOfLines={2}>
          {aluno ? aluno.nome : 'Vazia'}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Controles de Linhas e Colunas */}
      <View style={styles.controlesContainer}>
        <View style={styles.controleGrupo}>
          <Text style={styles.controleLabel}>Colunas:</Text>
          <TouchableOpacity style={styles.btnControle} onPress={() => setCols(Math.max(2, cols - 1))}>
            <Icon name="minus" size={18} color={colors.secondary} />
          </TouchableOpacity>
          <Text style={styles.controleValor}>{cols}</Text>
          <TouchableOpacity style={styles.btnControle} onPress={() => setCols(Math.min(8, cols + 1))}>
            <Icon name="plus" size={18} color={colors.secondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.controleGrupo}>
          <Text style={styles.controleLabel}>Linhas:</Text>
          <TouchableOpacity style={styles.btnControle} onPress={() => setRows(Math.max(2, rows - 1))}>
            <Icon name="minus" size={18} color={colors.secondary} />
          </TouchableOpacity>
          <Text style={styles.controleValor}>{rows}</Text>
          <TouchableOpacity style={styles.btnControle} onPress={() => setRows(Math.min(10, rows + 1))}>
            <Icon name="plus" size={18} color={colors.secondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Grid Reativo */}
      <FlatList
        key={cols} // Força a reconstrução geométrica do grid quando as colunas mudam
        data={cadeiras}
        renderItem={renderCadeira}
        numColumns={cols}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={styles.gridContainer}
      />

      {/* MODAL 1: Lista Suspensa de Classes (Disparado pelo Header) */}
      <Modal visible={modalClassesVisible} transparent animationType="fade" onRequestClose={() => setModalClassesVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalClassesVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Mudar de Turma</Text>
            <FlatList
              data={classes}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[styles.itemSelecao, item._id === idClasseSelecionada && styles.itemSelecionadoAcentuado]}
                  onPress={() => {
                    setClasse(item._id); // Atualiza o estado global do app
                    setModalClassesVisible(false);
                  }}
                >
                  <Text style={[styles.itemSelecaoTexto, item._id === idClasseSelecionada && styles.itemSelecionadoTextoAtivo]}>
                    {item.nome}
                  </Text>
                  {item._id === idClasseSelecionada && <Icon name="check" size={20} color={colors.secondary} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* MODAL 2: Seleção de Aluno para a Carteira */}
      <Modal visible={modalAlunosVisible} transparent animationType="slide" onRequestClose={() => setModalAlunosVisible(false)}>
        <View style={styles.modalOverlayAbaixo}>
          <View style={styles.modalContentLargo}>
            <Text style={styles.modalTitle}>Ocupar Carteira</Text>
            <FlatList
              data={alunos}
              keyExtractor={(item) => item._id}
              ListEmptyComponent={<Text style={styles.emptyText}>Nenhum aluno cadastrado nesta turma.</Text>}
              renderItem={({ item }) => {
                const jaSentado = cadeiras.some(c => c && c._id === item._id);
                return (
                  <TouchableOpacity 
                    style={[styles.itemSelecao, jaSentado && styles.itemDesabilitado]}
                    disabled={jaSentado}
                    onPress={() => handleSelecionarAluno(item)}
                  >
                    <Text style={styles.itemSelecaoTexto}>{item.nome}</Text>
                    {jaSentado && <Text style={styles.avisoJaSentado}>(Já posicionado)</Text>}
                  </TouchableOpacity>
                );
              }}
            />
            <View style={styles.botoesModalAcao}>
              {cadeiras[cadeiraAtiva ?? -1] && (
                <TouchableOpacity style={[styles.btnModal, styles.btnModalPerigo]} onPress={handleRemoverAluno}>
                  <Text style={styles.textModalPerigo}>Remover Aluno da Carteira</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.btnModal} onPress={() => setModalAlunosVisible(false)}>
                <Text style={styles.textModalVoltar}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  
  // Estilo do seletor dentro do Header
  headerDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.borderLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  headerDropdownText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.darkText,
  },

  // Controles superiores
  controlesContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    padding: 12, 
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderColor: colors.borderLight
  },
  controleGrupo: { flexDirection: 'row', alignItems: 'center' },
  controleLabel: { marginRight: 8, fontSize: 13, color: colors.darkText, fontWeight: 'bold' },
  controleValor: { marginHorizontal: 12, fontSize: 15, fontWeight: 'bold', color: colors.darkText },
  btnControle: { 
    padding: 4, 
    backgroundColor: colors.background, 
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderLight
  },

  // Grid de Carteiras
  gridContainer: { padding: 8 },
  cadeira: { 
    flex: 1, 
    aspectRatio: 1, 
    margin: 4, 
    backgroundColor: colors.white, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 4
  },
  cadeiraOcupada: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  cadeiraText: { 
    fontSize: 9, 
    color: colors.mutedText, 
    textAlign: 'center',
    marginTop: 2 
  },
  cadeiraTextOcupada: {
    color: colors.lightText,
    fontWeight: 'bold'
  },
  
  // Estruturas de Modais
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalOverlayAbaixo: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxHeight: '60%'
  },
  modalContentLargo: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: '75%'
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.darkText,
    marginBottom: 12,
    textAlign: 'center'
  },
  itemSelecao: {
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  itemSelecionadoAcentuado: {
    backgroundColor: colors.background
  },
  itemSelecaoTexto: {
    fontSize: 15,
    color: colors.darkText
  },
  itemSelecionadoTextoAtivo: {
    color: colors.secondary,
    fontWeight: 'bold'
  },
  itemDesabilitado: {
    opacity: 0.4,
    backgroundColor: colors.background
  },
  avisoJaSentado: {
    fontSize: 12,
    color: colors.danger
  },
  emptyText: {
    textAlign: 'center',
    color: colors.mutedText,
    padding: 16
  },
  botoesModalAcao: {
    flexDirection: 'column',
    gap: 8,
    marginTop: 12
  },
  btnModal: {
    padding: 14,
    backgroundColor: colors.background,
    borderRadius: 8,
    alignItems: 'center'
  },
  btnModalPerigo: {
    backgroundColor: colors.danger + '15',
  },
  textModalVoltar: {
    fontSize: 15,
    color: colors.mutedText,
    fontWeight: '600'
  },
  textModalPerigo: {
    fontSize: 15,
    color: colors.danger,
    fontWeight: '600'
  }
});

export default MapaSalaScreen;