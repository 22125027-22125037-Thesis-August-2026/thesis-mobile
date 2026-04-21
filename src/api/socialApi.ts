import socialAxiosClient from '@/api/socialAxiosClient';
import {
  FriendRequestDirection,
  SocialChannelMessage,
  SocialChannelSummary,
  SocialFriendRequestSummary,
} from '@/types';

interface PaginationParams {
  page?: number;
  size?: number;
}

const SOCIAL_FRIENDS_BASE_PATH = '/api/v1/friends';
const SOCIAL_CHATS_BASE_PATH = '/api/v1/chats';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const asString = (value: unknown): string | null => {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number') {
    return String(value);
  }

  return null;
};

const asNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const extractListPayload = <T>(payload: unknown): T[] => {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (!isRecord(payload)) {
    return [];
  }

  const dataPayload = payload.data;
  if (Array.isArray(dataPayload)) {
    return dataPayload as T[];
  }

  if (isRecord(dataPayload) && Array.isArray(dataPayload.content)) {
    return dataPayload.content as T[];
  }

  if (Array.isArray(payload.content)) {
    return payload.content as T[];
  }

  return [];
};

const normalizeChannelType = (value: unknown): 'DIRECT_FRIEND' | 'THERAPIST_CONSULT' => {
  return value === 'THERAPIST_CONSULT' ? 'THERAPIST_CONSULT' : 'DIRECT_FRIEND';
};

const toSocialChannelSummary = (item: unknown): SocialChannelSummary | null => {
  if (!isRecord(item)) {
    return null;
  }

  const channelId = asString(item.channelId);
  if (!channelId) {
    return null;
  }

  return {
    channelId,
    type: normalizeChannelType(item.type),
    counterpartProfileId: asString(item.counterpartProfileId),
    counterpartDisplayName: asString(item.counterpartDisplayName),
    counterpartAvatarUrl: asString(item.counterpartAvatarUrl),
    lastMessagePreview: asString(item.lastMessagePreview),
    lastMessageAt: asString(item.lastMessageAt),
    unreadCount: asNumber(item.unreadCount, 0),
    moodAlert: asString(item.moodAlert),
    checkInPrompt: asString(item.checkInPrompt),
  };
};

const toFriendRequestSummary = (item: unknown): SocialFriendRequestSummary | null => {
  if (!isRecord(item)) {
    return null;
  }

  const requestId = asString(item.requestId) ?? asString(item.id);
  if (!requestId) {
    return null;
  }

  return {
    requestId,
    senderId: asString(item.senderId),
    senderDisplayName: asString(item.senderDisplayName),
    senderAvatarUrl: asString(item.senderAvatarUrl),
    receiverId: asString(item.receiverId),
    receiverDisplayName: asString(item.receiverDisplayName),
    receiverAvatarUrl: asString(item.receiverAvatarUrl),
    createdAt: asString(item.createdAt),
  };
};

const toChannelMessage = (item: unknown): SocialChannelMessage | null => {
  if (!isRecord(item)) {
    return null;
  }

  const messageId = asString(item.messageId) ?? asString(item.id);
  const channelId = asString(item.channelId);
  const content = asString(item.content);

  if (!messageId || !channelId || !content) {
    return null;
  }

  return {
    messageId,
    channelId,
    content,
    senderProfileId: asString(item.senderProfileId) ?? asString(item.sender),
    createdAt: asString(item.createdAt) ?? asString(item.sentAt) ?? new Date().toISOString(),
  };
};

export const getChatChannels = async (): Promise<SocialChannelSummary[]> => {
  const response = await socialAxiosClient.get<unknown>(`${SOCIAL_CHATS_BASE_PATH}/channels`);

  return extractListPayload<unknown>(response.data)
    .map(toSocialChannelSummary)
    .filter((item): item is SocialChannelSummary => item !== null);
};

export const getFriendRequests = async (
  direction: FriendRequestDirection,
  pagination: PaginationParams = {},
): Promise<SocialFriendRequestSummary[]> => {
  const response = await socialAxiosClient.get<unknown>(`${SOCIAL_FRIENDS_BASE_PATH}/requests`, {
    params: {
      direction,
      page: pagination.page ?? 0,
      size: pagination.size ?? 20,
    },
  });

  return extractListPayload<unknown>(response.data)
    .map(toFriendRequestSummary)
    .filter((item): item is SocialFriendRequestSummary => item !== null);
};

export const getChannelMessages = async (
  channelId: string,
  pagination: PaginationParams = {},
): Promise<SocialChannelMessage[]> => {
  const response = await socialAxiosClient.get<unknown>(
    `${SOCIAL_CHATS_BASE_PATH}/channels/${channelId}/messages`,
    {
      params: {
        page: pagination.page ?? 0,
        size: pagination.size ?? 20,
      },
    },
  );

  return extractListPayload<unknown>(response.data)
    .map(toChannelMessage)
    .filter((item): item is SocialChannelMessage => item !== null);
};