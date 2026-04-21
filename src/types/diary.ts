export interface DiaryEntryRequest {
  title?: string;
  content: string;
  moodTag?: string;
  positivityScore?: number;
  entryDate?: string; // ISO format: YYYY-MM-DD
}

export interface MediaAttachmentResponse {
  id: string;
  fileName: string;
  fileUrl: string;
}

export interface DiaryEntryResponse extends DiaryEntryRequest {
  id: string;
  attachments: MediaAttachmentResponse[];
  entryDate: string; // ISO format: YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
}
