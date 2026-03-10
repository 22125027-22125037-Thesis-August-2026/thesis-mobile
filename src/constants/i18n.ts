import { en } from './locales/en';
import { vi } from './locales/vi';

export const TRANSLATIONS = {
  vi,
  en,
} as const;

export type Locale = keyof typeof TRANSLATIONS;
export type TranslationKey = keyof (typeof TRANSLATIONS)['vi'];
type TranslationParams = Record<string, string | number>;

export const DEFAULT_LOCALE: Locale = 'vi';

export const t = (
  key: TranslationKey,
  params?: TranslationParams,
  locale: Locale = DEFAULT_LOCALE,
): string => {
  const template = TRANSLATIONS[locale][key];

  if (!params) {
    return template;
  }

  return Object.entries(params).reduce((result, [paramKey, value]) => {
    return result.replaceAll(`{{${paramKey}}}`, String(value));
  }, template);
};
