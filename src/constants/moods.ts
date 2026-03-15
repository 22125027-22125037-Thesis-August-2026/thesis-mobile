import { COLORS } from './colors';
import { TranslationKey } from './i18n';

export type MoodTag = 'TERRIBLE' | 'BAD' | 'NEUTRAL' | 'GOOD' | 'EXCELLENT';
export type MoodTone = 'negative' | 'neutral' | 'positive';

export type MoodSelectorOption = {
  value: MoodTag;
  icon: string;
  activeIcon: string;
  color: string;
};

type MoodConfig = {
  score: number;
  tone: MoodTone;
  selectorIcon: string;
  selectorActiveIcon: string;
  selectorColor: string;
  cardIcon: string;
  cardLabelKey: TranslationKey;
};

const MOOD_CONFIG: Record<MoodTag, MoodConfig> = {
  TERRIBLE: {
    score: 2,
    tone: 'negative',
    selectorIcon: 'emoticon-cry-outline',
    selectorActiveIcon: 'emoticon-cry',
    selectorColor: COLORS.journalMoodTerrible,
    cardIcon: 'emoticon-cry-outline',
    cardLabelKey: 'mood.terrible',
  },
  BAD: {
    score: 4,
    tone: 'negative',
    selectorIcon: 'emoticon-sad-outline',
    selectorActiveIcon: 'emoticon-sad',
    selectorColor: COLORS.journalMoodBad,
    cardIcon: 'emoticon-sad-outline',
    cardLabelKey: 'mood.bad',
  },
  NEUTRAL: {
    score: 6,
    tone: 'neutral',
    selectorIcon: 'emoticon-neutral-outline',
    selectorActiveIcon: 'emoticon-neutral',
    selectorColor: COLORS.journalMoodNeutral,
    cardIcon: 'emoticon-neutral-outline',
    cardLabelKey: 'mood.neutral',
  },
  GOOD: {
    score: 8,
    tone: 'positive',
    selectorIcon: 'emoticon-happy-outline',
    selectorActiveIcon: 'emoticon-happy',
    selectorColor: COLORS.journalMoodGood,
    cardIcon: 'emoticon-happy-outline',
    cardLabelKey: 'mood.good',
  },
  EXCELLENT: {
    score: 10,
    tone: 'positive',
    selectorIcon: 'emoticon-excited-outline',
    selectorActiveIcon: 'emoticon-excited',
    selectorColor: COLORS.journalMoodExcellent,
    cardIcon: 'emoticon-excited-outline',
    cardLabelKey: 'mood.excellent',
  },
};

const isMoodTag = (value: string): value is MoodTag => {
  return value in MOOD_CONFIG;
};

export const getMoodTag = (moodTag: string | null | undefined): MoodTag => {
  if (!moodTag) {
    return 'NEUTRAL';
  }

  return isMoodTag(moodTag) ? moodTag : 'NEUTRAL';
};

export const getMoodScore = (moodTag: MoodTag): number => {
  return MOOD_CONFIG[moodTag].score;
};

export const getMoodTone = (
  moodTag: string | null | undefined,
  positivityScore?: number | null,
): MoodTone => {
  if (moodTag && isMoodTag(moodTag)) {
    return MOOD_CONFIG[moodTag].tone;
  }

  if (typeof positivityScore === 'number') {
    if (positivityScore <= 4) {
      return 'negative';
    }

    if (positivityScore >= 7) {
      return 'positive';
    }
  }

  return 'neutral';
};

export const getMoodCardUi = (
  moodTag: string | null | undefined,
): {
  moodIcon: string;
  iconBackgroundColor: string;
  tagBackgroundColor: string;
  tagTextColor: string;
  labelKey: TranslationKey;
} => {
  const resolvedTag = getMoodTag(moodTag);
  const config = MOOD_CONFIG[resolvedTag];

  if (config.tone === 'negative') {
    return {
      moodIcon: config.cardIcon,
      iconBackgroundColor: COLORS.errorText,
      tagBackgroundColor: COLORS.errorBg,
      tagTextColor: COLORS.errorText,
      labelKey: config.cardLabelKey,
    };
  }

  if (config.tone === 'positive') {
    return {
      moodIcon: config.cardIcon,
      iconBackgroundColor: COLORS.accentPositive,
      tagBackgroundColor: COLORS.socialBg,
      tagTextColor: COLORS.accentPositive,
      labelKey: config.cardLabelKey,
    };
  }

  return {
    moodIcon: config.cardIcon,
    iconBackgroundColor: COLORS.textSecondary,
    tagBackgroundColor: COLORS.socialBg,
    tagTextColor: COLORS.textSecondary,
    labelKey: config.cardLabelKey,
  };
};

export const MOOD_SELECTOR_OPTIONS: MoodSelectorOption[] = (
  Object.keys(MOOD_CONFIG) as MoodTag[]
).map(tag => ({
  value: tag,
  icon: MOOD_CONFIG[tag].selectorIcon,
  activeIcon: MOOD_CONFIG[tag].selectorActiveIcon,
  color: MOOD_CONFIG[tag].selectorColor,
}));
