import { NotificationType } from '@/api/notificationApi';

export interface NotificationTypeTheme {
  bg: string;       // soft tint used in list icon + detail hero background
  fg: string;       // foreground for icons + accents
  surface: string;  // deeper tone of the same hue for buttons / chips
  icon: string;     // MaterialCommunityIcons name
  label: string;    // human-readable label (Vietnamese)
}

// Color mapping per spec:
//   STREAK   → yellow
//   BOOKING  → orange
//   INSIGHT  → purple
//   CHAT     → brown
//   REMINDER → gray
export const NOTIFICATION_TYPE_THEME: Record<
  NotificationType,
  NotificationTypeTheme
> = {
  STREAK: {
    bg: '#FFF3D6',
    fg: '#B07F00',
    surface: '#F2B705',
    icon: 'book-open-variant',
    label: 'Chuỗi thành tích',
  },
  BOOKING: {
    bg: '#FFE4D2',
    fg: '#D2691E',
    surface: '#E66A2B',
    icon: 'calendar-clock',
    label: 'Lịch hẹn',
  },
  INSIGHT: {
    bg: '#E9DDFF',
    fg: '#6A3BB3',
    surface: '#8B5CF6',
    icon: 'chart-line',
    label: 'Phân tích',
  },
  CHAT: {
    bg: '#E9DCC9',
    fg: '#7A4A2B',
    surface: '#8A6040',
    icon: 'message-text',
    label: 'Tin nhắn',
  },
  REMINDER: {
    bg: '#E5E5E5',
    fg: '#5A5A5A',
    surface: '#6B7280',
    icon: 'bell-ring',
    label: 'Nhắc nhở',
  },
};
