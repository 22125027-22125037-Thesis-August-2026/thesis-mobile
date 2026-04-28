import axiosClient from '@/api/axiosClient';

const GRANTS_BASE_PATH = '/api/v1/auth/grants';

export const grantAccess = async (
  granteeProfileId: string,
  scope: string,
  expiresAt: string,
): Promise<void> => {
  await axiosClient.post(GRANTS_BASE_PATH, {
    granteeProfileId,
    scope,
    expiresAt,
  });
};

export const revokeAccess = async (granteeProfileId: string): Promise<void> => {
  await axiosClient.delete(`${GRANTS_BASE_PATH}/${granteeProfileId}`);
};
