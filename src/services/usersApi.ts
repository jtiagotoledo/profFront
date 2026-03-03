import api from './api'

interface LoginResponse {
  status: string;
  token: string; 
}

// Login com Google
export const loginGoogleAPI = async (idToken: string): Promise<LoginResponse> => {
    const response = await api.post('/auth/google', { idToken });
    return response.data; 
};