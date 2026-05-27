import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { pick, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import RNFS from 'react-native-fs';
import * as XLSX from 'xlsx';

import { ModalGenerico } from '../components/ModalGenerico';
import { colors } from '../theme/colors';
import { useCadastrosEscolares } from '../hooks/useEscolarMutations'; // Para aceder à mutação

interface ModalImportacaoExcelProps {
    visible: boolean;
    onClose: () => void;
    idClasseSelecionada: string | null;
}

export const ModalImportacaoExcel = ({ visible, onClose, idClasseSelecionada }: ModalImportacaoExcelProps) => {
    const [lendoArquivo, setLendoArquivo] = useState(false);
    const [alunosLidos, setAlunosLidos] = useState<any[] | null>(null); // Guarda o JSON extraído

    const { mutationImportarAlunosLote } = useCadastrosEscolares();

    // Função para limpar o estado quando o modal é fechado
    const handleClose = () => {
        setAlunosLidos(null);
        onClose();
    };

    const handleSelecionarArquivo = async () => {
        try {
            const [result] = await pick({
                type: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
                presentationStyle: 'fullScreen',
            });

            setLendoArquivo(true);
            const base64 = await RNFS.readFile(result.uri, 'base64');
            const workbook = XLSX.read(base64, { type: 'base64' });
            const nomePrimeiraAba = workbook.SheetNames[0];
            const aba = workbook.Sheets[nomePrimeiraAba];

            // Lê o Excel como JSON puro
            const dadosBrutos = XLSX.utils.sheet_to_json(aba);

            // Normaliza os dados (ignora espaços, maiúsculas e minúsculas nos cabeçalhos)
            const alunosNormalizados = dadosBrutos.map((linha: any) => {
                // Encontra as chaves reais da planilha, ignorando formatação
                const chaveNumero = Object.keys(linha).find(k => k.trim().toLowerCase() === 'numero' || k.trim().toLowerCase() === 'número');
                const chaveNome = Object.keys(linha).find(k => k.trim().toLowerCase() === 'nome');

                return {
                    numero: chaveNumero ? linha[chaveNumero] : null,
                    nome: chaveNome ? linha[chaveNome] : null
                };
            }).filter((aluno: any) => aluno.nome); // Remove linhas vazias perdidas no Excel

            setLendoArquivo(false);

            if (alunosNormalizados.length === 0) {
                Alert.alert("Aviso", "Não encontrámos colunas válidas. Certifique-se de que os cabeçalhos são 'Numero' e 'Nome'.");
                return;
            }

            // Guardamos a lista limpa e normalizada!
            setAlunosLidos(alunosNormalizados);

        } catch (err) {
            setLendoArquivo(false);
            if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) {
                console.log("Utilizador cancelou a seleção.");
            } else {
                console.error("Erro ao processar planilha:", err);
                Alert.alert("Erro", "Não foi possível ler a planilha. Verifique se o ficheiro não está corrompido.");
            }
        }
    };

    const handleConfirmarEnvio = () => {
        if (!idClasseSelecionada || !alunosLidos) return;

        mutationImportarAlunosLote.mutate({
            classeId: idClasseSelecionada,
            alunos: alunosLidos
        }, {
            onSuccess: () => {
                Alert.alert("Sucesso 🎉", `${alunosLidos.length} alunos importados com sucesso!`);
                handleClose();
            },
            onError: (err: any) => {
                Alert.alert("Erro", err.response?.data?.message || "Ocorreu um erro no servidor ao salvar os alunos.");
            }
        });
    };

    return (
        <ModalGenerico visible={visible} onClose={handleClose} titulo={alunosLidos ? "Confirme os Alunos" : "Como formatar a planilha?"}>
            <View style={styles.container}>

                {!alunosLidos ? (
                    // ================= ESTADO 1: INSTRUÇÕES =================
                    <>
                        <Text style={styles.textoInstrucao}>
                            Para que o sistema leia os dados corretamente, crie a sua planilha exatamente com este padrão:
                        </Text>

                        <View style={styles.planilhaContainer}>
                            <View style={styles.linhaLetras}>
                                <View style={styles.celulaIndex}><Text style={styles.textoIndex}></Text></View>
                                <View style={styles.celulaLetra}><Text style={styles.textoLetra}>A</Text></View>
                                <View style={styles.celulaLetra}><Text style={styles.textoLetra}>B</Text></View>
                            </View>
                            <View style={styles.linhaPlanilha}>
                                <View style={styles.celulaIndex}><Text style={styles.textoIndex}>1</Text></View>
                                <View style={styles.celulaDestaque}><Text style={styles.textoDestaque}>Numero</Text></View>
                                <View style={styles.celulaDestaque}><Text style={styles.textoDestaque}>Nome</Text></View>
                            </View>
                            <View style={styles.linhaPlanilha}>
                                <View style={styles.celulaIndex}><Text style={styles.textoIndex}>2</Text></View>
                                <View style={styles.celulaDados}><Text style={styles.textoDados}>1</Text></View>
                                <View style={styles.celulaDados}><Text style={styles.textoDados}>Ana Beatriz</Text></View>
                            </View>
                            <View style={styles.linhaPlanilha}>
                                <View style={styles.celulaIndex}><Text style={styles.textoIndex}>3</Text></View>
                                <View style={styles.celulaDados}><Text style={styles.textoDados}>2</Text></View>
                                <View style={styles.celulaDados}><Text style={styles.textoDados}>Carlos Eduardo</Text></View>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.btnSelecionar, lendoArquivo && { opacity: 0.7 }]}
                            onPress={handleSelecionarArquivo}
                            disabled={lendoArquivo}
                        >
                            {lendoArquivo ? (
                                <ActivityIndicator color={colors.white} />
                            ) : (
                                <>
                                    <Icon name="folder-search-outline" size={22} color={colors.white} />
                                    <Text style={styles.btnSelecionarTexto}>Escolher Ficheiro no Telemóvel</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </>
                ) : (
                    // ================= ESTADO 2: PRÉ-VISUALIZAÇÃO =================
                    <>
                        <View style={styles.previewHeader}>
                            <Icon name="check-circle-outline" size={24} color={colors.secondary} />
                            <Text style={styles.previewTitle}>Encontramos {alunosLidos.length} alunos!</Text>
                        </View>
                        <Text style={styles.previewSubtitle}>Confira abaixo se a extração ocorreu bem:</Text>

                        <FlatList
                            data={alunosLidos}
                            keyExtractor={(_, index) => index.toString()}
                            style={styles.listaPreview}
                            renderItem={({ item }) => (
                                <View style={styles.itemPreview}>
                                    <View style={styles.numeroBadge}>
                                        {/* Agora usamos diretamente item.numero */}
                                        <Text style={styles.numeroBadgeText}>{item.numero || '-'}</Text>
                                    </View>
                                    {/* Agora usamos diretamente item.nome */}
                                    <Text style={styles.nomePreviewText}>{item.nome || 'Sem nome'}</Text>
                                </View>
                            )}
                        />

                        <TouchableOpacity
                            style={[styles.btnConfirmar, mutationImportarAlunosLote.isPending && { opacity: 0.7 }]}
                            onPress={handleConfirmarEnvio}
                            disabled={mutationImportarAlunosLote.isPending}
                        >
                            {mutationImportarAlunosLote.isPending ? (
                                <ActivityIndicator color={colors.white} />
                            ) : (
                                <>
                                    <Icon name="cloud-upload" size={22} color={colors.white} />
                                    <Text style={styles.btnConfirmarTexto}>Confirmar e Guardar Alunos</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.btnCancelar}
                            onPress={() => setAlunosLidos(null)}
                            disabled={mutationImportarAlunosLote.isPending}
                        >
                            <Text style={styles.btnCancelarTexto}>Cancelar / Escolher outro ficheiro</Text>
                        </TouchableOpacity>
                    </>
                )}

            </View>
        </ModalGenerico>
    );
};

const styles = StyleSheet.create({
    container: { paddingVertical: 10 },
    textoInstrucao: { fontSize: 14, color: colors.darkText, marginBottom: 15, lineHeight: 20 },

    // Estilos Tabela
    planilhaContainer: { borderWidth: 1, borderColor: '#C0C0C0', backgroundColor: colors.white, marginBottom: 25 },
    linhaLetras: { flexDirection: 'row', backgroundColor: '#E6E6E6' },
    linhaPlanilha: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#C0C0C0' },
    celulaIndex: { width: 30, backgroundColor: '#E6E6E6', justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderRightColor: '#C0C0C0' },
    celulaLetra: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 4, borderRightWidth: 1, borderRightColor: '#C0C0C0' },
    celulaDestaque: { flex: 1, paddingVertical: 6, paddingHorizontal: 8, borderRightWidth: 1, borderRightColor: '#C0C0C0' },
    celulaDados: { flex: 1, paddingVertical: 6, paddingHorizontal: 8, borderRightWidth: 1, borderRightColor: '#C0C0C0' },
    textoIndex: { fontSize: 12, color: '#666' },
    textoLetra: { fontSize: 12, color: '#333', fontWeight: 'bold' },
    textoDestaque: { fontSize: 13, fontWeight: 'bold', color: colors.darkText },
    textoDados: { fontSize: 13, color: colors.mutedText },

    // Botões
    btnSelecionar: { flexDirection: 'row', backgroundColor: colors.secondary, padding: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center', gap: 8 },
    btnSelecionarTexto: { color: colors.white, fontWeight: 'bold', fontSize: 16 },

    // Estilos da Pré-Visualização
    previewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 5, gap: 8 },
    previewTitle: { fontSize: 18, fontWeight: 'bold', color: colors.secondary },
    previewSubtitle: { fontSize: 14, color: colors.mutedText, marginBottom: 15 },
    listaPreview: { maxHeight: 250, backgroundColor: colors.background, borderRadius: 8, padding: 10, marginBottom: 20 },
    itemPreview: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
    numeroBadge: { backgroundColor: colors.borderLight, width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    numeroBadgeText: { fontWeight: 'bold', color: colors.darkText, fontSize: 13 },
    nomePreviewText: { fontSize: 15, color: colors.darkText, flex: 1 },

    btnConfirmar: { flexDirection: 'row', backgroundColor: '#107C41', padding: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 },
    btnConfirmarTexto: { color: colors.white, fontWeight: 'bold', fontSize: 16 },
    btnCancelar: { padding: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    btnCancelarTexto: { color: colors.danger, fontWeight: 'bold', fontSize: 14 },
});