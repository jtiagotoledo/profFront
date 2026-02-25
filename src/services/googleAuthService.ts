import { GoogleSignin, statusCodes, SignInResponse, isSuccessResponse } from '@react-native-google-signin/google-signin';

export const configurarGoogle = () => {
    GoogleSignin.configure({
        webClientId: '629200846068-7fdghr6qi3glmqnnkifd804qv1eumdbq.apps.googleusercontent.com',
        offlineAccess: true,
    });
};

export const handleGoogleSignIn = async (): Promise<SignInResponse | null> => {
    try {
        await GoogleSignin.hasPlayServices();
        const response = await GoogleSignin.signIn();

        if (isSuccessResponse(response)) {
            return response;
        }

        return null;
    } catch (error: any) {
        if (error.code === statusCodes.SIGN_IN_CANCELLED) {
            console.log('Usuário cancelou o login');
        } else if (error.code === statusCodes.IN_PROGRESS) {
            console.log('Login já em progresso');
        } else {
            console.error('Erro no Google Sign-In:', error);
        }
        return null;
    }
};