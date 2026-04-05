// src/constants/chat.ts

export const CHAT_SENDER = {
  USER: 'USER',
  AI: 'AI',
} as const;

export type ChatSender = (typeof CHAT_SENDER)[keyof typeof CHAT_SENDER];

export const INITIAL_CHAT_MESSAGE =
  'Chào bạn, hôm nay bạn thấy thế nào? Mình ở đây để lắng nghe.';

export const LOADING_HISTORY_TEXT = 'Đang tải lịch sử trò chuyện...';

export const EMPTY_CHAT_TEXT = 'Chưa có cuộc trò chuyện nào.';

export const ERROR_MESSAGE_TEXT =
  'Xin lỗi, không thể gửi tin nhắn. Vui lòng thử lại.';

export const BOT_NAME = 'Bạn Tâm giao';

export const BOT_STATUS = 'Đang hoạt động';
