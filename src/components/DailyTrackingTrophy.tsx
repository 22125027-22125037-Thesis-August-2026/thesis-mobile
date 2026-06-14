import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from '@/theme';
import { DailyTrackingStatus } from '@/utils';
import AppText from './AppText';

type TrophyTier = 'none' | 'bronze' | 'silver' | 'gold';

const TIER_CFG: Record<
  Exclude<TrophyTier, 'none'>,
  { color: string; ringColor: string; headerColor: string; labelKey: string }
> = {
  bronze: {
    color: '#CD7F32',
    ringColor: '#F4D9B8',
    headerColor: '#FEF3E6',
    labelKey: 'profile.dailyTrophy.bronze',
  },
  silver: {
    color: '#9AA0A6',
    ringColor: '#E4E6EB',
    headerColor: '#F1F3F5',
    labelKey: 'profile.dailyTrophy.silver',
  },
  gold: {
    color: '#F2B400',
    ringColor: '#FFEFB8',
    headerColor: '#FFFBEA',
    labelKey: 'profile.dailyTrophy.gold',
  },
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
  const hasTier = tier !== 'none';
  const tierCfg = hasTier ? TIER_CFG[tier] : null;
  const isComplete = status.count >= 4;

  // Scale-in animation whenever tier changes (a new trophy is earned)
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const prevTierRef = useRef<TrophyTier>('none');

  useEffect(() => {
    if (tier !== prevTierRef.current && hasTier) {
      prevTierRef.current = tier;
      scaleAnim.setValue(0.7);
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 70,
        useNativeDriver: true,
      }).start();
    } else {
      prevTierRef.current = tier;
    }
  }, [tier, hasTier, scaleAnim]);

  return (
    <View style={styles.container}>
      {/* Colored accent header */}
      <View
        style={[
          styles.headerBand,
          { backgroundColor: hasTier ? tierCfg!.headerColor : COLORS.primaryMuted },
        ]}
      >
        <AppText style={styles.title}>
          {t('profile.dailyTrophy.title', { defaultValue: "Today's tracking trophy" })}
        </AppText>
        <View style={styles.progressPillWrapper}>
          <View
            style={[
              styles.progressPill,
              { backgroundColor: hasTier ? tierCfg!.ringColor : COLORS.white },
            ]}
          >
            <AppText
              style={[
                styles.progressPillText,
                { color: hasTier ? tierCfg!.color : COLORS.textTertiary },
              ]}
            >
              {t('profile.dailyTrophy.progress', {
                defaultValue: 'Today: {{count}}/4 logged',
                count: status.count,
              })}
            </AppText>
          </View>
        </View>
      </View>

      <View style={styles.body}>
        {/* Trophy cup */}
        <View style={styles.cupBlock}>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <View
              style={[
                styles.cupBadge,
                hasTier
                  ? { backgroundColor: tierCfg!.ringColor }
                  : styles.cupBadgeNone,
              ]}
            >
              <MaterialCommunityIcons
                name={hasTier ? 'trophy' : 'trophy-outline'}
                size={40}
                color={hasTier ? tierCfg!.color : COLORS.textTertiary}
              />
            </View>
          </Animated.View>

          {hasTier ? (
            <AppText style={[styles.tierLabel, { color: tierCfg!.color }]}>
              {t(tierCfg!.labelKey)}
            </AppText>
          ) : (
            <AppText style={styles.emptyText}>
              {t('profile.dailyTrophy.empty', {
                defaultValue: 'Log at least 2 categories today to earn the bronze cup!',
              })}
            </AppText>
          )}

          {isComplete && (
            <AppText style={styles.completeText}>
              {t('profile.dailyTrophy.complete', {
                defaultValue: 'Tuyệt vời! Hoàn thành hôm nay 🎉',
              })}
            </AppText>
          )}
        </View>

        {/* Category breakdown */}
        <View style={styles.categoryRow}>
          {CATEGORIES.map(cat => {
            const done = status[cat.key];
            return (
              <View key={cat.key} style={styles.categoryItem}>
                <View
                  style={[
                    styles.categoryBadge,
                    done ? styles.categoryBadgeDone : styles.categoryBadgePending,
                  ]}
                >
                  <MaterialCommunityIcons
                    name={done ? 'check-bold' : cat.icon}
                    size={20}
                    color={done ? COLORS.white : COLORS.textTertiary}
                  />
                </View>
                <AppText
                  style={[
                    styles.categoryLabel,
                    done && styles.categoryLabelDone,
                  ]}
                >
                  {t(cat.labelKey, { defaultValue: cat.key })}
                </AppText>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surfaceRaised,
    borderRadius: BORDER_RADIUS.card,
    overflow: 'hidden',
    shadowColor: COLORS.shadowBase,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.09,
    shadowRadius: 12,
    elevation: 4,
  },
  headerBand: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xxs,
  },
  progressPillWrapper: {
    flexDirection: 'row',
  },
  progressPill: {
    borderRadius: 999,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
  },
  progressPillText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  body: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    paddingTop: SPACING.sm,
  },
  cupBlock: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  cupBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  cupBadgeNone: {
    backgroundColor: COLORS.primaryMuted,
  },
  tierLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    marginBottom: SPACING.xxs,
  },
  emptyText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.sm,
  },
  completeText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: SPACING.xxs,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.primaryMuted,
  },
  categoryItem: {
    alignItems: 'center',
    flex: 1,
  },
  categoryBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xxs,
  },
  categoryBadgeDone: {
    backgroundColor: COLORS.primary,
  },
  categoryBadgePending: {
    backgroundColor: COLORS.primaryMuted,
    opacity: 0.65,
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
