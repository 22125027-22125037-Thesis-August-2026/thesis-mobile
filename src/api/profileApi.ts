import axiosClient from '@/api/axiosClient';

const AUTH_BASE_PATH = '/api/v1/auth';

export const uploadAvatarImage = async (fileUri: string): Promise<string> => {
  const filename = fileUri.split('/').pop() ?? 'avatar.jpg';
  const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg';
  const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';

  const formData = new FormData();
  formData.append('file', {
    uri: fileUri,
    name: filename,
    type: mimeType,
  } as any);

  const response = await axiosClient.post<{ url: string }>(
    `${AUTH_BASE_PATH}/profile/avatar`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );

  return response.data.url;
};
