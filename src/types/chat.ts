// src/types/chat.ts

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
