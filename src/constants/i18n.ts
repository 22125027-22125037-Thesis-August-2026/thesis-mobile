import { en } from './locales/en';
import { vi } from './locales/vi';

/**
 * Flatten nested translation objects into dot-notation keys
 * e.g., { food: { entry: { title: 'Title' } } } -> { 'food.entry.title': 'Title' }
 */
const flattenKeys = (
  obj: Record<string, any>,
  prefix = '',
): Record<string, string> => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'string') {
      acc[newKey] = value;
    } else if (typeof value === 'object' && value !== null) {
      Object.assign(acc, flattenKeys(value, newKey));
    }

    return acc;
  }, {} as Record<string, string>);
};

const viFlatMap = flattenKeys(vi);
const enFlatMap = flattenKeys(en);

export const TRANSLATIONS = {
  vi: viFlatMap,
  en: enFlatMap,
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

  if (!template) {
    console.warn(`[i18n] Missing translation key: ${String(key)}`);
    return String(key);
  }

  if (!params) {
    return template;
  }

  return Object.entries(params).reduce((result, [paramKey, value]) => {
    return result.replaceAll(`{{${paramKey}}}`, String(value));
  }, template);
};
