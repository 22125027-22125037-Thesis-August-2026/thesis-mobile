import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components';
import { diaryApi } from '@/api';
import { AuthContext } from '@/context/AuthContext';
import {
  MoodSelectorOption,
  MoodTag,
  MOOD_SELECTOR_OPTIONS,
  getMoodScore,
} from '@/constants/moods';
import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from '@/theme';

const MOOD_CONTENT_KEY: Record<MoodTag, string> = {
  TERRIBLE: 'home.overview.moodDefaultTerrible',
  BAD: 'home.overview.moodDefaultBad',
  NEUTRAL: 'home.overview.moodDefaultNeutral',
  GOOD: 'home.overview.moodDefaultGood',
  EXCELLENT: 'home.overview.moodDefaultExcellent',
};

const MOOD_LABEL_KEY: Record<MoodTag, string> = {
  TERRIBLE: 'home.mood.chipLabels.TERRIBLE',
  BAD: 'home.mood.chipLabels.BAD',
  NEUTRAL: 'home.mood.chipLabels.NEUTRAL',
  GOOD: 'home.mood.chipLabels.GOOD',
  EXCELLENT: 'home.mood.chipLabels.EXCELLENT',
};

const hexWithAlpha = (hex: string, alphaHex: string): string => `${hex}${alphaHex}`;

interface MoodCheckInCardProps {
  onMoodSaved?: () => void;
}

const MoodCheckInCard: React.FC<MoodCheckInCardProps> = ({ onMoodSaved }) => {
  const { t } = useTranslation();
  const { userInfo } = useContext(AuthContext)!;
  const [currentMood, setCurrentMood] = useState<MoodTag | null>(null);
  const [pendingMood, setPendingMood] = useState<MoodTag | null>(null);
  const [quickContent, setQuickContent] = useState<string>('');
  const [todayDiaryId, setTodayDiaryId] = useState<string | null>(null);

  const fetchTodayMood = useCallback(async (): Promise<void> => {
    if (!userInfo?.profileId) return;
    try {
      const entries = await diaryApi.getDiaryEntries(userInfo.profileId);
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${`${now.getMonth() + 1}`.padStart(2, '0')}-${`${now.getDate()}`.padStart(2, '0')}`;
      const todayEntries = entries.filter(e => e.entryDate === todayStr);
      if (todayEntries.length > 0) {
        const latest = todayEntries.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )[0];
        setCurrentMood((latest.moodTag as MoodTag) ?? null);
        setTodayDiaryId(latest.id);
      } else {
        setCurrentMood(null);
        setTodayDiaryId(null);
      }
    } catch {
      // silently keep current state on error
    }
  }, [userInfo?.profileId]);

  useFocusEffect(
    useCallback(() => {
      void fetchTodayMood();
    }, [fetchTodayMood]),
  );

  useEffect(() => {
    void fetchTodayMood();
  }, [fetchTodayMood]);

  const handleMoodSelect = (mood: MoodTag): void => {
    if (todayDiaryId) return;
    setCurrentMood(mood);
    setPendingMood(mood);
    setQuickContent('');
  };

  const handleQuickSave = async (): Promise<void> => {
    if (!pendingMood) return;
    const content = quickContent.trim() || t(MOOD_CONTENT_KEY[pendingMood]);
    try {
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${`${now.getMonth() + 1}`.padStart(2, '0')}-${`${now.getDate()}`.padStart(2, '0')}`;
      const created = await diaryApi.createDiaryEntry({
        content,
        moodTag: pendingMood,
        positivityScore: getMoodScore(pendingMood),
        entryDate: todayStr,
      });
      setTodayDiaryId(created.id);
      setPendingMood(null);
      setQuickContent('');
      onMoodSaved?.();
    } catch {
      setCurrentMood(null);
      setPendingMood(null);
    }
  };

  const activeOption: MoodSelectorOption | undefined = currentMood
    ? MOOD_SELECTOR_OPTIONS.find(o => o.value === currentMood)
    : undefined;
  const isSaved = todayDiaryId !== null;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <AppText style={styles.title}>{t('home.mood.cardTitle')}</AppText>
          <AppText style={styles.subtitle}>{t('home.mood.cardSubtitle')}</AppText>
        </View>
        {isSaved && activeOption && (
          <View
            style={[
              styles.savedBadge,
              { backgroundColor: hexWithAlpha(activeOption.color, '1A') },
            ]}
          >
            <MaterialCommunityIcons
              name="check-circle"
              size={14}
              color={activeOption.color}
            />
            <AppText style={[styles.savedBadgeText, { color: activeOption.color }]}>
              {t('home.mood.savedBadge')}
            </AppText>
          </View>
        )}
      </View>

      <View style={styles.chipsRow}>
        {MOOD_SELECTOR_OPTIONS.map(opt => {
          const isActive = currentMood === opt.value;
          const isLocked = isSaved && !isActive;
          return (
            <Pressable
              key={opt.value}
              onPress={() => handleMoodSelect(opt.value)}
              disabled={isSaved}
              style={[
                styles.chip,
                isActive && {
                  backgroundColor: hexWithAlpha(opt.color, '1A'),
                  borderColor: opt.color,
                },
                isLocked && styles.chipLocked,
              ]}
            >
              <MaterialCommunityIcons
                name={isActive ? opt.activeIcon : opt.icon}
                size={26}
                color={isActive ? opt.color : COLORS.textTertiary}
              />
              <AppText
                style={[
                  styles.chipLabel,
                  { color: isActive ? opt.color : COLORS.textTertiary },
                ]}
              >
                {t(MOOD_LABEL_KEY[opt.value])}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      {pendingMood && !isSaved && (
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder={t('home.mood.quickInputPlaceholder', {
              mood: t(MOOD_LABEL_KEY[pendingMood]).toLowerCase(),
            })}
            placeholderTextColor={COLORS.placeholderMuted}
            value={quickContent}
            onChangeText={setQuickContent}
            onSubmitEditing={handleQuickSave}
            returnKeyType="send"
            maxLength={200}
          />
          <Pressable style={styles.sendButton} onPress={handleQuickSave}>
            <MaterialCommunityIcons name="send" size={18} color={COLORS.white} />
          </Pressable>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surfaceRaised,
    borderRadius: BORDER_RADIUS.xxl,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    shadowColor: COLORS.shadowBase,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 24,
    elevation: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  savedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  savedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  chip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 14,
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  chipLocked: {
    opacity: 0.4,
  },
  chipLabel: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
  },
  input: {
    flex: 1,
    height: 42,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    paddingHorizontal: 14,
    color: COLORS.text,
    fontSize: FONT_SIZES.sm,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primaryAlpha35,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 3,
  },
});

export default MoodCheckInCard;
