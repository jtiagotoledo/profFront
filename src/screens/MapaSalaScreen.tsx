import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Text,
    FlatList,
    Modal,
    ActivityIndicator,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

import { useAppStore } from '../store/useAppStore';
import { useAlunos, useClasses } from '../hooks/useEscolar';
import { useCadastrosEscolares } from '../hooks/useEscolarMutations';
import { colors } from '../theme/colors';

function MapaSalaScreen() {
    const navigation = useNavigation();

    const { idClasseSelecionada, setClasse, idAnoSelecionado } = useAppStore();

    const { data: classes } = useClasses(idAnoSelecionado);
    const { data: alunos, isLoading: carregandoAlunos } = useAlunos(idClasseSelecionada);
    const { mutationSalvarMapaSala } = useCadastrosEscolares();
    const salvandoNoBanco = mutationSalvarMapaSala.isPending;

    const [cols, setCols] = useState(4);
    const [rows, setRows] = useState(5);
    const [cadeiras, setCadeiras] = useState<any[]>([]);

    const [modalAlunosVisible, setModalAlunosVisible] = useState(false);
    const [modalClassesVisible, setModalClassesVisible] = useState(false);
    const [cadeiraAtiva, setCadeiraAtiva] = useState<number | null>(null);

    const classeAtual = classes?.find((c: any) => c._id === idClasseSelecionada);

    useEffect(() => {
        navigation.setOptions({
            headerTitle: () => (
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitleText}>Mapa de Sala</Text>

                    <TouchableOpacity
                        style={styles.headerDropdown}
                        onPress={() => setModalClassesVisible(true)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.headerDropdownText} numberOfLines={1}>
                            {classeAtual ? classeAtual.nome : 'Turma'}
                        </Text>
                        <Icon name="chevron-down" size={18} color={colors.darkText} />
                    </TouchableOpacity>
                </View>
            ),
        });
    }, [navigation, classeAtual]);

    useEffect(() => {
        if (classeAtual?.mapaSala && alunos) {
            const { colunas, linhas, cadeiras: cadeirasSalvas } = classeAtual.mapaSala;

            setCols(colunas || 6);
            setRows(linhas || 5);

            const mapaConvertido = (cadeirasSalvas || []).map((idAluno: string | null) => {
                if (!idAluno) return null;
                return alunos.find((a: any) => a._id === idAluno) || null;
            });

            const totalEspacos = colunas * linhas;
            while (mapaConvertido.length < totalEspacos) {
                mapaConvertido.push(null);
            }

            setCadeiras(mapaConvertido.slice(0, totalEspacos));
        } else {
            setCadeiras(Array(cols * rows).fill(null));
        }
    }, [idClasseSelecionada, classes, alunos]);

    useEffect(() => {
        const totalCadeiras = cols * rows;
        setCadeiras(prev => {
            const novasCadeiras = [...prev];
            if (novasCadeiras.length < totalCadeiras) {
                return [...novasCadeiras, ...Array(totalCadeiras - novasCadeiras.length).fill(null)];
            } else {
                return novasCadeiras.slice(0, totalCadeiras);
            }
        });
    }, [cols, rows]);

    const handleSalvarMapa = () => {
        if (!idClasseSelecionada) {
            Alert.alert("Aviso", "Selecione uma turma antes de salvar.");
            return;
        }

        const listaIdsAlunos = cadeiras.map(aluno => aluno ? aluno._id : null);

        mutationSalvarMapaSala.mutate({
            classeId: idClasseSelecionada,
            colunas: cols,
            linhas: rows,
            cadeiras: listaIdsAlunos
        }, {
            onSuccess: () => {
                Alert.alert("Sucesso", "O layout e mapeamento da sala foram guardados!");
            },
            onError: (err: any) => {
                Alert.alert("Erro", err?.message || "Não foi possível salvar as alterações.");
            }
        });
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
                onPress={() => idClasseSelecionada && setCadeiraAtiva(index) || setModalAlunosVisible(true)}
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

    if (carregandoAlunos) {
        return (
            <View style={styles.centerLoading}>
                <ActivityIndicator size="large" color={colors.secondary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.controlesContainer}>
                <View style={styles.controleGrupo}>
                    <Text style={styles.controleLabel}>Colunas:</Text>
                    <TouchableOpacity style={styles.btnControle} onPress={() => setCols(Math.max(2, cols - 1))}>
                        <Icon name="minus" size={16} color={colors.secondary} />
                    </TouchableOpacity>
                    <Text style={styles.controleValor}>{cols}</Text>
                    <TouchableOpacity style={styles.btnControle} onPress={() => setCols(Math.min(8, cols + 1))}>
                        <Icon name="plus" size={16} color={colors.secondary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.controleGrupo}>
                    <Text style={styles.controleLabel}>Linhas:</Text>
                    <TouchableOpacity style={styles.btnControle} onPress={() => setRows(Math.max(2, rows - 1))}>
                        <Icon name="minus" size={16} color={colors.secondary} />
                    </TouchableOpacity>
                    <Text style={styles.controleValor}>{rows}</Text>
                    <TouchableOpacity style={styles.btnControle} onPress={() => setRows(Math.min(10, rows + 1))}>
                        <Icon name="plus" size={16} color={colors.secondary} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.btnSalvar, salvandoNoBanco && styles.btnSalvarDesabilitado]}
                    onPress={handleSalvarMapa}
                    disabled={salvandoNoBanco}
                >
                    {salvandoNoBanco ? (
                        <ActivityIndicator size="small" color={colors.lightText} />
                    ) : (
                        <>
                            <Icon name="content-save" size={18} color={colors.lightText} />
                        </>
                    )}
                </TouchableOpacity>
            </View>

            <FlatList
                key={cols}
                data={cadeiras}
                renderItem={renderCadeira}
                numColumns={cols}
                keyExtractor={(_, index) => index.toString()}
                contentContainerStyle={styles.gridContainer}
                ListEmptyComponent={
                    !idClasseSelecionada ? (
                        <Text style={styles.emptyText}>Selecione uma turma no menu superior.</Text>
                    ) : null
                }
            />

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
                                        setClasse(item._id);
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
    centerLoading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
    controlesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderColor: colors.borderLight
    },
    controleGrupo: { flexDirection: 'row', alignItems: 'center' },
    controleLabel: { marginRight: 4, fontSize: 13, color: colors.darkText, fontWeight: 'bold' },
    controleValor: { marginHorizontal: 8, fontSize: 15, fontWeight: 'bold', color: colors.darkText },
    btnControle: { padding: 4, backgroundColor: colors.background, borderRadius: 6, borderWidth: 1, borderColor: colors.borderLight },
    btnSalvar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.secondary,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 4
    },
    btnSalvarDesabilitado: { opacity: 0.6 },
    btnSalvarTexto: { color: colors.lightText, fontWeight: 'bold', fontSize: 14 },
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
    cadeiraOcupada: { backgroundColor: colors.primary, borderColor: colors.primary },
    cadeiraText: { fontSize: 9, color: colors.mutedText, textAlign: 'center', marginTop: 2 },
    cadeiraTextOcupada: { color: colors.lightText, fontWeight: 'bold' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
    modalOverlayAbaixo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: colors.white, borderRadius: 12, padding: 20, width: '80%', maxHeight: '60%' },
    modalContentLargo: { backgroundColor: colors.white, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, maxHeight: '75%' },
    modalTitle: { fontSize: 16, fontWeight: 'bold', color: colors.darkText, marginBottom: 12, textAlign: 'center' },
    itemSelecao: { paddingVertical: 14, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: colors.borderLight, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    itemSelecionadoAcentuado: { backgroundColor: colors.background },
    itemSelecaoTexto: { fontSize: 15, color: colors.darkText },
    itemSelecionadoTextoAtivo: { color: colors.secondary, fontWeight: 'bold' },
    itemDesabilitado: { opacity: 0.4, backgroundColor: colors.background },
    avisoJaSentado: { fontSize: 12, color: colors.danger },
    emptyText: { textAlign: 'center', color: colors.mutedText, padding: 16 },
    botoesModalAcao: { flexDirection: 'column', gap: 8, marginTop: 12 },
    btnModal: { padding: 14, backgroundColor: colors.background, borderRadius: 8, alignItems: 'center' },
    btnModalPerigo: { backgroundColor: colors.danger + '15' },
    textModalVoltar: { fontSize: 15, color: colors.mutedText, fontWeight: '600' },
    textModalPerigo: { fontSize: 15, color: colors.danger, fontWeight: '600' },
   headerTitleContainer: {
    flexDirection: 'row', 
    alignItems: 'center',
    gap: 12, 
  },
  headerTitleText: {
    fontSize: 18, 
    fontWeight: 'bold',
    color: colors.darkText,
  },
  headerDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: 4,
    maxWidth: 120, 
  },
  headerDropdownText: { 
    fontSize: 13, 
    fontWeight: 'bold', 
    color: colors.darkText,
    flexShrink: 1,
  },
});

export default MapaSalaScreen;