import { BASE_URL } from '@/api/axiosClient';

// Rows created before diary attachments were wired up to real object storage hold this fake
// path (see DiaryEntryServiceImpl's old TODO on the backend) — the file behind it was never
// actually saved, so there's nothing to load.
const LEGACY_UNRESOLVABLE_PREFIX = '/files/';

/**
 * Resolves a media URL coming from the backend into something `<Image>` can load:
 *  - already-absolute URLs (http/https — e.g. a presigned S3 GET URL) pass through unchanged.
 *  - a relative path is prefixed with the API's BASE_URL.
 *  - a known-legacy placeholder path (or an empty/missing value) resolves to null so the
 *    caller can render a "couldn't load" placeholder instead of an image request doomed to fail.
 */
export const resolveMediaUrl = (url: string | null | undefined): string | null => {
  if (!url || !url.trim()) return null;
  if (url.startsWith(LEGACY_UNRESOLVABLE_PREFIX)) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};
