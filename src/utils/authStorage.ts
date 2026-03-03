import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@ProfApp:token';

export const saveToken = async (token: string) => {
    try {
        await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (e) {
        console.error('Erro ao salvar o token', e);
    }
};

export const getToken = async () => {
    return await AsyncStorage.getItem(TOKEN_KEY);
};

export const removeToken = async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
};