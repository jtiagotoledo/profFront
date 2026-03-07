import { useMutation, useQueryClient } from '@tanstack/react-query';
import { criarAnoAPI, criarClasseAPI, criarAlunoAPI, atualizarAnoAPI, deletarAnoAPI,  atualizarClasseAPI, deletarClasseAPI,  atualizarAlunoAPI, deletarAlunoAPI } from '../services/dataApi';

export const useCadastrosEscolares = () => {
    const queryClient = useQueryClient();

    // --- MUTAÇÕES DE ANO ---
    const mutationAno = useMutation({
        mutationFn: criarAnoAPI,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['anos'] }),
    });
    const mutationAtualizarAno = useMutation({
        mutationFn: ({ id, rotulo }: { id: string; rotulo: string }) => atualizarAnoAPI(id, rotulo),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['anos'] }),
    });

    const mutationDeletarAno = useMutation({
        mutationFn: (id: string) => deletarAnoAPI(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['anos'] }),
    });

    // --- MUTAÇÕES DE CLASSE ---
    const mutationClasse = useMutation({
        mutationFn: ({ nome, anoLetivoId }: { nome: string; anoLetivoId: string }) =>
            criarClasseAPI(nome, anoLetivoId),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['classes'] });
        },
    });
    const mutationAtualizarClasse = useMutation({
        mutationFn: ({ id, nome }: { id: string; nome: string }) => atualizarClasseAPI(id, nome),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['classes'] }),
    });

    const mutationDeletarClasse = useMutation({
        mutationFn: (id: string) => deletarClasseAPI(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['classes'] }),
    });

    // --- MUTAÇÕES DE ALUNO ---
    const mutationAluno = useMutation({
        mutationFn: ({ nome, numeroChamada, classeId }: { nome: string; numeroChamada: number; classeId: string }) =>
            criarAlunoAPI(nome, numeroChamada, classeId),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['alunos'] });
        },
    });
    const mutationAtualizarAluno = useMutation({
        mutationFn: ({ id, dados }: { id: string; dados: any }) => atualizarAlunoAPI(id, dados),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alunos'] }),
    });

    const mutationDeletarAluno = useMutation({
        mutationFn: (id: string) => deletarAlunoAPI(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alunos'] }),
    });

    return {
    mutationAno,
    mutationAtualizarAno,
    mutationDeletarAno,
    mutationClasse,
    mutationAtualizarClasse,
    mutationDeletarClasse,
    mutationAluno,
    mutationAtualizarAluno,
    mutationDeletarAluno,
  };
};