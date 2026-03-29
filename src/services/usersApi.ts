import api from './api'

interface UserData {
  _id: string;
  nome: string;
  email: string;
  fotoPerfil?: string;
  isPremium: boolean; 
}

interface LoginResponse {
  status: string;
  token: string;
  user: UserData;
}

export const getMeAPI = async () => {
  const response = await api.get('/auth/me'); 
  return response.data.data; 
};

export const loginGoogleAPI = async (idToken: string): Promise<LoginResponse> => {
    const response = await api.post('/auth/google', { idToken });
    return response.data; 
};

export const validarAssinaturaAPI = async (purchaseToken: string, productId: string) => {
  const response = await api.post('/pagamentos/verificar/', {
    purchaseToken,
    productId
  });
  return response.data;
};