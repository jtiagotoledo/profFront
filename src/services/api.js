import axios from 'axios';
import Config from 'react-native-config';

console.log("Tentando conectar em:", Config.API_URL);
const api = axios.create({
    baseURL: Config.API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;