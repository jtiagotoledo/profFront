import { log } from 'console';
import api from './api'

// Login com Google
export const loginGoogleAPI = async (idToken) => {
    const response = await api.post('/auth/google', { idToken });
    console.log('response', response);
    
    /* if (response.data && response.data.token) {
        await setToken(response.data.token);
    } */
    
    return response;
};