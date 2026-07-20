import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

import { colors } from '../theme/colors';
import { iapService } from '../services/iapService';
import { useIAPManager } from '../hooks/useIAPManager'; 

export default function ModalUpgrade() {
  const navigation = useNavigation<any>();
  const { comprarIlimitado } = useIAPManager();
  
  const [price, setPrice] = useState<string | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(false);

  useEffect(() => {
    fetchPrice();
  }, []);

  const fetchPrice = async () => {
    setLoadingPrice(true);
    const p = await iapService.getProductPrice();
    setPrice(p);
    setLoadingPrice(false);
  };

  const handleUpgrade = async () => {
    // Fecha a tela e inicia o fluxo de compra
    navigation.goBack();
    await comprarIlimitado();
  };

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
          style={[styles.btnUpgrade, loadingPrice && { opacity: 0.7 }]} 
          onPress={handleUpgrade} 
          disabled={loadingPrice}
        >
          <Text style={styles.btnUpgradeText}>ASSINAR AGORA</Text>
        </TouchableOpacity>

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
  
  btnCancel: { marginTop: 15, padding: 10 },
  btnCancelText: { color: '#9CA3AF', fontWeight: '600' }
});