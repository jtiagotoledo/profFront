import { useEffect } from 'react';
import * as IAP from 'react-native-iap';
import { Alert } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { iapService } from '../services/iapService';

export const useIAPManager = () => {
    const refreshUser = useAppStore((state) => state.refreshUser);

    useEffect(() => {
        const purchaseUpdateSubscription = IAP.purchaseUpdatedListener(async (purchase) => {
            const token = purchase.purchaseToken;
            if (token) {
                console.log("💰 Token Capturado:", token);

                // AQUI VOCÊ CHAMARIA SEU BACKEND PARA VALIDAR
                // await validarNoBackend(token);

                // Atualiza a Store para refletir o Premium
                await refreshUser();

                Alert.alert("Sucesso!", "Sua conta agora é Premium!");
                await IAP.finishTransaction({ purchase });
            }
        });

        const purchaseErrorSubscription = IAP.purchaseErrorListener((error) => {
            console.warn('Erro na compra:', error);
        });

        iapService.init();

        return () => {
            purchaseUpdateSubscription.remove();
            purchaseErrorSubscription.remove();
        };
    }, [refreshUser]);

    const comprarIlimitado = async () => {
        try {
            const products = await iapService.getProducts();

            if (products && products.length > 0) {
                await iapService.requestPurchase();
            } else {
                Alert.alert("Erro", "Produto 'ilimitado' não encontrado na Google Play.");
            }
        } catch (err: any) {
            Alert.alert("Erro", err.message);
        }
    };

    return { comprarIlimitado };
};