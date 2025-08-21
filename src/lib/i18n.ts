import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'ro', // Default to Romanian
    debug: false,
    
    // Language detection options
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    // Namespace configuration
    defaultNS: 'common',
    ns: ['common', 'navigation', 'auth', 'admin'],

    interpolation: {
      escapeValue: false, // React already escapes
    },

    // Resource loading
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },

    resources: {
      en: {
        common: require('../../public/locales/en/common.json'),
        navigation: require('../../public/locales/en/navigation.json'),
        auth: require('../../public/locales/en/auth.json'),
        admin: require('../../public/locales/en/admin.json'),
      },
      ro: {
        common: require('../../public/locales/ro/common.json'),
        navigation: require('../../public/locales/ro/navigation.json'),
        auth: require('../../public/locales/ro/auth.json'),
        admin: require('../../public/locales/ro/admin.json'),
      },
    },
  });

export default i18n;