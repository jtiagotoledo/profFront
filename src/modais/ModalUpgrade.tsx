import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { getAvailablePurchases } from 'react-native-iap'; // Removido finishTransaction daqui

import { colors } from '../theme/colors';
import { iapService } from '../services/iapService';
import { useIAPManager } from '../hooks/useIAPManager';
import api from '../services/api'; 
import { useAppStore } from '../store/useAppStore'; 
import { getMeAPI } from '../services/usersApi'; 

export default function ModalUpgrade() {
  const navigation = useNavigation<any>();
  const { comprarIlimitado } = useIAPManager();
  const { setUser } = useAppStore(); 
  
  const [price, setPrice] = useState<string | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    fetchPrice();
  }, []);

  const fetchPrice = async () => {
    setLoadingPrice(true);
    const p = await iapService.getProductPrice();
    setPrice(p);
    setLoadingPrice(false);
  };

  // Sincroniza os dados locais após transações para liberar as funções premium imediatamente
  const syncUserProfile = async () => {
    try {
      const userData = await getMeAPI();
      setUser(userData);
    } catch (error) {
      console.log("Erro ao atualizar perfil após transação:", error);
    }
  };

  const handleUpgrade = async () => {
    try {
      // 1. Inicia o fluxo e AGUARDA a Google Play terminar
      await comprarIlimitado();
      
      // 2. Atualiza o app com o status premium
      await syncUserProfile();
      
      // 3. Fecha a tela
      navigation.goBack();
    } catch (error) {
      console.log("Erro na compra:", error);
    }
  };

  const handleRestaurar = async () => {
    setIsRestoring(true);
    try {
      const purchases = await getAvailablePurchases();
      
      if (purchases && purchases.length > 0) {
        const ultimaCompra = purchases[purchases.length - 1];

        // Envia para o profBack validar
        await api.post('/usuarios/validar-compra', {
          productId: ultimaCompra.productId,
          purchaseToken: ultimaCompra.purchaseToken,
        });
        
        await syncUserProfile(); 

        Alert.alert("Sucesso", "Sua compra foi encontrada e o acesso Premium restaurado!");
        navigation.goBack(); 
      } else {
        Alert.alert("Aviso", "Nenhuma compra anterior foi encontrada nesta conta do Google.");
      }
    } catch (error) {
      console.error('Erro ao restaurar compras:', error);
      Alert.alert("Erro", "Falha ao tentar restaurar compras. Tente novamente.");
    } finally {
      setIsRestoring(false);
    }
  };

  /* 
  // FUNÇÃO DEV COMENTADA (Descomente apenas se precisar limpar compras travadas em novos testes)
  const limparComprasTravadas = async () => {
    try {
      const purchases = await getAvailablePurchases();
      if (purchases && purchases.length > 0) {
        for (let purchase of purchases) {
          await finishTransaction({ purchase, isConsumable: true });
        }
        Alert.alert("Limpeza Concluída!", "O Google esqueceu sua compra. Feche o app e tente comprar de novo.");
      } else {
        Alert.alert("Aviso", "Nenhuma compra travada encontrada.");
      }
    } catch (error) {
      console.error("Erro ao limpar:", error);
      Alert.alert("Erro", "Falha ao tentar limpar as compras.");
    }
  };
  */

  const handleClose = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Icon name="crown" size={50} color="#FFD700" />
          <Text style={styles.title}>Versão Premium</Text>
          <Text style={styles.subtitle}>Libere todo o potencial do app</Text>
        </View>

        <View style={styles.benefits}>
          <BenefitItem icon="calendar-multiselect" text="Criação de anos letivos ilimitados" />
          <BenefitItem icon="google-classroom" text="Criação de classes ilimitadas" />
          <BenefitItem icon="account-group" text="Mais de 10 alunos por turma" />
          <BenefitItem icon="file-excel" text="Importação rápida de alunos via Excel" />
          <BenefitItem icon="file-pdf-box" text="Exportação ilimitada de notas em PDF" /> 
          <BenefitItem icon="cloud-check" text="Sincronização e Backup total" />
        </View>

        <View style={styles.priceContainer}>
          {loadingPrice ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Text style={styles.priceText}>
              Pagamento único de <Text style={styles.priceHighlight}>{price || '---'}</Text>
            </Text>
          )}
          <Text style={styles.priceDetail}>Acesso vitalício, sem mensalidades</Text>
        </View>

        <TouchableOpacity 
          style={[styles.btnUpgrade, (loadingPrice || isRestoring) && { opacity: 0.7 }]} 
          onPress={handleUpgrade} 
          disabled={loadingPrice || isRestoring}
        >
          <Text style={styles.btnUpgradeText}>ASSINAR AGORA</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.btnRestaurar} 
          onPress={handleRestaurar}
          disabled={isRestoring}
        >
          {isRestoring ? (
            <ActivityIndicator color={colors.primary} size="small" />
          ) : (
            <Text style={styles.btnRestaurarText}>Já comprou? Restaurar compra</Text>
          )}
        </TouchableOpacity>

        {/* BOTÃO DEV COMENTADO 
        <TouchableOpacity style={styles.btnDev} onPress={limparComprasTravadas}>
          <Text style={styles.btnDevText}>[DEV] Limpar Conta Google</Text>
        </TouchableOpacity>
        */}

        <TouchableOpacity style={styles.btnCancel} onPress={handleClose}>
          <Text style={styles.btnCancelText}>Talvez mais tarde</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const BenefitItem = ({ icon, text }: { icon: string; text: string }) => (
  <View style={styles.benefitRow}>
    <Icon name={icon} size={22} color={colors.primary} />
    <Text style={styles.benefitText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  overlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.7)', 
    justifyContent: 'center', 
    padding: 20 
  },
  container: { 
    backgroundColor: '#FFF', 
    borderRadius: 24, 
    padding: 24, 
    alignItems: 'center' 
  },
  header: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginTop: 10 },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  
  benefits: { 
    width: '100%', 
    backgroundColor: '#F3F4F6', 
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 20 
  },
  benefitRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 12 },
  benefitText: { color: '#374151', fontSize: 14, fontWeight: '500', flex: 1 },
  
  priceContainer: { alignItems: 'center', marginBottom: 20 },
  priceText: { fontSize: 15, color: '#4B5563' },
  priceHighlight: { fontWeight: 'bold', color: '#111827', fontSize: 20 },
  priceDetail: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  
  btnUpgrade: { 
    backgroundColor: colors.primary, 
    width: '100%', 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center', 
    elevation: 2 
  },
  btnUpgradeText: { color: '#FFF', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
  
  btnRestaurar: { marginTop: 15, padding: 10 },
  btnRestaurarText: { color: colors.primary, fontWeight: 'bold', fontSize: 14 },

  btnDev: { marginTop: 15, padding: 10, backgroundColor: '#EF4444', borderRadius: 8 },
  btnDevText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },

  btnCancel: { marginTop: 15, padding: 10 },
  btnCancelText: { color: '#9CA3AF', fontWeight: '600' }
});