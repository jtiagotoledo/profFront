import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';

export default function PerfilScreen() {
  const { user, appVersion, logout } = useAppStore();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.logoSection}>
        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* CARD DO USUÁRIO */}
      <View style={styles.userCard}>
        {user?.fotoPerfil ? (
          <Image source={{ uri: user.fotoPerfil }} style={styles.avatarLarge} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>{user?.nome?.charAt(0) || 'P'}</Text>
          </View>
        )}
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

      {/* MENU DE OPÇÕES (Espaço para crescer) */}
      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem}>
          <Icon name="account-edit-outline" size={24} color={colors.primary} />
          <Text style={styles.menuText}>Editar Perfil</Text>
          <Icon name="chevron-right" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={async () => await logout()}>
          <Icon name="logout-variant" size={24} color="#EF4444" />
          <Text style={[styles.menuText, { color: '#EF4444' }]}>Sair da Conta</Text>
        </TouchableOpacity>
      </View>

      {/* RODAPÉ */}
      <View style={styles.footer}>
        <Text style={styles.versionLabel}>Assistente do Professor</Text>
        <Text style={styles.versionNumber}>Versão {appVersion}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 20, alignItems: 'center' },
  logoSection: { marginVertical: 30 },
  logo: { width: 180, height: 60 },
  userCard: {
    backgroundColor: '#FFF',
    width: '100%',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  avatarLarge: { width: 100, height: 100, borderRadius: 50, marginBottom: 15 },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15
  },
  avatarInitial: { color: '#FFF', fontSize: 40, fontWeight: 'bold' },
  userName: { fontSize: 20, fontWeight: '700', color: '#1F2937' },
  userEmail: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  divider: { height: 1, backgroundColor: '#E5E7EB', width: '100%', marginVertical: 25 },
  menuSection: { width: '100%', gap: 10 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  menuText: { flex: 1, fontSize: 16, fontWeight: '600', color: '#374151' },
  footer: { marginTop: 40, alignItems: 'center' },
  versionLabel: { fontSize: 12, color: '#9CA3AF', fontWeight: '600' },
  versionNumber: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 10,
    gap: 5
  },
  premiumText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  }
});