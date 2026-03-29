import { useEffect } from 'react';
import { Alert } from 'react-native';
import * as IAP from 'react-native-iap';
import { useAppStore } from '../store/useAppStore';
import { iapService } from '../services/iapService';
import { validarAssinaturaAPI } from '../services/usersApi';

export const useIAPManager = () => {
    const refreshUser = useAppStore((state) => state.refreshUser);

    useEffect(() => {
        iapService.init();

        const purchaseUpdateSubscription = IAP.purchaseUpdatedListener(async (purchase) => {
            const token = purchase.purchaseToken;

            if (token) {
                try {
                    console.log("📡 Enviando token para o servidor Linux...", token, purchase.productId);

                    const result = await validarAssinaturaAPI(token, purchase.productId);

                    if (result.status === 'sucesso') {
                        await refreshUser();

                        await IAP.finishTransaction({ purchase });

                        console.log("✅ Transação finalizada e Premium ativado!");
                        Alert.alert("Sucesso!", "Sua conta agora é Premium e os limites foram liberados!");
                    } else {
                        throw new Error("O servidor recusou a validação do recibo.");
                    }
                } catch (error: any) {
                    console.error("❌ Erro na validação IAP:", error.response?.data || error.message);

                    Alert.alert(
                        "Houve um problema",
                        "O pagamento foi processado, mas não conseguimos liberar seu acesso agora. Tente reiniciar o app ou clique em 'Restaurar Compras' no perfil."
                    );
                }
            }
        });

        const purchaseErrorSubscription = IAP.purchaseErrorListener((error) => {
            if (error.code !== IAP.ErrorCode.UserCancelled) {
                console.warn('Erro na compra:', error);
                Alert.alert("Erro", "Não foi possível completar a transação.");
            } else {
                console.log("Foco: O professor cancelou a compra.");
            }
        });

        return () => {
            purchaseUpdateSubscription.remove();
            purchaseErrorSubscription.remove();
        };
    }, [refreshUser]);

    const comprarIlimitado = async () => {
        try {
            const products = await iapService.getProducts();

            if (products && products.length > 0) {
                console.log("🛒 Abrindo janela de compra do Google Play...");
                await iapService.requestPurchase();
            } else {
                Alert.alert("Erro", "Produto 'ilimitado' não encontrado na Google Play.");
            }
        } catch (err: any) {
            console.error("Erro ao iniciar compra:", err);
            Alert.alert("Erro", "Falha ao iniciar o processo de compra.");
        }
    };

    return { comprarIlimitado };
};