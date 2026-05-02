import axiosClient from '@/api/axiosClient';
import { DiaryEntryRequest, DiaryEntryResponse } from '@/types';
import { createDiaryFormData, mapImageUrisToAttachmentFiles } from '@/utils';

const DIARY_BASE_PATH = '/api/v1/tracking/diaries';

export const getDiaryEntries = async (): Promise<DiaryEntryResponse[]> => {
  const response = await axiosClient.get<DiaryEntryResponse[]>(
    `${DIARY_BASE_PATH}/`,
  );
  return response.data;
};

export const getDiaryEntryById = async (
  id: string,
): Promise<DiaryEntryResponse> => {
  const response = await axiosClient.get<DiaryEntryResponse>(
    `${DIARY_BASE_PATH}/${id}`,
  );
  return response.data;
};

export const createDiaryEntry = async (
  data: DiaryEntryRequest,
  imageUris?: string[],
): Promise<DiaryEntryResponse> => {
  const attachments = mapImageUrisToAttachmentFiles(imageUris ?? []);
  const formData = createDiaryFormData(data, attachments);

  try {
    const response = await axiosClient.post<DiaryEntryResponse>(
      `${DIARY_BASE_PATH}/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    console.log('API response:', response.data);

    return response.data;
  } catch (error: any) {
    console.error(
      'API Error Details:',
      error.message,
      error.response?.data,
      error.response?.status,
    );
    throw error;
  }
};

export const updateDiaryEntry = async (
  id: string,
  data: DiaryEntryRequest,
  imageUris?: string[],
): Promise<DiaryEntryResponse> => {
  const attachments = mapImageUrisToAttachmentFiles(imageUris ?? []);
  const formData = createDiaryFormData(data, attachments);

  const response = await axiosClient.put<DiaryEntryResponse>(
    `${DIARY_BASE_PATH}/${id}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  return response.data;
};

export const deleteDiaryEntry = async (id: string): Promise<void> => {
  await axiosClient.delete(`${DIARY_BASE_PATH}/${id}`);
};
