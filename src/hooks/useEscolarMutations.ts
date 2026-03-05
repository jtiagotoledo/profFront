import { useMutation, useQueryClient } from '@tanstack/react-query';
import { criarAnoAPI, criarClasseAPI, criarAlunoAPI } from '../services/dataApi';

export const useCadastrosEscolares = () => {
    const queryClient = useQueryClient();

    const mutationAno = useMutation({
        mutationFn: criarAnoAPI,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['anos'] }),
    });

    const mutationClasse = useMutation({
        mutationFn: ({ nome, periodo, anoLetivoId }: { nome: string; periodo: string; anoLetivoId: string }) =>
            criarClasseAPI(nome, periodo, anoLetivoId),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['classes'] });
        },
    });

    const mutationAluno = useMutation({
    mutationFn: ({ nome, numeroChamada, classeId }: { nome: string; numeroChamada: number; classeId: string }) => 
        criarAlunoAPI(nome, numeroChamada, classeId),
    
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['alunos'] });
    },
});

    return { mutationAno, mutationClasse, mutationAluno };
};