import { GoogleSignin, statusCodes, SignInResponse, isSuccessResponse } from '@react-native-google-signin/google-signin';

export const configurarGoogle = () => {
    GoogleSignin.configure({
        webClientId: process.env.GOOGLE_WEB_CLIENT_ID, 
    });
};

export const handleGoogleSignIn = async (): Promise<SignInResponse> => {
    try {
        await GoogleSignin.hasPlayServices();
        const response = await GoogleSignin.signIn();
        
        if (isSuccessResponse(response)) {
            return response;
        }
        throw new Error('SIGN_IN_FAILED');
    } catch (error: any) {
        if (error.code === statusCodes.SIGN_IN_CANCELLED) throw new Error('CANCELADO');
        if (error.code === statusCodes.IN_PROGRESS) throw new Error('EM_ANDAMENTO');
        throw error;
    }
};