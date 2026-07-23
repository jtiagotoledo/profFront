import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { getClassesPorAnoAPI } from '../services/dataApi';

interface ModalEditarHorarioProps {
  visible: boolean;
  onClose: () => void;
  onSave: (horario: string, classeId: string) => void;
  onDelete: (id: string) => void;
  diaSemanaText: string;
  diaSemana: number;
  aula: number;
  anosGerais: any[]; 
  dadosAtuais?: any; 
}

export const ModalEditarHorario = ({ 
  visible, 
  onClose, 
  onSave, 
  onDelete,
  diaSemanaText,
  aula, 
  anosGerais, 
  dadosAtuais 
}: ModalEditarHorarioProps) => {
  const [horario, setHorario] = useState('');
  
  const [anoSelecionado, setAnoSelecionado] = useState('');
  const [classesDoAno, setClassesDoAno] = useState<any[]>([]);
  const [classeSelecionada, setClasseSelecionada] = useState('');
  const [loadingClasses, setLoadingClasses] = useState(false);

  useEffect(() => {
    setHorario(dadosAtuais?.horario || '');
    
    if (dadosAtuais?.classeId) {
      setAnoSelecionado(dadosAtuais.classeId.anoLetivo || '');
      setClasseSelecionada(dadosAtuais.classeId._id || '');
    } else {
      setAnoSelecionado('');
      setClasseSelecionada('');
    }
  }, [dadosAtuais, visible]);

  useEffect(() => {
    const fetchClasses = async () => {
      if (!anoSelecionado) {
        setClassesDoAno([]);
        return;
      }
      
      setLoadingClasses(true);
      try {
        const turmas = await getClassesPorAnoAPI(anoSelecionado);
        setClassesDoAno(turmas);
        
        const classeAindaExiste = turmas.some((t: any) => t._id === classeSelecionada);
        if (!classeAindaExiste) {
          setClasseSelecionada('');
        }
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível carregar as turmas deste ano.');
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchClasses();
  }, [anoSelecionado]);

  const handleSave = () => {
    if (horario && classeSelecionada) {
      onSave(horario, classeSelecionada);
      onClose();
    } else {
      Alert.alert('Atenção', 'Preencha o horário e selecione uma turma.');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Excluir Aula',
      'Tem certeza que deseja remover esta aula da grade?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: () => {
            onDelete(dadosAtuais._id);
            onClose();
          }
        }
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Título mostrando a aula e o dia da semana amigável */}
          <Text style={styles.title}>Editar {aula}ª Aula - {diaSemanaText}</Text>
          
          <Text style={styles.label}>Horário (ex: 07:10 - 08:00)</Text>
          <TextInput 
            style={styles.input} 
            value={horario} 
            onChangeText={setHorario} 
            placeholder="00:00 - 00:00" 
          />

          <Text style={styles.label}>1. Selecione o Ano Letivo</Text>
          <View style={styles.chipContainer}>
            {anosGerais.map((ano) => (
              <TouchableOpacity 
                key={ano._id} 
                style={[styles.chipBtn, anoSelecionado === ano._id && styles.chipBtnAtiva]}
                onPress={() => setAnoSelecionado(ano._id)}
              >
                <Text style={{ color: anoSelecionado === ano._id ? '#fff' : '#333' }}>
                  {ano.rotulo}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>2. Selecione a Turma</Text>
          {loadingClasses ? (
            <ActivityIndicator size="small" color="#007bff" style={{ marginVertical: 10 }} />
          ) : (
            <ScrollView style={{ maxHeight: 120 }}>
              <View style={styles.chipContainer}>
                {classesDoAno.length > 0 ? (
                  classesDoAno.map((classe) => (
                    <TouchableOpacity 
                      key={classe._id} 
                      style={[styles.chipBtn, classeSelecionada === classe._id && styles.chipBtnAtiva]}
                      onPress={() => setClasseSelecionada(classe._id)}
                    >
                      <Text style={{ color: classeSelecionada === classe._id ? '#fff' : '#333' }}>
                        {classe.nome}
                      </Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.hintText}>
                    {anoSelecionado ? 'Nenhuma turma encontrada.' : 'Selecione um ano primeiro.'}
                  </Text>
                )}
              </View>
            </ScrollView>
          )}

          <View style={styles.row}>
            <TouchableOpacity onPress={onClose} style={styles.btnCancelar}>
              <Text style={styles.textCancelar}>Cancelar</Text>
            </TouchableOpacity>

            {dadosAtuais?._id && (
              <TouchableOpacity onPress={handleDelete} style={styles.btnExcluir}>
                <Text style={styles.textExcluir}>Excluir</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={handleSave} style={styles.btnSalvar}>
              <Text style={styles.textSalvar}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  modalContainer: { backgroundColor: '#fff', padding: 20, borderRadius: 12, elevation: 5 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center', color: '#1F2937' },
  label: { fontSize: 14, fontWeight: '600', color: '#444', marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 10, marginTop: 5, fontSize: 16 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 5 },
  chipBtn: { paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, backgroundColor: '#f9f9f9' },
  chipBtnAtiva: { backgroundColor: '#007bff', borderColor: '#007bff' },
  hintText: { fontSize: 13, color: '#888', fontStyle: 'italic', marginVertical: 5 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 25 },
  btnCancelar: { padding: 12, borderRadius: 8, backgroundColor: '#e0e0e0', flex: 1, marginRight: 5, alignItems: 'center' },
  btnExcluir: { padding: 12, borderRadius: 8, backgroundColor: '#ffdde1', flex: 1, marginHorizontal: 5, alignItems: 'center' },
  btnSalvar: { padding: 12, borderRadius: 8, backgroundColor: '#007bff', flex: 1, marginLeft: 5, alignItems: 'center' },
  textCancelar: { color: '#333', fontWeight: 'bold' },
  textExcluir: { color: '#d9534f', fontWeight: 'bold' },
  textSalvar: { color: '#fff', fontWeight: 'bold' }
});