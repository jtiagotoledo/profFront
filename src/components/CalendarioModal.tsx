import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format } from 'date-fns';
import { colors } from '../theme/colors';

LocaleConfig.locales['pt-br'] = {
  monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
  monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
  dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
  dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt-br';

interface CalendarioModalProps {
  visivel: boolean;
  fechar: () => void;
  dataSelecionada: Date;
  aoSelecionarData: (data: Date) => void;
  diasMarcados?: string[]; 
}

export const CalendarioModal = ({ 
  visivel, 
  fechar, 
  dataSelecionada, 
  aoSelecionarData, 
  diasMarcados = [] 
}: CalendarioModalProps) => {

  const dataFormatadaStr = format(dataSelecionada, 'yyyy-MM-dd');

  const markedDates = useMemo(() => {
    const marks: any = {};
    const hojeStr = format(new Date(), 'yyyy-MM-dd');

    diasMarcados.forEach((data) => {
      marks[data] = { marked: true, dotColor: colors.secondary };
    });

    if (hojeStr !== dataFormatadaStr) {
      marks[hojeStr] = {
        ...marks[hojeStr],
        customStyles: {
          text: { color: colors.primary, fontWeight: 'bold' }
        }
      };
    }

    marks[dataFormatadaStr] = {
      ...marks[dataFormatadaStr],
      selected: true,
      selectedColor: colors.primary,
      selectedDotColor: '#ffffff',
    };

    return marks;
  }, [diasMarcados, dataFormatadaStr]);

  const handleDayPress = (day: any) => {
    const novaData = new Date(day.timestamp + (new Date().getTimezoneOffset() * 60000));
    aoSelecionarData(novaData);
    fechar();
  };

  return (
    <Modal visible={visivel} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.calendarCard}>
          <View style={styles.calendarHeader}>
            <Text style={styles.calendarTitle}>Selecione a Data</Text>
            <TouchableOpacity onPress={fechar}>
              <Icon name="close" size={24} color={colors.darkText} />
            </TouchableOpacity>
          </View>

          <Calendar
            markingType={'custom'}
            current={dataFormatadaStr}
            markedDates={markedDates}
            onDayPress={handleDayPress}
            renderArrow={(direction: 'left' | 'right') => (
              <Icon 
                name={direction === 'left' ? 'chevron-left' : 'chevron-right'} 
                size={30} 
                color={colors.primary} 
              />
            )}
            theme={{
              textSectionTitleColor: '#111827',
              textDayHeaderFontSize: 13,
              textDayHeaderFontWeight: '800',
              textDayFontSize: 16,
              textDayFontWeight: '500',
              todayTextColor: colors.primary,
              selectedDayBackgroundColor: colors.primary,
              selectedDayTextColor: '#ffffff',
              monthTextColor: '#111827',
              textMonthFontWeight: 'bold',
              textMonthFontSize: 18,
              dotColor: colors.secondary,
            }}
          />

          <View style={styles.calendarFooter}>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: colors.secondary }]} />
              <Text style={styles.legendText}>Dias com registros realizados</Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  calendarCard: { backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', paddingBottom: 10, elevation: 5 },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee', alignItems: 'center' },
  calendarTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  calendarFooter: { padding: 16, borderTopWidth: 1, borderTopColor: '#eee' },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  legendText: { fontSize: 12, color: colors.mutedText },
});