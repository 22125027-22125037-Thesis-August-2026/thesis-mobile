// src/types/chat.ts

import { ChatSender } from '@/constants';

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export interface AiChatRequest {
  sessionId: string | null;
  content: string;
}

export interface AIChatResponse {
  sessionId?: string;
  content: string;
  sentimentDetected: string;
  crisisDetected: boolean;
}

export interface ChatSessionOverview {
  sessionId: string;
  updatedAt: string;
  preview: string;
  emotion: string;
}

export interface BackendChatMessage {
  messageId: string;
  sessionId: string;
  sender: ChatSender;
  content: string;
  sentAt: string;
}
