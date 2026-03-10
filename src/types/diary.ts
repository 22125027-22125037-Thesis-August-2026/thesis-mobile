export interface DiaryEntryRequest {
  title?: string;
  content: string;
  moodTag?: string;
  positivityScore?: number;
}

export interface MediaAttachmentResponse {
  id: string;
  fileName: string;
  fileUrl: string;
}

export interface DiaryEntryResponse {
  id: string;
  title?: string | null;
  content: string;
  moodTag: string | null;
  positivityScore: number | null;
  attachments: MediaAttachmentResponse[];
  createdAt: string;
  updatedAt: string;
}
