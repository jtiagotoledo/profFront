import api from './api'
import { saveToken } from '../utils/authStorage';

// Login com Google
export const loginGoogleAPI = async (idToken) => {
    const response = await api.post('/auth/google', { idToken });
    console.log('response', response.data.token);

    if (response.data && response.data.token) {
        await saveToken(response.data.token);
    }

    return response;
};