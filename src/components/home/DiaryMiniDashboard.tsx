import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components';
import { RootStackParamList } from '@/navigation';
import { MoodTag, MOOD_SELECTOR_OPTIONS } from '@/constants/moods';
import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from '@/theme';

// Sunday=0 in JS getDay(); map to Vietnamese short labels
const DAY_NAMES = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

const getLast7DayLabels = (): string[] => {
  const today = new Date();
  const labels: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    labels.push(DAY_NAMES[d.getDay()]);
  }
  return labels;
};

const hexWithAlpha = (hex: string, alphaHex: string): string => `${hex}${alphaHex}`;

interface DiaryMiniDashboardProps {
  moods: (MoodTag | null)[];
  streak: number;
}

const DiaryMiniDashboard: React.FC<DiaryMiniDashboardProps> = ({ moods, streak }) => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const safeMoods = moods.length === 7 ? moods : Array(7).fill(null);
  const dayLabels = getLast7DayLabels();

  return (
    <Pressable style={styles.card} onPress={() => navigation.navigate('DiaryOverview')}>
      <View style={styles.headerRow}>
        <View style={styles.iconBox}>
          <MaterialCommunityIcons
            name="notebook-edit-outline"
            size={22}
            color={COLORS.accentNegative}
          />
        </View>
        <View style={styles.headerText}>
          <View style={styles.titleRow}>
            <AppText style={styles.title}>{t('home.dashboards.diary.title')}</AppText>
            {streak > 0 && (
              <View style={styles.streakChip}>
                <AppText style={styles.streakText}>
                  {t('home.dashboards.diary.streak', { count: streak })}
                </AppText>
              </View>
            )}
          </View>
          <AppText style={styles.subtitle}>{t('home.dashboards.diary.subtitle')}</AppText>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.textTertiary} />
      </View>

      <View style={styles.dotsRow}>
        {safeMoods.map((mood, i) => {
          const opt = mood ? MOOD_SELECTOR_OPTIONS.find(o => o.value === mood) : null;
          const iconName = opt?.icon ?? 'emoticon-neutral-outline';
          const iconColor = opt?.color ?? COLORS.textTertiary;
          const bg = opt ? hexWithAlpha(opt.color, '1A') : COLORS.background;
          const borderColor = opt?.color ?? COLORS.borderSubtle;
          return (
            <View key={i} style={styles.dotColumn}>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: bg, borderColor },
                ]}
              >
                <MaterialCommunityIcons
                  name={iconName}
                  size={18}
                  color={iconColor}
                />
              </View>
              <AppText style={styles.dayLabel}>{dayLabels[i]}</AppText>
            </View>
          );
        })}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surfaceRaised,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    shadowColor: COLORS.shadowBase,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: 14,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFF0E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.text,
  },
  streakChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.pill,
    backgroundColor: '#FFF0E6',
  },
  streakText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.accentNegative,
  },
  subtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dotColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textTertiary,
  },
});

export default DiaryMiniDashboard;
