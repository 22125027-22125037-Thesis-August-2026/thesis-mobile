import AsyncStorage from '@react-native-async-storage/async-storage';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import vi from './vi.json';

export const resources = {
  vi: { translation: vi },
  en: { translation: en },
} as const;

export type AppLanguage = keyof typeof resources;

const LANGUAGE_STORAGE_KEY = 'app_language';
export const DEFAULT_LANGUAGE: AppLanguage = 'vi';

void i18next.use(initReactI18next).init({
  resources,
  lng: DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,
  compatibilityJSON: 'v4',
  interpolation: {
    escapeValue: false,
  },
});

void AsyncStorage.getItem(LANGUAGE_STORAGE_KEY).then(storedLanguage => {
  if (storedLanguage === 'vi' || storedLanguage === 'en') {
    void i18next.changeLanguage(storedLanguage);
  }
});

export const setAppLanguage = async (language: AppLanguage): Promise<void> => {
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  await i18next.changeLanguage(language);
};

export default i18next;
