import api from './api';

export const criarAnoAPI = async (rotulo: string) => {
  const response = await api.post('/anos', { rotulo });
  return response.data; 
};

export const getAnosAPI = async () => {
    const response = await api.get('/anos');
    return response.data.data; 
};

export const criarClasseAPI = async (nome: string, periodo: string, anoLetivoId: string) => {
  const response = await api.post('/classes', { nome, periodo, anoLetivoId });
  return response.data;
};

export const getClassesPorAnoAPI = async (anoId: string) => {
    const response = await api.get(`/classes/ano/${anoId}`);
    return response.data.data;
};

export const criarAlunoAPI = async (nome: string, numeroChamada: number, classeId: string) => {
  const response = await api.post('/alunos', { nome, numeroChamada, classeId });
  return response.data.data;
};

export const getAlunosPorClasseAPI = async (classeId: string) => {
    const response = await api.get(`/alunos/classe/${classeId}`);
    return response.data.data;
};

export const updateNotaAPI = async (alunoId: string, dadosProva: { titulo: string, valor: number, peso: number }) => {
  const response = await api.patch(`/alunos/${alunoId}/nota`, dadosProva);
  return response.data;
};

export const updateFrequenciaAPI = async (alunoId: string, presente: boolean) => {
  const dataHoje = new Date().toISOString().split('T')[0]; 

  const response = await api.patch(`/alunos/${alunoId}/frequencia`, { 
    data: dataHoje, 
    presente: presente 
  });
  
  return response.data;
};