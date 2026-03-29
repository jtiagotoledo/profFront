import { create } from 'zustand';
import DeviceInfo from 'react-native-device-info'; 
import { saveToken as saveStorage, removeToken as removeStorage } from '../utils/authStorage';

interface UserData {
  _id: string; 
  nome: string;
  email: string;
  fotoPerfil?: string;
  isPremium: boolean; 
}

interface AppState {
  userToken: string | null;
  user: UserData | null;
  idAnoSelecionado: string | null;
  idClasseSelecionada: string | null;
  appVersion: string; 
  
  setToken: (token: string | null) => void;
  login: (token: string, userData: UserData) => Promise<void>;
  logout: () => Promise<void>;
  setAno: (id: string | null) => void;
  setClasse: (id: string | null) => void;
  setUser: (userData: UserData | null) => void;
  refreshUser: () => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  userToken: null,
  user: null,
  idAnoSelecionado: null,
  idClasseSelecionada: null,
  appVersion: `${DeviceInfo.getVersion()} (${DeviceInfo.getBuildNumber()})`,

  setUser: (userData) => set({ user: userData }),
  setToken: (token) => set({ userToken: token }),

  login: async (token, userData) => {
    await saveStorage(token);
    set({ userToken: token, user: userData }); 
  },

  logout: async () => {
    await removeStorage();
    set({ userToken: null, user: null, idAnoSelecionado: null, idClasseSelecionada: null });
  },

  setAno: (id) => set({ idAnoSelecionado: id, idClasseSelecionada: null }),
  setClasse: (id) => set({ idClasseSelecionada: id }),

  refreshUser: async () => {
    try {
      const { getMeAPI } = await import('../services/usersApi');
      const updatedUser = await getMeAPI();
      set({ user: updatedUser });
    } catch (error) {
      console.error("Erro ao sincronizar perfil:", error);
    }
  },
}));