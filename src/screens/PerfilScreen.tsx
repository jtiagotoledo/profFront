import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { pick, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import { useNavigation } from '@react-navigation/native';

import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';
import { iapService } from '../services/iapService';
import { updateFotoPerfilAPI } from '../services/usersApi';

export default function PerfilScreen() {
  const { user, appVersion, logout, refreshUser } = useAppStore();
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const navigation = useNavigation<any>();

  const handleDebugLimparCompras = async () => {
    if (__DEV__) {
      console.log("🛠️ Modo Dev: Limpando compras de teste...");
      await iapService.limparComprasTestes();
    }
  };

  const handleTrocarFoto = async () => {
    try {
      const [file] = await pick({
        type: ['image/*'],
        copyTo: 'cachesDirectory', 
      });

      if (!file) return;

      setUploadingFoto(true);
      
      const uriSegura = (file as any).fileCopyUri || file.uri;

      const formData = new FormData();
      formData.append('foto', {
        uri: uriSegura, 
        type: file.type || 'image/jpeg',
        name: file.name || 'perfil.jpg',
      } as any);

      await updateFotoPerfilAPI(formData);

      await refreshUser();
      
      Alert.alert("Sucesso", "Foto de perfil atualizada!");

    } catch (err) {
      if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) {
        console.log("Utilizador cancelou a seleção da foto.");
      } else {
        console.error("Erro ao fazer upload da foto:", err);
        Alert.alert("Erro", "Não foi possível atualizar a foto de perfil. Tente novamente.");
      }
    } finally {
      setUploadingFoto(false);
    }
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topWrapper}>
        <View style={styles.logoSection}>
          <Image
            source={require('../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* CARD DO USUÁRIO */}
        <View style={styles.userCard}>
          
          {/* FOTO DE PERFIL CLICÁVEL COM ÍCONE DE CÂMARA */}
          <TouchableOpacity onPress={handleTrocarFoto} disabled={uploadingFoto} activeOpacity={0.8}>
            <View style={styles.avatarContainer}>
              {user?.fotoPerfil ? (
                <Image source={{ uri: user.fotoPerfil }} style={styles.avatarLarge} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>{user?.nome?.charAt(0) || 'P'}</Text>
                </View>
              )}
              
              <View style={styles.editBadge}>
                {uploadingFoto ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Icon name="camera" size={16} color="#FFF" />
                )}
              </View>
            </View>
          </TouchableOpacity>

          <Text style={styles.userName}>{user?.nome || 'Professor'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          
          {user?.isPremium && (
            <View style={styles.premiumBadge}>
              <Icon name="crown" size={16} color="#FFD700" />
              <Text style={styles.premiumText}>Professor Premium</Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {/* MENU DE OPÇÕES */}
        <View style={styles.menuSection}>
          
          {/* BOTÃO DA GRADE DE HORÁRIOS */}
          <TouchableOpacity 
            style={styles.menuItem} 
            activeOpacity={0.7}
            onPress={() => navigation.navigate('GradeHorarios')}
          >
            <Icon name="calendar-month-outline" size={24} color={colors.primary} />
            <Text style={styles.menuText}>Grade de Horários</Text>
            <Icon name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
            <Icon name="account-edit-outline" size={24} color={colors.primary} />
            <Text style={styles.menuText}>Editar Perfil</Text>
            <Icon name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={async () => await logout()}
            activeOpacity={0.7}
          >
            <Icon name="logout-variant" size={24} color="#EF4444" />
            <Text style={[styles.menuText, { color: '#EF4444' }]}>Sair da Conta</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* RODAPÉ */}
      <View style={styles.footer}>
        <Text style={styles.versionLabel}>Assistente do Professor</Text>
        <TouchableOpacity
          onLongPress={handleDebugLimparCompras}
          delayLongPress={3000}
          activeOpacity={0.6}
        >
          <Text style={styles.versionNumber}>Versão {appVersion}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { flexGrow: 1, padding: 20, alignItems: 'center', justifyContent: 'space-between' },
  topWrapper: { width: '100%', alignItems: 'center' },
  logoSection: { marginVertical: 30 },
  logo: { width: 180, height: 100 },
  userCard: { backgroundColor: '#FFF', width: '100%', borderRadius: 20, padding: 25, alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  
  /* ESTILOS NOVOS DO AVATAR */
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatarLarge: { width: 100, height: 100, borderRadius: 50 },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarInitial: { color: '#FFF', fontSize: 40, fontWeight: 'bold' },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.secondary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
    elevation: 2,
  },
  
  userName: { fontSize: 20, fontWeight: '700', color: '#1F2937' },
  userEmail: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  premiumBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginTop: 12, gap: 5 },
  premiumText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#E5E7EB', width: '100%', marginVertical: 25 },
  menuSection: { width: '100%', gap: 12 },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 16, borderRadius: 12, gap: 12, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, shadowOffset: { width: 0, height: 1 } },
  menuText: { flex: 1, fontSize: 16, fontWeight: '600', color: '#374151' },
  footer: { marginTop: 40, alignItems: 'center', paddingBottom: 10 },
  versionLabel: { fontSize: 12, color: '#9CA3AF', fontWeight: '600' },
  versionNumber: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
});