import { COLORS } from '../constants/colors';

const EMOTION_COLOR_MAP: Record<string, string> = {
  SAD: COLORS.emotionSad,
  HAPPY: COLORS.emotionHappy,
  ANXIOUS: COLORS.emotionAnxious,
  ANGRY: COLORS.emotionAngry,
};

export const getEmotionColor = (emotion: string): string => {
  const normalizedEmotion = emotion?.toUpperCase() ?? '';
  return EMOTION_COLOR_MAP[normalizedEmotion] ?? COLORS.emotionNeutral;
};

export const formatSessionDate = (updatedAt: string): string => {
  const date = new Date(updatedAt);

  if (Number.isNaN(date.getTime())) {
    return updatedAt;
  }

  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  if (isToday) {
    return `Hôm nay, ${hours}:${minutes}`;
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year} ${hours}:${minutes}`;
};
