import { create } from 'zustand';
import DeviceInfo from 'react-native-device-info'; 
import { saveToken as saveStorage, removeToken as removeStorage } from '../utils/authStorage';

interface UserData {
  nome: string;
  email: string;
  foto?: string;
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
}

export const useAppStore = create<AppState>((set) => ({
  userToken: null,
  user: null,
  idAnoSelecionado: null,
  idClasseSelecionada: null,
  appVersion: `${DeviceInfo.getVersion()} (${DeviceInfo.getBuildNumber()})`,

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
}));