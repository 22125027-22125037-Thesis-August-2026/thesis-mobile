export type SocialChannelType = 'DIRECT_FRIEND' | 'THERAPIST_CONSULT';

export interface SocialChannelSummary {
  channelId: string;
  type: SocialChannelType;
  counterpartProfileId?: string | null;
  counterpartUsername?: string | null;
  counterpartDisplayName?: string | null;
  counterpartAvatarUrl?: string | null;
  lastMessagePreview?: string | null;
  lastMessageAt?: string | null;
  unreadCount: number;
  moodAlert?: string | null;
  checkInPrompt?: string | null;
}

export type FriendRequestDirection = 'INCOMING' | 'OUTGOING';

export interface SocialFriendRequestSummary {
  requestId: string;
  senderId?: string | null;
  senderProfileName?: string | null;
  senderDisplayName?: string | null;
  senderAvatarUrl?: string | null;
  receiverId?: string | null;
  receiverProfileName?: string | null;
  receiverDisplayName?: string | null;
  receiverAvatarUrl?: string | null;
  createdAt?: string | null;
}

export interface SocialChannelMessage {
  messageId: string;
  channelId: string;
  content: string;
  senderProfileId?: string | null;
  createdAt: string;
}