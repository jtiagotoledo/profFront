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
  }
};