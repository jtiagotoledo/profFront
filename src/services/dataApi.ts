import api from './api';

// Busca todos os anos do professor
export const getAnosAPI = async () => {
    const response = await api.get('/anos');
    return response.data.data; 
};

// Busca classes filtradas por Ano
export const getClassesPorAnoAPI = async (anoId: string) => {
    const response = await api.get(`/classes/ano/${anoId}`);
    return response.data.data;
};

// Busca alunos filtrados por Classe (Já inclui notas/frequência no seu backend)
export const getAlunosPorClasseAPI = async (classeId: string) => {
    const response = await api.get(`/alunos/classe/${classeId}`);
    return response.data.data;
};