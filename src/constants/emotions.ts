import { MoodTag, getMoodTag } from './moods';

export type PlutchikEmotion =
  | 'JOY'
  | 'TRUST'
  | 'FEAR'
  | 'SURPRISE'
  | 'SADNESS'
  | 'DISGUST'
  | 'ANGER'
  | 'ANTICIPATION';

export type PlutchikEmotionConfig = {
  label: string;
  icon: string;
  activeIcon: string;
  color: string;
  moodTag: MoodTag;
  score: number;
};

const PLUTCHIK_CONFIG: Record<PlutchikEmotion, PlutchikEmotionConfig> = {
  JOY: {
    label: 'Vui vẻ',
    icon: 'emoticon-excited-outline',
    activeIcon: 'emoticon-excited',
    color: '#FDD835',
    moodTag: 'EXCELLENT',
    score: 10,
  },
  TRUST: {
    label: 'Tin tưởng',
    icon: 'emoticon-happy-outline',
    activeIcon: 'emoticon-happy',
    color: '#66BB6A',
    moodTag: 'GOOD',
    score: 8,
  },
  ANTICIPATION: {
    label: 'Hứng khởi',
    icon: 'emoticon-wink-outline',
    activeIcon: 'emoticon-wink',
    color: '#FF7043',
    moodTag: 'GOOD',
    score: 7,
  },
  SURPRISE: {
    label: 'Ngạc nhiên',
    icon: 'emoticon-lol-outline',
    activeIcon: 'emoticon-lol',
    color: '#FFA726',
    moodTag: 'NEUTRAL',
    score: 6,
  },
  FEAR: {
    label: 'Lo lắng',
    icon: 'emoticon-cry-outline',
    activeIcon: 'emoticon-cry',
    color: '#26A69A',
    moodTag: 'BAD',
    score: 4,
  },
  SADNESS: {
    label: 'Buồn bã',
    icon: 'emoticon-sad-outline',
    activeIcon: 'emoticon-sad',
    color: '#42A5F5',
    moodTag: 'BAD',
    score: 3,
  },
  DISGUST: {
    label: 'Chán ghét',
    icon: 'emoticon-confused-outline',
    activeIcon: 'emoticon-confused',
    color: '#AB47BC',
    moodTag: 'TERRIBLE',
    score: 2,
  },
  ANGER: {
    label: 'Tức giận',
    icon: 'emoticon-angry-outline',
    activeIcon: 'emoticon-angry',
    color: '#EF5350',
    moodTag: 'TERRIBLE',
    score: 1,
  },
};

export const PLUTCHIK_EMOTIONS: Record<PlutchikEmotion, PlutchikEmotionConfig> =
  PLUTCHIK_CONFIG;

export type PlutchikEmotionEntry = PlutchikEmotionConfig & {
  key: PlutchikEmotion;
};

export const PLUTCHIK_EMOTION_LIST: PlutchikEmotionEntry[] = (
  Object.keys(PLUTCHIK_CONFIG) as PlutchikEmotion[]
).map(key => ({ key, ...PLUTCHIK_CONFIG[key] }));

const MOOD_TAG_TO_EMOTION: Record<MoodTag, PlutchikEmotion> = {
  EXCELLENT: 'JOY',
  GOOD: 'TRUST',
  NEUTRAL: 'SURPRISE',
  BAD: 'SADNESS',
  TERRIBLE: 'ANGER',
};

export const getEmotionFromMoodTag = (moodTag: MoodTag): PlutchikEmotion =>
  MOOD_TAG_TO_EMOTION[moodTag] ?? 'JOY';

/** Single safe call: raw API value → PlutchikEmotionConfig (never undefined). */
export const emotionConfigFromRaw = (
  raw: string | null | undefined,
): PlutchikEmotionConfig =>
  PLUTCHIK_CONFIG[MOOD_TAG_TO_EMOTION[getMoodTag(raw)] ?? 'JOY'];
