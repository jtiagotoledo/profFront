import { useEffect, useState } from "react";
import { Text, View, StyleSheet, TouchableOpacity, Alert, TextInput, Image, Modal, ActivityIndicator } from "react-native";

import { AxiosError } from 'axios';
//import { useNavigation, NavigationProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { colors } from '../theme/colors'
import { validarEmail } from '../utils/validarSenhaEmail';
//import { loginUsuario, forgotPasswordAPI, loginGoogleAPI } from '../api/usersApi';
//import { useContextApp } from '../data/Provider';
import { configurarGoogle, handleGoogleSignIn } from '../services/googleAuthService';

type AuthStackParamList = {
    Login: undefined;
    Cadastro: undefined;
    CompletarPerfil: undefined;
};

interface DadosUsuario {
    email: string;
    senha: string;
}

interface LoginResponseData {
    status: string;
    message: string;
    token: string;
    data: {
        user: any;
    };
}

interface ServerErrorData {
    message?: string;
    error?: string;
}

function Login() {
    //const navigation = useNavigation<NavigationProp<AuthStackParamList>>();
    //const { setIsAuthenticated, setUsuario } = useContextApp();
    const [dadosUsuario, setDadosUsuario] = useState<DadosUsuario>({
        email: '',
        senha: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isSecure, setIsSecure] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [isResetLoading, setIsResetLoading] = useState(false);

    useEffect(() => {
        configurarGoogle();
    }, []);

    const handleChange = (name: string, value: string) => {
        setDadosUsuario(dadosAnteriores => ({
            ...dadosAnteriores,
            [name]: value,
        }));
    };

    const alternarIconeSenha = () => {
        setIsSecure(!isSecure);
    };

    const handleLogin = async () => {
        //verificação de algum campo vazio
        const valores = Object.values(dadosUsuario);
        const campoVazio = valores.some(value => !value || (typeof value === 'string' && value.trim() === ''));
        if (campoVazio) {
            Alert.alert('Preenchimento Obrigatório', 'Por favor, preencha todos os campos.');
            return;
        }

        //verifica se email está dentro do padrão esperado
        if (!validarEmail(dadosUsuario.email)) {
            Alert.alert('Erro no Email', 'O formato do e-mail é inválido.');
            return;
        }

        setIsLoading(true);

        try {
            //const response = await loginUsuario(dadosUsuario);
            //const responseData = response.data as LoginResponseData;

            //setUsuario(responseData.data.user);
            //setIsAuthenticated(true);
            //Alert.alert('Sucesso no login', responseData.message);
            setDadosUsuario({
                email: '',
                senha: '',
            });

        } catch (e) {
            //tratamento de erros
            const error = e as AxiosError;
            console.error('Erro no login', error);
            let mensagemErro = 'Erro ao se comunicar com o servidor. Tente novamente.';
            if (error.response) {
                const responseData = error.response.data as { message?: string, error?: string };
                mensagemErro = responseData.message || responseData.error || mensagemErro;
            } else if (error.request) {
                mensagemErro = 'Servidor inacessível. Verifique sua conexão ou o IP do backend.';
            }
            Alert.alert('Falha no login', mensagemErro);

        } finally {
            setIsLoading(false);
        }
    };

    const logarComGoogle = async () => {
        setIsLoading(true);
        const response = await handleGoogleSignIn();
        
        if (response && response.data) {
            try {
                const { idToken } = response.data;
                console.log('IDTOKEN',idToken);

                //const res = await loginGoogleAPI(idToken);
                //console.log('res servidor google',res);
                
                //setUsuario(res.data.data.user);

                /* if (!res.data.data.user.perfilCompleto) {
                    //navigation.navigate('CompletarPerfil');
                } else {
                    //setIsAuthenticated(true);
                } */

            } catch (error) {
                console.error('Erro na validação do Google:', error);
                Alert.alert('Erro', 'O servidor não conseguiu validar sua conta Google.');
            }
        }
        setIsLoading(false);
    };

    const handleResetSubmit = async () => {
        if (!resetEmail.trim() || !validarEmail(resetEmail)) {
            Alert.alert('Erro', 'Por favor, digite um e-mail válido.');
            return;
        }

        setIsResetLoading(true);

        try {
            //const response = await forgotPasswordAPI(resetEmail);

            //Alert.alert('Sucesso', response.message || 'Instruções enviadas para o email, se estiver cadastrado. Importante: olhe a caixa de SPAM');
            setModalVisible(false);

        } catch (e) {
            const error = e as AxiosError;
            const serverError = error.response?.data as ServerErrorData | undefined;

            const mensagem = serverError?.message || serverError?.error || 'Erro de conexão. Tente mais tarde.';
            Alert.alert('Erro', mensagem);
        } finally {
            setIsResetLoading(false);
            setResetEmail('');
        }
    };

    return (
        <View style={styles.container}>

            <Image
                source={require('../assets/logo.png')}
                style={styles.logo}
            />

            <Text style={styles.texto}>
                Entrar (Login)
            </Text>

            <TextInput
                placeholder="Email"
                placeholderTextColor={colors.lightText}
                value={dadosUsuario.email}
                onChangeText={(text) => handleChange('email', text)}
                style={[styles.input, styles.inputPadrao]}
                editable={!isLoading}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
            />
            <View style={styles.containerInput}>
                <TextInput
                    placeholder="Senha (password)"
                    placeholderTextColor={colors.lightText}
                    value={dadosUsuario.senha}
                    onChangeText={(text) => handleChange('senha', text)}
                    style={[styles.input, styles.inputSenha]}
                    editable={!isLoading}
                    secureTextEntry={isSecure}
                    autoCapitalize="none"
                    autoCorrect={false}
                />
                <TouchableOpacity
                    style={styles.botaoIcone}
                    onPress={alternarIconeSenha}
                    disabled={isLoading}
                >
                    <Icon name={isSecure ? 'eye-off' : 'eye'} size={24} color={colors.lightText} />
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                onPress={handleLogin}
                style={styles.botao}
                disabled={isLoading}
            >
                <Text style={styles.textoBotao}>
                    Fazer login
                </Text>
            </TouchableOpacity>

            

            <TouchableOpacity
                style={styles.link}
                onPress={() => null /* navigation.navigate('Cadastro') */}
            >
                <Text style={styles.textoPequeno}>
                    Não tem conta? <Text style={styles.textoDecorado}>Sign Up</Text>
                </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.linkRight}>
                <Text style={styles.textoPequenoLink}>Esqueci minha senha</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={logarComGoogle}
                style={[styles.botao, styles.botaoGoogle]}
                disabled={isLoading}
            >
                <View style={styles.contentGoogle}>
                    <Icon name="google" size={20} color={colors.darkText} />
                    <Text style={styles.textoBotao}> Entrar com Google</Text>
                </View>
            </TouchableOpacity>

            {isLoading && <Text style={styles.texto}>Aguardando resposta do servidor...</Text>}

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Redefinir Senha</Text>
                        <Text style={styles.modalSubtitle}>Digite seu e-mail para receber o link de redefinição.</Text>

                        <TextInput
                            placeholder="Email"
                            placeholderTextColor={colors.darkText}
                            value={resetEmail}
                            onChangeText={setResetEmail}
                            style={styles.modalInput}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={!isResetLoading}
                        />

                        <TouchableOpacity
                            onPress={handleResetSubmit}
                            style={styles.modalButton}
                            disabled={isResetLoading}
                        >
                            {isResetLoading ? (
                                <ActivityIndicator color={colors.darkText} />
                            ) : (
                                <Text style={styles.textoBotao}>Enviar Link</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                            style={styles.modalCancelButton}
                            disabled={isResetLoading}
                        >
                            <Text style={styles.modalCancelText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.darkText,
    },
    texto: {
        color: colors.lightText,
        fontSize: 18,
        margin: 16,
    },
    textoPequeno: {
        fontSize: 14,
        color: colors.lightText,
    },
    textoPequenoLink: {
        fontSize: 14,
        color: colors.lightText,
        textDecorationLine: 'underline',
        textAlign: 'center',
    },
    textoBotao: {
        color: colors.darkText,
        textAlign: 'center'
    },
    textoDecorado: {
        textDecorationLine: 'underline',
        fontWeight: 'bold',
    },
    botao: {
        backgroundColor: colors.secondary,
        padding: 10,
        borderRadius: 5,
        marginTop: 16,
        width: '90%',
        maxWidth: 300,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        color: colors.lightText,
        borderRadius: 5,
        padding: 12,
    },
    inputPadrao: {
        width: '90%',
        maxWidth: 300,
        marginBottom: 16,
    },
    inputSenha: {
        flex: 1,
        paddingRight: 50,
    },
    containerInput: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '90%',
        maxWidth: 300,
        marginBottom: 0,
    },
    botaoIcone: {
        position: 'absolute',
        right: 10,
        padding: 10,
    },
    logo: {
        width: 120,
        height: 120,
        marginBottom: 30,
    },
    link: {
        marginTop: 50,
    },
    linkRight: {
        width: '90%',
        maxWidth: 300,
        marginTop: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '85%',
        maxWidth: 300,
        backgroundColor: colors.lightText,
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.darkText,
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 14,
        color: 'gray',
        marginBottom: 15,
        textAlign: 'center',
    },
    modalInput: {
        width: '100%',
        height: 45,
        borderColor: colors.darkText,
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 20,
        color: colors.darkText,
        textAlign: 'center',
    },
    modalButton: {
        backgroundColor: colors.secondary,
        padding: 10,
        borderRadius: 5,
        width: '100%',
        alignItems: 'center',
        marginBottom: 10,
    },
    modalCancelButton: {
        padding: 5,
    },
    modalCancelText: {
        color: 'gray',
        fontSize: 14,
    },
    botaoGoogle: {
        backgroundColor: colors.secondary,
        marginTop: 50,
        width: '90%',
        maxWidth: 300,
    },
    contentGoogle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default Login;