import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export const useAlunos = (classeId: string | null) => {
  return useQuery({
    queryKey: ['alunos', classeId],
    queryFn: async () => {
      if (!classeId) return [];
      const { data } = await api.get(`/alunos/classe/${classeId}`);
      return data.data; 
    },
    enabled: !!classeId,
  });
};