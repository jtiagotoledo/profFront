import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface AlunoProps {
  aluno: {
    numero: number;
    nome: string;
    media: number;
    frequencia: number;
  };
}

export const AlunoCard = ({ aluno }: AlunoProps) => {
  const corNota = aluno.media >= 7 ? colors.success : aluno.media >= 5 ? colors.warning : colors.danger;
  const corFreq = aluno.frequencia >= 90 ? colors.success : aluno.frequencia >= 75 ? colors.warning : colors.danger;

  return (
    <View style={styles.card}>

      <View style={styles.infoContainer}>
        <View style={styles.badgeNumero}>
          <Text style={styles.textoNumero}>{aluno.numero.toString().padStart(2, '0')}</Text>
        </View>
        <View style={styles.nomeWrapper}>
          <Text style={styles.nome} numberOfLines={1}>{aluno.nome}</Text>
          
          <View style={styles.trackFrequencia}>
            <View style={[styles.barraFrequencia, { width: `${aluno.frequencia}%`, backgroundColor: corFreq }]} />
          </View>
          <Text style={styles.subtexto}>{aluno.frequencia}% de presença</Text>
        </View>
      </View>

      <View style={[styles.notaContainer, { borderColor: corNota }]}>
        <Text style={[styles.textoNota, { color: corNota }]}>{aluno.media.toFixed(1)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  badgeNumero: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F0F2f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textoNumero: { fontSize: 12, fontWeight: '700', color: colors.mutedText },
  nomeWrapper: { flex: 1, marginRight: 10 },
  nome: { fontSize: 16, fontWeight: '600', color: colors.darkText, marginBottom: 4 },
  trackFrequencia: {
    height: 4,
    backgroundColor: '#E1E4E8',
    borderRadius: 2,
    width: '80%',
    overflow: 'hidden',
  },
  barraFrequencia: { height: '100%' },
  subtexto: { fontSize: 10, color: colors.mutedText, marginTop: 2 },
  notaContainer: {
    width: 50,
    height: 50,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoNota: { fontSize: 18, fontWeight: 'bold' },
});