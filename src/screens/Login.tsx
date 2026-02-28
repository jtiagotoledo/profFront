import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet, TouchableOpacity, Alert, Image, ActivityIndicator, StatusBar, Platform } from "react-native";

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DeviceInfo from 'react-native-device-info';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../theme/colors';
import { configurarGoogle, handleGoogleSignIn } from '../services/googleAuthService';

function Login() {
    const insets = useSafeAreaInsets();
    const versaoDoApp = DeviceInfo.getVersion();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        configurarGoogle();
    }, []);

    const logarComGoogle = async () => {
        setIsLoading(true);
        try {
            const response = await handleGoogleSignIn();

            if (response && response.data) {
                const { idToken, user } = response.data;
                console.log("Sucesso ao logar:", user.email);
            }

        } catch (error) {
            console.error("Erro capturado:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={[
            styles.container,
            {
                paddingTop: insets.top, 
                paddingBottom: insets.bottom 
            }
        ]}>
            <StatusBar
                barStyle="light-content"
                backgroundColor={colors.primary}
                translucent={false}
            />

            <View style={styles.content}>
                <Image
                    source={require('../assets/logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />

                <Text style={styles.titulo}>Bem-vindo</Text>
                <Text style={styles.subtitulo}>Acesse sua conta para gerenciar suas classes.</Text>

                <TouchableOpacity
                    onPress={logarComGoogle}
                    style={[styles.botaoGoogle, isLoading && styles.botaoDisabled]}
                    disabled={isLoading}
                    activeOpacity={0.7}
                >
                    {isLoading ? (
                        <ActivityIndicator color={colors.lightText} />
                    ) : (
                        <View style={styles.containerInternoBotao}>
                            <Icon name="google" size={22} color={colors.lightText} />
                            <Text style={styles.textoBotao}>Entrar com Google</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            <View style={styles.footer}>
                <Text style={styles.textoRodape}>v{versaoDoApp}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.primary,
        paddingTop: Platform.OS === 'ios' ? 50 : 0,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    logo: {
        width: 140,
        height: 140,
        marginBottom: 30,
    },
    titulo: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.lightText,
        marginBottom: 10,
    },
    subtitulo: {
        fontSize: 14,
        color: colors.lightText,
        textAlign: 'center',
        opacity: 0.8,
        marginBottom: 50,
        lineHeight: 24,
    },
    botaoGoogle: {
        backgroundColor: colors.secondary,
        height: 56,
        borderRadius: 8,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    botaoDisabled: {
        opacity: 0.6,
    },
    containerInternoBotao: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    textoBotao: {
        color: colors.lightText,
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 15,
    },
    footer: {
        paddingBottom: 20,
    },
    textoRodape: {
        color: colors.lightText,
        fontSize: 12,
        textAlign: 'center',
        opacity: 0.5,
    }
});

export default Login;