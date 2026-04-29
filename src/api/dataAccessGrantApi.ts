import axiosClient from '@/api/axiosClient';

const GRANTS_BASE_PATH = '/api/v1/auth/grants';

export type AccessScope = 'READ_JOURNAL' | 'READ_ALL';
export type GrantStatus = 'ACTIVE' | 'REVOKED';

export interface DataAccessGrantResponse {
  grantId: string;
  granterProfileId: string;
  granteeProfileId: string;
  status: GrantStatus;
  accessScope: AccessScope;
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

/** Grants the calling user's tracking data access to granteeProfileId. */
export const grantAccess = async (
  granteeProfileId: string,
  accessScope: AccessScope,
  expiresAt: string,
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
