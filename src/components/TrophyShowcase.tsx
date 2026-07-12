import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from '@/theme';
import AppText from './AppText';

type TrophyTier = 'starter' | 'glow' | 'bronze' | 'silver' | 'gold';

interface TrophyDescriptor {
  tier: TrophyTier;
  threshold: number;
  color: string;
  ringColor: string;
  icon: string;
  labelKey: string;
}

const TROPHY_TIERS: TrophyDescriptor[] = [
  {
    tier: 'starter',
    threshold: 3,
    color: '#A1887F',
    ringColor: '#EDE3DE',
    icon: 'seed-outline',
    labelKey: 'profile.trophy.starter',
  },
  {
    tier: 'glow',
    threshold: 5,
    color: '#26C6DA',
    ringColor: '#D4F3F7',
    icon: 'star-shooting',
    labelKey: 'profile.trophy.glow',
  },
  {
    tier: 'bronze',
    threshold: 7,
    color: '#CD7F32',
    ringColor: '#F4D9B8',
    icon: 'trophy',
    labelKey: 'profile.trophy.bronze',
  },
  {
    tier: 'silver',
    threshold: 14,
    color: '#9AA0A6',
    ringColor: '#E4E6EB',
    icon: 'trophy',
    labelKey: 'profile.trophy.silver',
  },
  {
    tier: 'gold',
    threshold: 30,
    color: '#F2B400',
    ringColor: '#FFEFB8',
    icon: 'trophy-award',
    labelKey: 'profile.trophy.gold',
  },
];

interface TrophyShowcaseProps {
  longestCount: number;
}

const TrophyShowcase: React.FC<TrophyShowcaseProps> = ({ longestCount }) => {
  const { t } = useTranslation();

  const earnedTrophies = useMemo(
    () => TROPHY_TIERS.filter(trophy => longestCount >= trophy.threshold),
    [longestCount],
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <AppText style={styles.title}>
          {t('profile.trophy.title', { defaultValue: 'Trophies' })}
        </AppText>
        <AppText style={styles.subtitle}>
          {t('profile.trophy.longestStreak', {
            defaultValue: 'Longest streak: {{count}} days',
            count: longestCount,
          })}
        </AppText>
      </View>

      {earnedTrophies.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons
            name="trophy-outline"
            size={28}
            color={COLORS.textTertiary}
          />
          <AppText style={styles.emptyText}>
            {t('profile.trophy.empty', {
              defaultValue: 'Cố lên nhé — cúp đầu tiên chỉ cách bạn 3 ngày!',
            })}
          </AppText>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.trophyRow}
        >
          {earnedTrophies.map(trophy => (
            <View key={trophy.tier} style={styles.trophyItem}>
              <View
                style={[
                  styles.trophyBadge,
                  { backgroundColor: trophy.ringColor },
                ]}
              >
                <MaterialCommunityIcons
                  name={trophy.icon}
                  size={28}
                  color={trophy.color}
                />
              </View>
              <AppText style={styles.trophyLabel}>
                {t(trophy.labelKey, {
                  defaultValue:
                    trophy.tier.charAt(0).toUpperCase() + trophy.tier.slice(1),
                })}
              </AppText>
              <AppText style={styles.trophyThreshold}>
                {`${trophy.threshold}+`}
              </AppText>
            </View>
          ))}
        </ScrollView>
      )}
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
  trophyRow: {
    flexDirection: 'row',
    paddingVertical: SPACING.xs,
    gap: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  trophyItem: {
    alignItems: 'center',
    width: 68,
  },
  trophyBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  trophyLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.text,
  },
  trophyThreshold: {
    fontSize: 11,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  emptyState: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  emptyText: {
    flex: 1,
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
});

export default TrophyShowcase;
