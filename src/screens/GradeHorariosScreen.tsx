import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { getHorarios, saveHorario, deleteHorario, getAnosAPI } from '../services/dataApi';
import { ModalEditarHorario } from '../modais/ModalEditarHorario';

const DIAS_FIXOS = [1, 2, 3, 4, 5, 6, 7]; 

const NOMES_DIAS: { [key: number]: string } = {
  1: 'Segunda',
  2: 'Terça',
  3: 'Quarta',
  4: 'Quinta',
  5: 'Sexta',
  6: 'Sábado',
  7: 'Domingo'
};

export const GradeHorariosScreen = () => {
  const [quantidadeAulas, setQuantidadeAulas] = useState<number>(0);
  const [horariosSalvos, setHorariosSalvos] = useState<any[]>([]);
  const [anosDisponiveis, setAnosDisponiveis] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [celulaAtiva, setCelulaAtiva] = useState({ dia: 0, aula: 0 });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [horariosData, anosData] = await Promise.all([
        getHorarios(),
        getAnosAPI()
      ]);

      setHorariosSalvos(horariosData);
      setAnosDisponiveis(anosData);

      const maxAulaBanco = horariosData.length > 0 ? Math.max(...horariosData.map((h: any) => h.aula)) : 0;

      setQuantidadeAulas(prev => {
        if (prev === 0) {
          return maxAulaBanco > 0 ? maxAulaBanco : 6; // Se tiver dados, usa o número real; se vazio, assume 6
        }
        return Math.max(prev, maxAulaBanco);
      });
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível carregar a grade e os anos letivos.');
    } finally {
      setLoading(false);
    }
  };

  const listaAulas = Array.from({ length: quantidadeAulas }, (_, i) => i + 1);

  const adicionarLinhaAula = () => {
    setQuantidadeAulas(prev => prev + 1);
  };

  const removerUltimaLinhaAula = () => {
    if (quantidadeAulas <= 1) {
      Alert.alert('Aviso', 'A grade precisa ter pelo menos 1 aula.');
      return;
    }

    const ultimaAula = quantidadeAulas;
    const horariosNestaAula = horariosSalvos.filter(h => h.aula === ultimaAula);

    if (horariosNestaAula.length > 0) {
      Alert.alert(
        'Atenção',
        `A ${ultimaAula}ª Aula possui ${horariosNestaAula.length} horário(s) cadastrado(s). Deseja excluir esta linha e todos os horários associados a ela?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Sim, excluir tudo',
            style: 'destructive',
            onPress: async () => {
              try {
                await Promise.all(horariosNestaAula.map(h => deleteHorario(h._id)));
                setQuantidadeAulas(prev => Math.max(1, prev - 1));
                await carregarDados();
              } catch (error) {
                Alert.alert('Erro', 'Não foi possível remover os horários desta aula.');
              }
            }
          }
        ]
      );
    } else {
      setQuantidadeAulas(prev => Math.max(1, prev - 1));
    }
  };

  const abrirEdicao = (dia: number, aula: number) => {
    setCelulaAtiva({ dia, aula });
    setModalVisible(true);
  };

  const handleSalvar = async (horarioTexto: string, classeId: string) => {
    try {
      await saveHorario({ 
        diaSemana: celulaAtiva.dia, 
        aula: celulaAtiva.aula, 
        horario: horarioTexto, 
        classeId 
      });
      carregarDados(); 
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um problema ao salvar o horário.');
    }
  };

  const handleDeletar = async (id: string) => {
    try {
      await deleteHorario(id);
      carregarDados(); 
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível remover o horário.');
    }
  };

  const getSlot = (dia: number, aula: number) => {
    return horariosSalvos.find(h => h.diaSemana === dia && h.aula === aula);
  };

  if (loading || quantidadeAulas === 0) return <ActivityIndicator size="large" color="#007bff" style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <View style={styles.controles}>
        <TouchableOpacity style={styles.btnAcao} onPress={adicionarLinhaAula} activeOpacity={0.8}>
          <Text style={styles.btnTexto}>+ Adicionar Aula</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnAcao} onPress={removerUltimaLinhaAula} activeOpacity={0.8}>
          <Text style={styles.btnTexto}>- Remover Aula</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.grid}>
            
            <View style={styles.row}>
              <View style={[styles.cell, styles.headerCell]}>
                <Text style={styles.headerText}>Aula \ Dia</Text>
              </View>
              {DIAS_FIXOS.map(dia => (
                <View key={`header-${dia}`} style={[styles.cell, styles.headerCell]}>
                  <Text style={styles.headerText}>{NOMES_DIAS[dia] || `Dia ${dia}`}</Text>
                </View>
              ))}
            </View>

            {listaAulas.map(aula => (
              <View key={`row-${aula}`} style={styles.row}>
                <View style={[styles.cell, styles.headerCell, styles.rowHeaderContainer]}>
                  <Text style={styles.headerText}>{aula}ª Aula</Text>
                </View>
                
                {DIAS_FIXOS.map(dia => {
                  const slot = getSlot(dia, aula);
                  return (
                    <TouchableOpacity 
                      key={`cell-${dia}-${aula}`} 
                      style={[styles.cell, slot && styles.cellPreenchida]} 
                      onPress={() => abrirEdicao(dia, aula)}
                      activeOpacity={0.7}
                    >
                      {slot ? (
                        <>
                          <Text style={styles.turmaText}>{slot.classeId?.nome}</Text>
                          <Text style={styles.horaText}>{slot.horario}</Text>
                        </>
                      ) : (
                        <Text style={styles.vazioText}>+</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>
      </ScrollView>

      {modalVisible && (
        <ModalEditarHorario 
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSave={handleSalvar}
          onDelete={handleDeletar}
          diaSemanaText={NOMES_DIAS[celulaAtiva.dia] || `Dia ${celulaAtiva.dia}`} 
          diaSemana={celulaAtiva.dia}
          aula={celulaAtiva.aula}
          anosGerais={anosDisponiveis} 
          dadosAtuais={getSlot(celulaAtiva.dia, celulaAtiva.aula)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdfdfd', padding: 10 },
  controles: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, gap: 10 },
  btnAcao: { paddingVertical: 10, paddingHorizontal: 15, backgroundColor: '#007bff', borderRadius: 8, elevation: 2, flex: 1, alignItems: 'center' },
  btnTexto: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  grid: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, overflow: 'hidden' },
  row: { flexDirection: 'row' },
  cell: { width: 125, height: 80, borderWidth: 0.5, borderColor: '#eee', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  cellPreenchida: { backgroundColor: '#f0f8ff' },
  headerCell: { backgroundColor: '#e9ecef' },
  headerText: { fontWeight: 'bold', color: '#333', textAlign: 'center', fontSize: 13 },
  rowHeaderContainer: { justifyContent: 'center', alignItems: 'center' },
  turmaText: { fontSize: 18, fontWeight: 'bold', color: '#007bff' },
  horaText: { fontSize: 13, color: '#555', marginTop: 4 },
  vazioText: { fontSize: 24, color: '#d3d3d3', fontWeight: '300' }
});