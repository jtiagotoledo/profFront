import { useQuery } from '@tanstack/react-query';
import { getAnosAPI, getClassesPorAnoAPI, getAlunosPorClasseAPI } from '../services/dataApi';

export const useAnos = () => {
    return useQuery({
        queryKey: ['anos'],
        queryFn: getAnosAPI,
        staleTime: Infinity, 
    });
};

export const useClasses = (anoId: string | null) => {
    return useQuery({
        queryKey: ['classes', anoId],
        queryFn: () => getClassesPorAnoAPI(anoId!),
        enabled: !!anoId,
        staleTime: 1000 * 60 * 30, 
    });
};

export const useAlunos = (classeId: string | null) => {
    return useQuery({
        queryKey: ['alunos', classeId],
        queryFn: () => getAlunosPorClasseAPI(classeId!),
        enabled: !!classeId,
    });
};