import axiosClient from '@/api/axiosClient';

const GRANTS_BASE_PATH = '/api/v1/auth/grants';

/**
 * Reserved profile id of the uMatter AI companion (mirrors backend
 * contract.SystemProfiles.AI_COMPANION_ID). Granting this principal lets the AI ground its replies
 * in your tracking data; with no grant, the companion still chats but without personal context.
 */
export const AI_COMPANION_PROFILE_ID = 'a1000000-a1a1-4a1a-8a1a-a1a1a1a1a1a1';

/** Per-category access tokens. A grant's scope is a set of these, or the READ_ALL shorthand. */
export type TrackingCategory =
  | 'READ_JOURNAL'
  | 'READ_SLEEP'
  | 'READ_FOOD'
  | 'READ_MOOD'
  | 'READ_STEPS'
  | 'READ_BREATHING';

export const READ_ALL = 'READ_ALL' as const;

export type GrantStatus = 'ACTIVE' | 'REVOKED';

export interface DataAccessGrantResponse {
  grantId: string;
  granterProfileId: string;
  granteeProfileId: string;
  status: GrantStatus;
  /** Comma-separated set of category tokens, e.g. "READ_SLEEP,READ_FOOD", or "READ_ALL". */
  accessScope: string;
  grantedAt: string;
  expiresAt: string;
}

export interface GrantStatusResponse {
  iGaveThemAccess: boolean;
  theyGaveMeAccess: boolean;
  myGrant: DataAccessGrantResponse | null;
  theirGrant: DataAccessGrantResponse | null;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  timestamp: string;
}

/** Joins a set of category tokens into the CSV the backend expects. */
export const buildScopeCsv = (categories: TrackingCategory[]): string =>
  categories.join(',');

/** Whether a grant's CSV scope permits a given category token (READ_ALL permits everything). */
export const scopeAllows = (
  accessScope: string | null | undefined,
  category: TrackingCategory,
): boolean => {
  if (!accessScope) {
    return false;
  }
  const tokens = accessScope
    .split(',')
    .map(t => t.trim().toUpperCase());
  return tokens.includes(READ_ALL) || tokens.includes(category);
};

/**
 * Grants the calling user's tracking data to granteeProfileId.
 * @param accessScope CSV of category tokens (use {@link buildScopeCsv}) or "READ_ALL".
 * @param expiresAt ISO timestamp, or null for a grant that persists until revoked (e.g. the AI).
 */
export const grantAccess = async (
  granteeProfileId: string,
  accessScope: string,
  expiresAt: string | null,
): Promise<DataAccessGrantResponse> => {
  const response = await axiosClient.post<ApiResponse<DataAccessGrantResponse>>(
    GRANTS_BASE_PATH,
    { granteeProfileId, accessScope, expiresAt },
  );
  return response.data.data;
};

/** Lists all grants issued by profileId. */
export const listMyGrants = async (profileId: string): Promise<DataAccessGrantResponse[]> => {
  const response = await axiosClient.get<ApiResponse<DataAccessGrantResponse[]>>(
    `${GRANTS_BASE_PATH}/${profileId}`,
  );
  return response.data.data;
};

/** Lists all grants received by profileId. */
export const listGrantsReceived = async (profileId: string): Promise<DataAccessGrantResponse[]> => {
  const response = await axiosClient.get<ApiResponse<DataAccessGrantResponse[]>>(
    `${GRANTS_BASE_PATH}/${profileId}/received`,
  );
  return response.data.data;
};

/** Returns bidirectional grant status between the calling user and otherProfileId. */
export const getGrantStatus = async (otherProfileId: string): Promise<GrantStatusResponse> => {
  const response = await axiosClient.get<ApiResponse<GrantStatusResponse>>(
    `${GRANTS_BASE_PATH}/status/${otherProfileId}`,
  );
  return response.data.data;
};

/** Revokes a grant the calling user previously gave to granteeProfileId. */
export const revokeAccess = async (granteeProfileId: string): Promise<void> => {
  await axiosClient.delete(`${GRANTS_BASE_PATH}/${granteeProfileId}`);
};
