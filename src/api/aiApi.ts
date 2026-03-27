// src/api/aiApi.ts

import axiosClient from './axiosClient';
import { AiChatRequest, AIChatResponse } from '../types/chat';

const MOCK_PROFILE_ID = '123e4567-e89b-12d3-a456-426614174000';

const AI_BASE_PATH = '/api/v1/ai/chat';

const sendMessage = async (data: AiChatRequest): Promise<AIChatResponse> => {
  try {
    const response = await axiosClient.post<{ data: AIChatResponse }>(
      `${AI_BASE_PATH}/send`,
      data,
      {
        headers: {
          'X-Profile-Id': MOCK_PROFILE_ID,
        },
      },
    );
    // Extract actual payload from wrapped response
    return response.data.data;
  } catch (error) {
    console.error('Error sending message to AI:', error);
    throw error;
  }
};

export const aiApi = {
  sendMessage,
};
