import * as IAP from 'react-native-iap';
import { Platform } from 'react-native';

const skus = Platform.select({
  android: ['ilimitado'],
  ios: ['ilimitado_ios'],
}) as string[];

export const iapService = {
  init: async () => {
    try {
      await IAP.initConnection();
      console.log("✅ IAP: Conexão inicializada");
    } catch (err) {
      console.error("IAP: Erro ao inicializar", err);
    }
  },

  getProducts: async () => {
    try {
      const products = await IAP.fetchProducts({ skus });
      return products;
    } catch (err) {
      console.error("IAP: Erro ao buscar produtos", err);
      return [];
    }
  },

  requestPurchase: async () => {
    try {
      await (IAP as any).requestPurchase({
        request: {
          google: { skus: [skus[0]] }
        },
        type: 'in-app'
      });
    } catch (err: any) {
      if (err.code !== 'E_USER_CANCELLED') {
        throw err;
      }
    }
  },

  getProductPrice: async (): Promise<string | null> => {
    try {
      const products = await IAP.fetchProducts({ skus });

      if (products && products.length > 0) {
        const product = products[0];

        const price =
          (product as any).localizedPrice ||
          (product as any).oneTimePurchaseOfferDetails?.formattedPrice ||
          (product as any).price ||
          null;

        console.log("💰 Preço detectado:", price);
        return price;
      }
      return null;
    } catch (err) {
      console.error("IAP: Erro ao buscar preço", err);
      return null;
    }
  },

  limparComprasTestes: async () => {
    try {
      await IAP.initConnection();
      const purchases = await IAP.getAvailablePurchases();

      if (purchases.length > 0) {
        for (const purchase of purchases) {
          await IAP.finishTransaction({ purchase, isConsumable: true });
        }
        console.log("✅ Compras limpas! Tente comprar novamente.");
      }
    } catch (err) {
      console.error("Erro ao limpar compras", err);
    }
  }
};