import { create } from 'zustand';
import { saveToken as saveStorage, removeToken as removeStorage } from '../utils/authStorage';

interface AppState {
  userToken: string | null;
  idAnoSelecionado: string | null;
  idClasseSelecionada: string | null;
  
  setToken: (token: string | null) => void;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  setAno: (id: string) => void;
  setClasse: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  userToken: null,
  idAnoSelecionado: null,
  idClasseSelecionada: null,

  setToken: (token) => set({ userToken: token }),

  login: async (token) => {
    await saveStorage(token);
    set({ userToken: token }); 
  },

  logout: async () => {
    await removeStorage();
    set({ userToken: null, idAnoSelecionado: null, idClasseSelecionada: null });
  },

  setAno: (id) => set({ idAnoSelecionado: id, idClasseSelecionada: null }),
  setClasse: (id) => set({ idClasseSelecionada: id }),
}));