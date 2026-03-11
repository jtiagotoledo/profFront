import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface AlunoProps {
  aluno: {
    numeroChamada: number;
    nome: string;
    media: number;
    frequenciaPorcentagem: number; // Nome atualizado conforme o Backend
    ativo: boolean; // Alterado de string para boolean
  };
}

export const AlunoCard = ({ aluno }: AlunoProps) => {
  // Garantimos que o valor seja um número para não quebrar o layout
  const freq = aluno.frequenciaPorcentagem ?? 100;
  const nota = aluno.media ?? 0;

  const corNota = nota >= 7 ? colors.success : nota >= 5 ? colors.warning : colors.danger;
  const corFreq = freq >= 90 ? colors.success : freq >= 75 ? colors.warning : colors.danger;

  return (
    <View
      style={[
        styles.card,
        {
          opacity: aluno.ativo ? 1 : 0.6,
          backgroundColor: aluno.ativo ? colors.white : '#f2f2f2' // Cor de fundo para inativos
        }
      ]}
    >
      <View style={styles.infoContainer}>
        <View style={styles.badgeNumero}>
          <Text style={styles.textoNumero}>{aluno.numeroChamada.toString().padStart(2, '0')}</Text>
        </View>
        <View style={styles.nomeWrapper}>
          <Text style={styles.nome} numberOfLines={1}>{aluno.nome}</Text>

          {/* Barra de progresso visual da frequência */}
          <View style={styles.trackFrequencia}>
            <View 
              style={[
                styles.barraFrequencia, 
                { width: `${freq}%`, backgroundColor: corFreq }
              ]} 
            />
          </View>
          <Text style={styles.subtexto}>{freq}% de presença</Text>
        </View>
      </View>

      <View style={[styles.notaContainer, { borderColor: corNota }]}>
        <Text style={[styles.textoNota, { color: corNota }]}>
          {nota.toFixed(1)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
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
    marginHorizontal: 1, // Evita corte da sombra
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
    width: '85%',
    overflow: 'hidden',
  },
  barraFrequencia: { height: '100%' },
  subtexto: { fontSize: 10, color: colors.mutedText, marginTop: 2 },
  notaContainer: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  textoNota: { fontSize: 16, fontWeight: 'bold' },
});