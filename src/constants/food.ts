import { COLORS } from '@/theme';

export type SatietyUi = {
  value: number;
  label: string;
  color: string;
  icon: string;
};

export const SATIETY_UI_MAP: Record<string, SatietyUi> = {
  ENERGIZED: {
    value: 5,
    label: 'Năng lượng',
    color: COLORS.sleepQualityExcellent,
    icon: 'emoticon-happy-outline',
  },
  NORMAL: {
    value: 4,
    label: 'Bình thường',
    color: COLORS.sleepQualityGood,
    icon: 'emoticon-outline',
  },
  INDULGENT: {
    value: 3,
    label: 'Nuông chiều',
    color: COLORS.emotionNeutral,
    icon: 'emoticon-neutral-outline',
  },
  OVERATE: {
    value: 2,
    label: 'Quá đà',
    color: COLORS.sleepQualityBad,
    icon: 'emoticon-sad-outline',
  },
  SKIPPED: {
    value: 1,
    label: 'Bỏ bữa',
    color: COLORS.sleepQualityTerrible,
    icon: 'emoticon-cry-outline',
  },
};

export const FOOD_WEEKDAY_LABELS: string[] = [
  'Hai',
  'Ba',
  'Tư',
  'Năm',
  'Sáu',
  'Bảy',
  'CN',
];
