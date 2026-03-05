import React from 'react';
import { View, FlatList, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { useAnos, useClasses } from '../hooks/useEscolar';
import { colors } from '../theme/colors'; 

export const FiltrosEscolar = () => {
  const { idAnoSelecionado, idClasseSelecionada, setAno, setClasse } = useAppStore();

  const { data: anos, isLoading: loadingAnos } = useAnos();
  const { data: classes, isLoading: loadingClasses } = useClasses(idAnoSelecionado);

  return (
    <View style={styles.container}>

      <View style={styles.section}>
        <Text style={styles.label}>Ano Letivo</Text>
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
                style={[
                  styles.chip, 
                  idAnoSelecionado === item._id ? styles.chipAtivo : styles.chipInativo
                ]}
              >
                <Text style={[
                  styles.chipText, 
                  idAnoSelecionado === item._id ? styles.chipTextAtivo : styles.chipTextInativo
                ]}>
                  {item.nome}
                </Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      {idAnoSelecionado && (
        <View style={styles.section}>
          <Text style={styles.label}>Minhas Turmas</Text>
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
  label: { 
    fontSize: 11, 
    fontWeight: '800', 
    color: colors.mutedText, 
    marginLeft: 16, 
    marginBottom: 8, 
    textTransform: 'uppercase',
    letterSpacing: 1
  },
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
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  chipTextInativo: {
    color: colors.mutedText,
  },
  chipTextAtivo: {
    color: colors.white,
  },
});