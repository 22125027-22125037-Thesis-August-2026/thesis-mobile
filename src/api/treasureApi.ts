import axiosClient from '@/api/axiosClient';
import {
  AttachmentFile,
  Treasure,
  TreasureCategoryId,
  TreasureRequest,
  TreasureResponse,
} from '@/types';
import { createTreasureFormData } from '@/utils';

const TREASURE_BASE_PATH = '/api/v1/tracking/treasures';

// Treasures are self-scoped on the backend via SecurityUtils.getCurrentProfileId(),
// so no profileId is passed from the client — the JWT identifies the owner.
const mapTreasure = (res: TreasureResponse): Treasure => ({
  id: res.id,
  category: res.category as TreasureCategoryId,
  content: res.content,
  emoji: res.emoji,
  createdAt: res.createdAt,
  mediaUrl: res.mediaUrl ?? undefined,
  mediaType: res.mediaType ?? undefined,
  mimeType: res.mimeType ?? undefined,
});

export const getTreasures = async (): Promise<Treasure[]> => {
  const response = await axiosClient.get<TreasureResponse[]>(`${TREASURE_BASE_PATH}/`);
  return response.data.map(mapTreasure);
};

export const createTreasure = async (
  data: TreasureRequest,
  media?: AttachmentFile | null,
): Promise<Treasure> => {
  const formData = createTreasureFormData(data, media);

  try {
    const response = await axiosClient.post<TreasureResponse>(
      `${TREASURE_BASE_PATH}/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    return mapTreasure(response.data);
  } catch (error: any) {
    console.error(
      'Treasure create failed:',
      error.message,
      error.response?.data,
      error.response?.status,
    );
    throw error;
  }
};

export const deleteTreasure = async (id: string): Promise<void> => {
  await axiosClient.delete(`${TREASURE_BASE_PATH}/${id}`);
};
