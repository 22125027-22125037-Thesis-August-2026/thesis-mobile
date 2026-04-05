// src/api/aiApi.ts

import axiosClient from './axiosClient';
import {
  AiChatRequest,
  AIChatResponse,
  ChatSessionOverview,
  BackendChatMessage,
} from '../types/chat';

const AI_BASE_PATH = '/api/v1/ai/chat';

interface ApiResponse<T> {
  data: T;
}

const sendMessage = async (data: AiChatRequest): Promise<AIChatResponse> => {
  try {
    const response = await axiosClient.post<ApiResponse<AIChatResponse>>(
      `${AI_BASE_PATH}/send`,
      data,
    );
    return response.data.data;
  } catch (error) {
    console.error('Error sending message to AI:', error);
    throw error;
  }
};

const getSessions = async (): Promise<ChatSessionOverview[]> => {
  try {
    const response = await axiosClient.get<ApiResponse<ChatSessionOverview[]>>(
      `${AI_BASE_PATH}/sessions`,
    );
    return response.data.data;
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    throw error;
  }
};

const getChatHistory = async (
  sessionId: string,
): Promise<BackendChatMessage[]> => {
  try {
    const response = await axiosClient.get<ApiResponse<BackendChatMessage[]>>(
      `${AI_BASE_PATH}/history/${sessionId}`,
    );
    return response.data.data;
  } catch (error) {
    console.error('Error fetching chat history:', error);
    throw error;
  }
};

export const aiApi = {
  sendMessage,
  getSessions,
  getChatHistory,
};
