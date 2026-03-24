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
    color: '#84CC16',
    icon: 'emoticon-happy-outline',
  },
  NORMAL: {
    value: 4,
    label: 'Bình thường',
    color: '#FACC15',
    icon: 'emoticon-outline',
  },
  INDULGENT: {
    value: 3,
    label: 'Nuông chiều',
    color: '#A8A29E',
    icon: 'emoticon-neutral-outline',
  },
  OVERATE: {
    value: 2,
    label: 'Quá đà',
    color: '#FB923C',
    icon: 'emoticon-sad-outline',
  },
  SKIPPED: {
    value: 1,
    label: 'Bỏ bữa',
    color: '#A855F7',
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
