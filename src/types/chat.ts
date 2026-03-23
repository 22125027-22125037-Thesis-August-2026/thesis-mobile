// src/types/chat.ts

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export interface AiChatRequest {
  session_id: string | null;
  content: string;
}

export interface AIChatResponse {
  session_id?: string;
  content: string;
  sentiment_detected: string;
  crisis_detected: boolean;
}
