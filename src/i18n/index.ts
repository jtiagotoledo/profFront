import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';

import pt from './locales/pt.json';

const resources = {
  pt: { translation: pt }
};

const bestLanguage = RNLocalize.findBestLanguageTag(Object.keys(resources));
console.log('bestLanguage',bestLanguage);

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: bestLanguage?.languageTag || 'pt',
    fallbackLng: 'pt',
    interpolation: {
      escapeValue: false, 
    },
  });

export default i18n;