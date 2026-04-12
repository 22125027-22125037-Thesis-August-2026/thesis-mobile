import { COLORS } from '@/theme';

export type SleepQualityUi = {
  color: string;
  icon: string;
};

export const SLEEP_QUALITY_UI_MAP: Record<number, SleepQualityUi> = {
  5: { color: COLORS.sleepQualityExcellent, icon: 'emoticon-happy-outline' },
  4: { color: COLORS.sleepQualityGood, icon: 'emoticon-outline' },
  3: { color: COLORS.sleepQualityNeutral, icon: 'emoticon-neutral-outline' },
  2: { color: COLORS.sleepQualityBad, icon: 'emoticon-sad-outline' },
  1: { color: COLORS.sleepQualityTerrible, icon: 'emoticon-cry-outline' },
};

export const SLEEP_WEEKDAY_LABELS: string[] = [
  'Hai',
  'Ba',
  'Tư',
  'Năm',
  'Sáu',
  'Bảy',
  'CN',
];
