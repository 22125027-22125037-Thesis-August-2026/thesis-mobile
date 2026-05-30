import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components';
import { diaryApi } from '@/api';
import { AuthContext } from '@/context/AuthContext';
import {
  MoodTag,
  PlutchikEmotion,
  PlutchikEmotionEntry,
  PLUTCHIK_EMOTION_LIST,
  PLUTCHIK_EMOTIONS,
  emotionConfigFromRaw,
  getMoodTag,
} from '@/constants';
import { WidgetBridge } from '@/native/WidgetBridge';
import { BORDER_RADIUS, COLORS, FONT_SIZES } from '@/theme';

// Layout: 2 rows × 4 columns — matches DiaryEntryScreen grid
const EMOTION_ROWS: PlutchikEmotionEntry[][] = [
  PLUTCHIK_EMOTION_LIST.slice(0, 4),
  PLUTCHIK_EMOTION_LIST.slice(4, 8),
];

const hexWithAlpha = (hex: string, alphaHex: string): string => `${hex}${alphaHex}`;

interface MoodCheckInCardProps {
  onMoodSaved?: () => void;
}

const MoodCheckInCard: React.FC<MoodCheckInCardProps> = ({ onMoodSaved }) => {
  const { t } = useTranslation();
  const { userInfo } = useContext(AuthContext)!;
  const [currentMood, setCurrentMood] = useState<PlutchikEmotion | null>(null);
  const [pendingMood, setPendingMood] = useState<PlutchikEmotion | null>(null);
  const [quickContent, setQuickContent] = useState<string>('');
  const [lastMood, setLastMood] = useState<MoodTag | null>(null);
  const [successEmotion, setSuccessEmotion] = useState<PlutchikEmotion | null>(null);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchLastMood = useCallback(async (): Promise<void> => {
    if (!userInfo?.profileId) return;
    try {
      const entries = await diaryApi.getDiaryEntries(userInfo.profileId);
      if (entries.length > 0) {
        const latest = entries.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )[0];
        setLastMood(getMoodTag(latest.moodTag));
      } else {
        setLastMood(null);
      }
    } catch {
      // silently keep current state
    }
  }, [userInfo?.profileId]);

  useFocusEffect(
    useCallback(() => {
      void fetchLastMood();
    }, [fetchLastMood]),
  );

  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  const handleMoodSelect = (emotion: PlutchikEmotion): void => {
    setCurrentMood(emotion);
    setPendingMood(emotion);
    setQuickContent('');
  };

  const handleQuickSave = async (): Promise<void> => {
    if (!pendingMood) return;
    const emotion = PLUTCHIK_EMOTIONS[pendingMood];
    const content =
      quickContent.trim() || `Cảm xúc hôm nay: ${emotion.label}`;
    try {
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${`${now.getMonth() + 1}`.padStart(2, '0')}-${`${now.getDate()}`.padStart(2, '0')}`;
      await diaryApi.createDiaryEntry({
        content,
        moodTag: emotion.moodTag,
        positivityScore: emotion.score,
        entryDate: todayStr,
      });
      const savedEmotion = pendingMood;
      setCurrentMood(null);
      setPendingMood(null);
      setQuickContent('');
      setLastMood(emotion.moodTag);
      setSuccessEmotion(savedEmotion);
      void WidgetBridge.cacheLastMood(emotion.moodTag, new Date().toISOString());
      void WidgetBridge.requestRefresh();
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
      successTimerRef.current = setTimeout(() => setSuccessEmotion(null), 2500);
      onMoodSaved?.();
    } catch {
      setCurrentMood(null);
      setPendingMood(null);
    }
  };

  const lastEmotionConfig = lastMood ? emotionConfigFromRaw(lastMood) : null;
  const successEmotionConfig = successEmotion
    ? PLUTCHIK_EMOTIONS[successEmotion] ?? PLUTCHIK_EMOTIONS.JOY
    : null;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <AppText style={styles.title}>{t('home.mood.cardTitle')}</AppText>
          <AppText style={styles.subtitle}>{t('home.mood.cardSubtitle')}</AppText>
        </View>
        {lastEmotionConfig && !successEmotion && (
          <View
            style={[
              styles.lastMoodBadge,
              { backgroundColor: hexWithAlpha(lastEmotionConfig.color, '1A') },
            ]}
          >
            <MaterialCommunityIcons
              name={lastEmotionConfig.activeIcon}
              size={13}
              color={lastEmotionConfig.color}
            />
            <AppText
              style={[styles.lastMoodText, { color: lastEmotionConfig.color }]}
            >
              {lastEmotionConfig.label}
            </AppText>
          </View>
        )}
      </View>

      {/* 2×4 Emotion Grid */}
      <View style={styles.emotionGrid}>
        {EMOTION_ROWS.map((row, rowIdx) => (
          <View key={rowIdx} style={styles.emotionRow}>
            {row.map(emotion => {
              const isActive = currentMood === emotion.key;
              return (
                <Pressable
                  key={emotion.key}
                  style={[
                    styles.emotionChip,
                    isActive && styles.emotionChipActive,
                  ]}
                  onPress={() => handleMoodSelect(emotion.key)}
                >
                  <View
                    style={[
                      styles.emotionCircle,
                      { backgroundColor: emotion.color },
                      isActive && styles.emotionCircleActive,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={isActive ? emotion.activeIcon : emotion.icon}
                      size={22}
                      color={COLORS.journalMoodFace}
                    />
                  </View>
                  <AppText
                    style={[
                      styles.emotionLabel,
                      isActive && styles.emotionLabelActive,
                    ]}
                    numberOfLines={1}
                  >
                    {emotion.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>

      {successEmotionConfig && (
        <View
          style={[
            styles.successBanner,
            { backgroundColor: hexWithAlpha(successEmotionConfig.color, '15') },
          ]}
        >
          <MaterialCommunityIcons
            name="check-circle"
            size={15}
            color={successEmotionConfig.color}
          />
          <AppText
            style={[styles.successText, { color: successEmotionConfig.color }]}
          >
            Đã ghi nhận •{' '}
            <AppText
              style={{ fontWeight: '800', color: successEmotionConfig.color }}
            >
              {successEmotionConfig.label}
            </AppText>
          </AppText>
        </View>
      )}

      {pendingMood && (
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder={`Ghi chú cho "${PLUTCHIK_EMOTIONS[pendingMood].label}" (tuỳ chọn)...`}
            placeholderTextColor={COLORS.placeholderMuted}
            value={quickContent}
            onChangeText={setQuickContent}
            onSubmitEditing={handleQuickSave}
            returnKeyType="send"
            maxLength={100}
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
    shadowOpacity: 0.1,
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
  lastMoodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  lastMoodText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Emotion grid
  emotionGrid: {
    rowGap: 6,
  },
  emotionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  emotionChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 2,
    borderRadius: 12,
    rowGap: 4,
  },
  emotionChipActive: {
    backgroundColor: COLORS.background,
  },
  emotionCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emotionCircleActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  emotionLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textTertiary,
    textAlign: 'center',
  },
  emotionLabelActive: {
    color: COLORS.text,
  },

  // Success & input
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  successText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
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
