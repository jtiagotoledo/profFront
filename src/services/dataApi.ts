import api from './api';

export const criarAnoAPI = async (rotulo: string) => {
  const response = await api.post('/anos', { rotulo });
  return response.data;
};

export const getAnosAPI = async () => {
  const response = await api.get('/anos');
  return response.data.data;
};

export const atualizarAnoAPI = async (id: string, rotulo: string) => {
  const response = await api.patch(`/anos/${id}`, { rotulo });
  return response.data;
};

export const deletarAnoAPI = async (id: string) => {
  const response = await api.delete(`/anos/${id}`);
  return response.data;
};

export const criarClasseAPI = async (nome: string, anoLetivoId: string) => {
  const response = await api.post('/classes', { nome, anoLetivoId });
  return response.data;
};

export const getClassesPorAnoAPI = async (anoId: string) => {
  const response = await api.get(`/classes/ano/${anoId}`);
  return response.data.data;
};

export const atualizarClasseAPI = async (id: string, nome: string) => {
  const response = await api.patch(`/classes/${id}`, { nome });
  return response.data;
};

export const deletarClasseAPI = async (id: string) => {
  const response = await api.delete(`/classes/${id}`);
  return response.data;
};

export const criarAlunoAPI = async (nome: string, numeroChamada: number, classeId: string) => {
  const response = await api.post('/alunos', { nome, numeroChamada, classeId });
  return response.data.data;
};

export const getAlunosPorClasseAPI = async (classeId: string) => {
  const response = await api.get(`/alunos/classe/${classeId}`);
  return response.data.data;
};

export const atualizarAlunoAPI = async (id: string, dados: { nome?: string; numeroChamada?: number; ativo?: boolean }) => {
  const response = await api.patch(`/alunos/${id}`, dados);
  return response.data;
};

export const deletarAlunoAPI = async (id: string) => {
  const response = await api.delete(`/alunos/${id}`);
  return response.data;
};

export const updateFrequenciaAPI = async (alunoId: string, data: string, presente: boolean) => {

  const response = await api.patch(`/alunos/${alunoId}/frequencia`, {
    data: data,
    presente: presente
  });

  return response.data;
};

export const confirmarPresencaTotalAPI = async (classeId: string, data: string) => {
    const response = await api.patch('/classes/confirmar-dia', { classeId, data });
    return response.data;
};

export const updateNotaAPI = async (alunoId: string, dadosProva: { titulo: string, valor: number, peso: number }) => {
  const response = await api.patch(`/alunos/${alunoId}/nota`, dadosProva);
  return response.data;
};

