import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppStore } from '../store/useAppStore';
import { useAnos, useClasses } from '../hooks/useEscolar';
import { colors } from '../theme/colors';

import { ModalCadastroAno } from '../modais/ModalCadastroAno';
import { ModalCadastroClasse } from '../modais/ModalCadastroClasse';
import { ModalEditarAno } from '../modais/ModalEditarAno';
import { ModalEditarClasse } from '../modais/ModalEditarClasse'; 

import { ModalUpgrade } from '../modais/ModalUpgrade';
import { useIAPManager } from '../hooks/useIAPManager';

export const FiltrosEscolar = () => {
  const { idAnoSelecionado, idClasseSelecionada, setAno, setClasse, user } = useAppStore();
  const { comprarIlimitado } = useIAPManager();

  const { data: anos, isLoading: loadingAnos } = useAnos();
  const { data: classes, isLoading: loadingClasses } = useClasses(idAnoSelecionado);

  const [modalType, setModalType] = useState<'ano' | 'classe' | null>(null);
  const [modalUpgradeVisible, setModalUpgradeVisible] = useState(false);
  
  const [modalEditAnoVisible, setModalEditAnoVisible] = useState(false);
  const [anoParaEditar, setAnoParaEditar] = useState<{ _id: string; rotulo: string } | null>(null);
  
  const [modalEditClasseVisible, setModalEditClasseVisible] = useState(false);
  const [classeParaEditar, setClasseParaEditar] = useState<{ _id: string; nome: string } | null>(null);

  const isPremium = user?.isPremium;

  const handlePressAddAno = () => {
    if (!isPremium && (anos?.length || 0) >= 1) {
      setModalUpgradeVisible(true);
    } else {
      setModalType('ano');
    }
  };

  const handlePressAddClasse = () => {
    if (!isPremium && (classes?.length || 0) >= 1) {
      setModalUpgradeVisible(true);
    } else {
      setModalType('classe');
    }
  };

  const handleLongPressAno = (ano: any) => {
    setAno(ano._id);
    setAnoParaEditar(ano);
    setModalEditAnoVisible(true);
  };

  const handleLongPressClasse = (classe: any) => {
    setClasse(classe._id);
    setClasseParaEditar(classe);
    setModalEditClasseVisible(true);
  };

  return (
    <View style={styles.container}>
      
      {/* SEÇÃO: ANO LETIVO */}
      <View style={styles.section}>
        <View style={styles.headerRow}>
          <Text style={styles.label}>Ano Letivo</Text>
          <TouchableOpacity
            onPress={handlePressAddAno}
            style={styles.iconAdd}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Icon 
              name={(!isPremium && (anos?.length || 0) >= 1) ? "lock" : "plus-circle-outline"} 
              size={20} 
              color={colors.primary} 
            />
          </TouchableOpacity>
        </View>

        {loadingAnos ? (
          <ActivityIndicator size="small" color={colors.secondary} style={styles.loader} />
        ) : (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={anos}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listPadding}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setAno(item._id)}
                onLongPress={() => handleLongPressAno(item)}
                delayLongPress={500}
                style={[
                  styles.chip,
                  idAnoSelecionado === item._id ? styles.chipAtivo : styles.chipInativo
                ]}
              >
                <Text style={[
                  styles.chipText,
                  idAnoSelecionado === item._id ? styles.chipTextAtivo : styles.chipTextInativo
                ]}>
                  {item.rotulo}
                </Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      {/* SEÇÃO: MINHAS TURMAS (Só aparece se houver ano selecionado) */}
      {idAnoSelecionado && (
        <View style={styles.section}>
          <View style={styles.headerRow}>
            <Text style={styles.label}>Minhas Turmas</Text>
            <TouchableOpacity
              onPress={handlePressAddClasse}
              style={styles.iconAdd}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <Icon 
                name={(!isPremium && (classes?.length || 0) >= 1) ? "lock" : "plus-circle-outline"} 
                size={20} 
                color={colors.primary} 
              />
            </TouchableOpacity>
          </View>

          {loadingClasses ? (
            <ActivityIndicator size="small" color={colors.secondary} style={styles.loader} />
          ) : (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={classes}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.listPadding}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => setClasse(item._id)}
                  onLongPress={() => handleLongPressClasse(item)}
                  delayLongPress={500}
                  style={[
                    styles.chipClasse,
                    idClasseSelecionada === item._id ? styles.chipAtivo : styles.chipInativo
                  ]}
                >
                  <Text style={[
                    styles.chipText,
                    idClasseSelecionada === item._id ? styles.chipTextAtivo : styles.chipTextInativo
                  ]}>
                    {item.nome}
                  </Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      )}

      {/* --- MODAIS DE CADASTRO --- */}
      <ModalCadastroAno 
        visible={modalType === 'ano'} 
        onClose={() => setModalType(null)} 
      />
      <ModalCadastroClasse 
        visible={modalType === 'classe'} 
        onClose={() => setModalType(null)} 
        idAnoSelecionado={idAnoSelecionado} 
      />

      {/* --- MODAIS DE EDIÇÃO --- */}
      <ModalEditarAno 
        visible={modalEditAnoVisible} 
        onClose={() => { setModalEditAnoVisible(false); setAnoParaEditar(null); }} 
        ano={anoParaEditar} 
      />
      <ModalEditarClasse 
        visible={modalEditClasseVisible} 
        onClose={() => { setModalEditClasseVisible(false); setClasseParaEditar(null); }} 
        classe={classeParaEditar} 
      />

      {/* --- MODAL DE UPGRADE (PREMIUM) --- */}
      <ModalUpgrade 
        visible={modalUpgradeVisible} 
        onClose={() => setModalUpgradeVisible(false)}
        onUpgrade={() => {
          setModalUpgradeVisible(false);
          comprarIlimitado();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight
  },
  section: { marginBottom: 14 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingLeft: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.mutedText,
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  iconAdd: { marginLeft: 6, padding: 2 },
  listPadding: { paddingHorizontal: 12 },
  loader: { marginLeft: 16, alignSelf: 'flex-start' },
  chip: {
    paddingHorizontal: 22,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    borderWidth: 1,
  },
  chipClasse: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 4,
    borderWidth: 1,
  },
  chipInativo: {
    backgroundColor: colors.background,
    borderColor: colors.borderLight,
  },
  chipAtivo: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    elevation: 3,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  chipText: { fontSize: 14, fontWeight: '600' },
  chipTextInativo: { color: colors.mutedText },
  chipTextAtivo: { color: colors.white },
});