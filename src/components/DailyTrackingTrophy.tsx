import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from '@/theme';
import { DailyTrackingStatus } from '@/utils';
import AppText from './AppText';

type TrophyTier = 'none' | 'bronze' | 'silver' | 'gold';

const TIER_STYLE: Record<
  Exclude<TrophyTier, 'none'>,
  { color: string; ringColor: string; labelKey: string }
> = {
  bronze: { color: '#CD7F32', ringColor: '#F4D9B8', labelKey: 'profile.dailyTrophy.bronze' },
  silver: { color: '#9AA0A6', ringColor: '#E4E6EB', labelKey: 'profile.dailyTrophy.silver' },
  gold: { color: '#F2B400', ringColor: '#FFEFB8', labelKey: 'profile.dailyTrophy.gold' },
};

const resolveTier = (count: number): TrophyTier => {
  if (count >= 4) return 'gold';
  if (count >= 3) return 'silver';
  if (count >= 2) return 'bronze';
  return 'none';
};

interface CategoryDescriptor {
  key: keyof Omit<DailyTrackingStatus, 'count'>;
  icon: string;
  labelKey: string;
}

const CATEGORIES: CategoryDescriptor[] = [
  { key: 'nutrition', icon: 'food-apple', labelKey: 'profile.dailyTrophy.nutrition' },
  { key: 'sleep', icon: 'sleep', labelKey: 'profile.dailyTrophy.sleep' },
  { key: 'diary', icon: 'notebook', labelKey: 'profile.dailyTrophy.diary' },
  { key: 'steps', icon: 'walk', labelKey: 'profile.dailyTrophy.steps' },
];

interface DailyTrackingTrophyProps {
  status: DailyTrackingStatus;
}

const DailyTrackingTrophy: React.FC<DailyTrackingTrophyProps> = ({ status }) => {
  const { t } = useTranslation();
  const tier = useMemo(() => resolveTier(status.count), [status.count]);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <AppText style={styles.title}>
          {t('profile.dailyTrophy.title', { defaultValue: "Today's tracking trophy" })}
        </AppText>
        <AppText style={styles.subtitle}>
          {t('profile.dailyTrophy.progress', {
            defaultValue: 'Today: {{count}}/4 logged',
            count: status.count,
          })}
        </AppText>
      </View>

      {/* Earned cup (single, highest tier reached today) */}
      <View style={styles.cupBlock}>
        {tier === 'none' ? (
          <>
            <View style={[styles.cupBadge, styles.cupBadgeEmpty]}>
              <MaterialCommunityIcons
                name="trophy-outline"
                size={36}
                color={COLORS.textTertiary}
              />
            </View>
            <AppText style={styles.emptyText}>
              {t('profile.dailyTrophy.empty', {
                defaultValue:
                  'Log at least 2 categories today to earn the bronze cup!',
              })}
            </AppText>
          </>
        ) : (
          <>
            <View
              style={[styles.cupBadge, { backgroundColor: TIER_STYLE[tier].ringColor }]}
            >
              <MaterialCommunityIcons
                name="trophy"
                size={36}
                color={TIER_STYLE[tier].color}
              />
            </View>
            <AppText style={[styles.tierLabel, { color: TIER_STYLE[tier].color }]}>
              {t(TIER_STYLE[tier].labelKey, { defaultValue: tier })}
            </AppText>
          </>
        )}
      </View>

      {/* Per-category breakdown for today */}
      <View style={styles.categoryRow}>
        {CATEGORIES.map(category => {
          const done = status[category.key];
          return (
            <View key={category.key} style={styles.categoryItem}>
              <View
                style={[
                  styles.categoryIcon,
                  done ? styles.categoryIconDone : styles.categoryIconPending,
                ]}
              >
                <MaterialCommunityIcons
                  name={done ? 'check' : category.icon}
                  size={18}
                  color={done ? COLORS.white : COLORS.textTertiary}
                />
              </View>
              <AppText
                style={[
                  styles.categoryLabel,
                  done && styles.categoryLabelDone,
                ]}
              >
                {t(category.labelKey, { defaultValue: category.key })}
              </AppText>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surfaceRaised,
    borderRadius: BORDER_RADIUS.card,
    padding: SPACING.md,
    shadowColor: COLORS.shadowBase,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  headerRow: {
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  cupBlock: {
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  cupBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  cupBadgeEmpty: {
    backgroundColor: COLORS.primaryMuted,
  },
  tierLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.sm,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.sm,
  },
  categoryItem: {
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  categoryIconDone: {
    backgroundColor: COLORS.primary,
  },
  categoryIconPending: {
    backgroundColor: COLORS.primaryMuted,
    opacity: 0.7,
  },
  categoryLabel: {
    fontSize: 11,
    color: COLORS.textTertiary,
    textAlign: 'center',
  },
  categoryLabelDone: {
    color: COLORS.text,
    fontWeight: '600',
  },
});

export default DailyTrackingTrophy;
