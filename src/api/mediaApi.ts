import axiosClient from '@/api/axiosClient';

const MEDIA_BASE_PATH = '/api/v1/tracking/media';

/**
 * Deletes a single media attachment (e.g. a photo removed while editing a diary entry).
 * Owner-scoped on the backend via the caller's JWT.
 */
export const deleteMediaAttachment = async (id: string): Promise<void> => {
  await axiosClient.delete(`${MEDIA_BASE_PATH}/${id}`);
};
