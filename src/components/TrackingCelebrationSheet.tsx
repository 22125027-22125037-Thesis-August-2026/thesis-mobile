import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from '@/theme';
import { CelebrationStatus } from '@/utils';
import AppText from './AppText';

type Tier = 'none' | 'bronze' | 'silver' | 'gold';

const TIER_CFG: Record<
  Exclude<Tier, 'none'>,
  { color: string; ringColor: string; labelKey: string }
> = {
  bronze: {
    color: '#CD7F32',
    ringColor: '#F4D9B8',
    labelKey: 'profile.dailyTrophy.bronze',
  },
  silver: {
    color: '#9AA0A6',
    ringColor: '#E4E6EB',
    labelKey: 'profile.dailyTrophy.silver',
  },
  gold: {
    color: '#F2B400',
    ringColor: '#FFEFB8',
    labelKey: 'profile.dailyTrophy.gold',
  },
};

const resolveTier = (count: number): Tier => {
  if (count >= 4) return 'gold';
  if (count >= 3) return 'silver';
  if (count >= 2) return 'bronze';
  return 'none';
};

interface CategoryInfo {
  key: keyof Omit<CelebrationStatus, 'count'>;
  icon: string;
  labelKey: string;
}

const CATEGORIES: CategoryInfo[] = [
  { key: 'nutrition', icon: 'food-apple', labelKey: 'profile.dailyTrophy.nutrition' },
  { key: 'sleep', icon: 'sleep', labelKey: 'profile.dailyTrophy.sleep' },
  { key: 'diary', icon: 'notebook', labelKey: 'profile.dailyTrophy.diary' },
  { key: 'steps', icon: 'walk', labelKey: 'profile.dailyTrophy.steps' },
];

interface TrackingCelebrationSheetProps {
  visible: boolean;
  status: CelebrationStatus;
  onClose: () => void;
}

const TrackingCelebrationSheet: React.FC<TrackingCelebrationSheetProps> = ({
  visible,
  status,
  onClose,
}) => {
  const { t } = useTranslation();
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.6)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const tier = resolveTier(status.count);
  const hasTier = tier !== 'none';
  const tierCfg = hasTier ? TIER_CFG[tier] : null;

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(0);
      scaleAnim.setValue(0.6);
      progressAnim.setValue(0);

      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 1,
          friction: 7,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 60,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss progress bar (3.5 s)
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 3500,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) onClose();
      });
    } else {
      // Stop in-flight auto-dismiss if closed manually
      progressAnim.stopAnimation();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <Animated.View
          style={[
            styles.sheet,
            {
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [300, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Auto-dismiss progress bar at the top */}
          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>

          {/* Drag handle */}
          <View style={styles.handle} />

          {/* Trophy badge */}
          <Animated.View
            style={[styles.badgeWrapper, { transform: [{ scale: scaleAnim }] }]}
          >
            <View
              style={[
                styles.trophyBadge,
                hasTier
                  ? { backgroundColor: tierCfg!.ringColor }
                  : styles.trophyBadgeNone,
              ]}
            >
              <MaterialCommunityIcons
                name={hasTier ? 'trophy' : 'trophy-outline'}
                size={44}
                color={hasTier ? tierCfg!.color : COLORS.textTertiary}
              />
            </View>
          </Animated.View>

          {/* Heading */}
          {hasTier ? (
            <>
              <AppText style={[styles.tierLabel, { color: tierCfg!.color }]}>
                {t(tierCfg!.labelKey)}
              </AppText>
              <AppText style={styles.subtitle}>
                {t('profile.celebration.earned', {
                  defaultValue: 'Bạn đã đạt được hôm nay! 🎉',
                })}
              </AppText>
            </>
          ) : (
            <>
              <AppText style={styles.tierLabelNone}>
                {t('profile.celebration.progress', {
                  count: status.count,
                  defaultValue: '{{count}}/4 hạng mục',
                })}
              </AppText>
              <AppText style={styles.subtitle}>
                {t('profile.celebration.encourage', {
                  defaultValue: 'Tiếp tục để nhận cúp thưởng hôm nay!',
                })}
              </AppText>
            </>
          )}

          {/* Category chips */}
          <View style={styles.categoryRow}>
            {CATEGORIES.map(cat => {
              const done = status[cat.key];
              return (
                <View key={cat.key} style={styles.categoryChip}>
                  <View
                    style={[
                      styles.chipIcon,
                      done ? styles.chipIconDone : styles.chipIconPending,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={done ? 'check' : cat.icon}
                      size={16}
                      color={done ? COLORS.white : COLORS.textTertiary}
                    />
                  </View>
                  <AppText
                    style={[
                      styles.chipLabel,
                      done && styles.chipLabelDone,
                    ]}
                  >
                    {t(cat.labelKey, { defaultValue: cat.key })}
                  </AppText>
                </View>
              );
            })}
          </View>

          {/* Dismiss hint */}
          <Pressable onPress={onClose} style={styles.dismissRow}>
            <AppText style={styles.dismissText}>
              {t('profile.celebration.dismiss', { defaultValue: 'Chạm để đóng' })}
            </AppText>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.overlayDarkMedium,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.card,
    borderTopRightRadius: BORDER_RADIUS.card,
    paddingBottom: SPACING.xxl + SPACING.sm,
    alignItems: 'center',
    overflow: 'hidden',
  },
  progressTrack: {
    height: 3,
    width: '100%',
    backgroundColor: COLORS.primaryMuted,
  },
  progressFill: {
    height: 3,
    backgroundColor: COLORS.primary,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.textTertiary,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
    opacity: 0.4,
  },
  badgeWrapper: {
    marginBottom: SPACING.md,
  },
  trophyBadge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trophyBadgeNone: {
    backgroundColor: COLORS.primaryMuted,
  },
  tierLabel: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    marginBottom: SPACING.xxs,
  },
  tierLabelNone: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.xxs,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  categoryChip: {
    alignItems: 'center',
    flex: 1,
  },
  chipIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xxs,
  },
  chipIconDone: {
    backgroundColor: COLORS.primary,
  },
  chipIconPending: {
    backgroundColor: COLORS.primaryMuted,
    opacity: 0.6,
  },
  chipLabel: {
    fontSize: 11,
    color: COLORS.textTertiary,
    textAlign: 'center',
  },
  chipLabelDone: {
    color: COLORS.text,
    fontWeight: '600',
  },
  dismissRow: {
    paddingVertical: SPACING.xs,
  },
  dismissText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textTertiary,
  },
});

export default TrackingCelebrationSheet;
