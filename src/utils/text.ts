// Lowercase-only map: normalizeVietnamese() always lowercases before applying this, so
// uppercase accented variants are never needed here.
const VIETNAMESE_DIACRITIC_MAP: [RegExp, string][] = [
  [/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a'],
  [/[èéẹẻẽêềếệểễ]/g, 'e'],
  [/[ìíịỉĩ]/g, 'i'],
  [/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o'],
  [/[ùúụủũưừứựửữ]/g, 'u'],
  [/[ỳýỵỷỹ]/g, 'y'],
  [/đ/g, 'd'],
];

/** Regex-based fallback for stripping Vietnamese diacritics, used when `String.prototype.normalize`
 * is unavailable or a no-op (some Hermes release builds ship without full ICU support). */
const stripDiacriticsFallback = (value: string): string =>
  VIETNAMESE_DIACRITIC_MAP.reduce(
    (acc, [pattern, replacement]) => acc.replace(pattern, replacement),
    value,
  );

/**
 * Normalizes Vietnamese text for accent-insensitive matching: lowercases, trims, and strips
 * diacritics so "Buồn" and "buon" compare equal. Tries the standard Unicode NFD decomposition
 * first (handles every Vietnamese tone mark); the fallback regex map runs afterward
 * unconditionally as a cheap no-op safety net in case `normalize` threw or silently did
 * nothing on a Hermes build without full ICU data.
 */
export const normalizeVietnamese = (value: string): string => {
  const lower = value.toLowerCase().trim();

  let result = lower;
  try {
    const COMBINING_MARKS = new RegExp('[\\u0300-\\u036f]', 'g');
    result = lower.normalize('NFD').replace(COMBINING_MARKS, '');
  } catch {
    // Fall through to the manual map below.
  }
  result = result.replace(/đ/g, 'd');

  return stripDiacriticsFallback(result);
};
