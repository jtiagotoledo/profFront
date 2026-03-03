import axios from 'axios';
import Config from 'react-native-config';
import { getToken, removeToken } from '../utils/authStorage';

const api = axios.create({
    baseURL: Config.API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {

        if (error.response && error.response.status === 401) {
            console.warn("Sessão expirada. Token removido.");
            await removeToken();
            // TODO: ir para tela de login
        }
        return Promise.reject(error);
    }
);

export default api;