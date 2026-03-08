import { DiaryEntryRequest } from '../types/diary';
import { AttachmentFile } from '../types/media';

export const getFileNameFromUri = (uri: string): string => {
  const uriSegments = uri.split('/');
  const lastSegment = uriSegments[uriSegments.length - 1];

  return lastSegment && lastSegment.length > 0
    ? lastSegment
    : `attachment-${Date.now()}.jpg`;
};

export const getMimeTypeFromFileName = (fileName: string): string => {
  const normalizedName = fileName.toLowerCase();

  if (normalizedName.endsWith('.png')) {
    return 'image/png';
  }

  if (normalizedName.endsWith('.heic')) {
    return 'image/heic';
  }

  if (normalizedName.endsWith('.webp')) {
    return 'image/webp';
  }

  return 'image/jpeg';
};

export const mapImageUrisToAttachmentFiles = (
  imageUris: string[] = [],
): AttachmentFile[] => {
  return imageUris
    .filter(uri => {
      const isLocalUri =
        uri.startsWith('file://') || uri.startsWith('content://');

      if (!isLocalUri) {
        console.warn(
          'Skipping non-local attachment URI. Use file:// or content:// for RN multipart upload:',
          uri,
        );
      }

      return isLocalUri;
    })
    .map(uri => {
      const name = getFileNameFromUri(uri);

      return {
        uri,
        name,
        type: getMimeTypeFromFileName(name),
      };
    });
};

const toMultipartFile = (attachment: AttachmentFile): AttachmentFile => {
  return {
    uri: attachment.uri,
    name: attachment.name,
    type: attachment.type,
  };
};

export const createDiaryFormData = (
  diaryMetadata: DiaryEntryRequest,
  attachments: AttachmentFile[],
): FormData => {
  const formData = new FormData();

  formData.append('diary', JSON.stringify(diaryMetadata));

  attachments.forEach(attachment => {
    const fileData = toMultipartFile(attachment);

    formData.append('attachments', fileData as unknown as Blob);
  });

  return formData;
};
