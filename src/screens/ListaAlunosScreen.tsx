import React, { useState, useEffect } from 'react';
import {
  View, FlatList, Text, StyleSheet, ActivityIndicator,
  StatusBar, TouchableOpacity, Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Importação para a v14.7.17
import * as IAP from 'react-native-iap';

import { useAppStore } from '../store/useAppStore';
import { useAlunos } from '../hooks/useEscolar';
import { colors } from '../theme/colors';
import { FiltrosEscolar } from '../components/FiltroEscolar';
import { AlunoCard } from '../components/AlunoCard';
import { ModalCadastroAluno } from '../modais/ModalCadastroAluno';
import { ModalEditarAluno } from '../modais/ModalEditarAluno';

function ListaAlunosScreen() {
  const { idClasseSelecionada } = useAppStore();
  const { data: alunos, isLoading, isError } = useAlunos(idClasseSelecionada);

  const [modalCadastroVisible, setModalCadastroVisible] = useState(false);
  const [modalEditarVisible, setModalEditarVisible] = useState(false);
  const [alunoParaEditar, setAlunoParaEditar] = useState<any>(null);

  const limparCompraAntiga = async () => {
    try {
      await IAP.initConnection();
      // Pega as compras que você já tem
      const purchases = await IAP.getAvailablePurchases();

      if (purchases.length > 0) {
        console.log("Limpando compra antiga...", purchases[0].purchaseToken);
        // Isso avisa o Google: "Já usei esse item, pode me deixar comprar de novo"
        await IAP.consumePurchaseAndroid(purchases[0].purchaseToken);
        Alert.alert("Sucesso", "Compra antiga limpa! Agora você pode clicar em comprar de novo.");
      } else {
        Alert.alert("Aviso", "Nenhuma compra encontrada para limpar.");
      }
    } catch (err) {
      console.log("Erro ao limpar:", err);
    }
  };
  // --- CONFIGURAÇÃO DO LISTENER (O SEGREDO DO TOKEN) ---
  useEffect(() => {
    // Esse listener "escuta" o Google Play e pega o token assim que você confirma a compra
    const purchaseUpdateSubscription = IAP.purchaseUpdatedListener((purchase: any) => {
      const token = purchase.purchaseToken;
      if (token) {
        console.log("========================================");
        console.log("TOKEN CAPTURADO PELO LISTENER:");
        console.log(token);
        console.log("DADOS DA COMPRA:", purchase);
        console.log("========================================");

        Alert.alert("Sucesso!", "Token gerado no console do VS Code!");

        // Finaliza a transação para o Google não estornar o dinheiro (ou o teste)
        IAP.finishTransaction({ purchase });
      }
    });

    const purchaseErrorSubscription = IAP.purchaseErrorListener((error) => {
      console.log('Erro no Listener de Compra:', error);
    });

    // Limpa os listeners quando você sai da tela
    return () => {
      if (purchaseUpdateSubscription) purchaseUpdateSubscription.remove();
      if (purchaseErrorSubscription) purchaseErrorSubscription.remove();
    };
  }, []);

  const handleLongPressAluno = (aluno: any) => {
    setAlunoParaEditar(aluno);
    setModalEditarVisible(true);
  };

  const capturarTokenDeTeste = async () => {
    try {
      console.log("--- INICIANDO CAPTURA (V14.7.17) ---");

      // 1. Inicializa conexão
      await IAP.initConnection();

      // 2. Busca o produto para validar
      const products = await IAP.fetchProducts({ skus: ['ilimitado'] });
      console.log("Produtos na loja:", products);

      if (products && products.length > 0) {
        console.log("Solicitando janela de compra...");

        // 3. Solicita a compra no formato correto da v14
        // O await aqui pode retornar vazio, mas o Listener lá em cima vai pegar o token!
        await (IAP as any).requestPurchase({
          request: {
            google: {
              skus: ['ilimitado']
            }
          },
          type: 'in-app'
        });

      } else {
        Alert.alert("Erro", "Produto 'ilimitado' não encontrado na Play Store.");
      }
    } catch (err: any) {
      console.log("Erro no fluxo IAP:", err);
      if (err.code !== 'E_USER_CANCELLED') {
        Alert.alert("Erro", err.message);
      }
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
        onPress={capturarTokenDeTeste}
        disabled={!idClasseSelecionada}
      >
        <Icon name="account-plus" size={28} color={colors.white} />
      </TouchableOpacity>

      <ModalCadastroAluno
        visible={modalCadastroVisible}
        onClose={() => setModalCadastroVisible(false)}
        idClasseSelecionada={idClasseSelecionada}
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