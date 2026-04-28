import React, { useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components';
import { RootStackParamList } from '@/navigation';
import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from '@/theme';

interface DailyLogsSectionProps {
  targetProfileId: string;
  isOwnProfile: boolean;
}

type NavProp = NavigationProp<RootStackParamList>;

const DailyLogsSection: React.FC<DailyLogsSectionProps> = ({
  targetProfileId: _targetProfileId,
  isOwnProfile,
}) => {
  const navigation = useNavigation<NavProp>();
  const { t } = useTranslation();

  const handleSleepPress = useCallback(() => {
    if (isOwnProfile) {
      navigation.navigate('SleepMain');
    }
  }, [isOwnProfile, navigation]);

  const handleDiaryPress = useCallback(() => {
    if (isOwnProfile) {
      navigation.navigate('DiaryOverview');
    }
  }, [isOwnProfile, navigation]);

  const handleFoodPress = useCallback(() => {
    if (isOwnProfile) {
      navigation.navigate('FoodMain');
    }
  }, [isOwnProfile, navigation]);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <AppText style={styles.sectionTitle}>
          {t('home.overview.dailyLogsTitle')}
        </AppText>
        {!isOwnProfile && (
          <View style={styles.viewOnlyBadge}>
            <AppText style={styles.viewOnlyText}>Chỉ xem</AppText>
          </View>
        )}
      </View>

      {/* Sleep Card */}
      <Pressable
        style={[styles.logCard, !isOwnProfile && styles.logCardReadOnly]}
        onPress={handleSleepPress}
        android_ripple={isOwnProfile ? { color: COLORS.rippleDarkSoft } : null}>
        <View style={styles.logCardContent}>
          <View style={[styles.iconContainer, styles.iconPurple]}>
            <MaterialCommunityIcons
              name="moon-waning-crescent"
              size={24}
              color={COLORS.sleepHeaderPurple}
            />
          </View>
          <View style={styles.logCardText}>
            <AppText style={styles.logCardTitle}>
              {t('home.overview.sleepCardTitle')}
            </AppText>
          </View>
        </View>
        {isOwnProfile && (
          <MaterialCommunityIcons
            name="chevron-right"
            size={20}
            color={COLORS.textSecondary}
          />
        )}
      </Pressable>

      {/* Diary Card */}
      <Pressable
        style={[styles.logCard, !isOwnProfile && styles.logCardReadOnly]}
        onPress={handleDiaryPress}
        android_ripple={isOwnProfile ? { color: COLORS.rippleDarkSoft } : null}>
        <View style={styles.logCardContent}>
          <View style={[styles.iconContainer, styles.iconOrange]}>
            <Feather name="file-text" size={24} color={COLORS.accentNegative} />
          </View>
          <View style={styles.logCardText}>
            <AppText style={styles.logCardTitle}>
              {t('home.overview.diaryCardTitle')}
            </AppText>
          </View>
        </View>
        {isOwnProfile && (
          <MaterialCommunityIcons
            name="chevron-right"
            size={20}
            color={COLORS.textSecondary}
          />
        )}
      </Pressable>

      {/* Food Card */}
      <Pressable
        style={[styles.logCard, !isOwnProfile && styles.logCardReadOnly]}
        onPress={handleFoodPress}
        android_ripple={isOwnProfile ? { color: COLORS.rippleDarkSoft } : null}>
        <View style={styles.logCardContent}>
          <View style={[styles.iconContainer, styles.iconYellow]}>
            <MaterialCommunityIcons name="apple" size={24} color="#FFC107" />
          </View>
          <View style={styles.logCardText}>
            <AppText style={styles.logCardTitle}>
              {t('home.overview.foodCardTitle')}
            </AppText>
          </View>
        </View>
        {isOwnProfile && (
          <MaterialCommunityIcons
            name="chevron-right"
            size={20}
            color={COLORS.textSecondary}
          />
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: SPACING.sectionGap,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  viewOnlyBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.chip,
    backgroundColor: COLORS.inputBackground,
  },
  viewOnlyText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  logCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  logCardReadOnly: {
    opacity: 0.85,
  },
  logCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.md,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconPurple: {
    backgroundColor: '#EDD5FF',
  },
  iconOrange: {
    backgroundColor: '#FFE5CC',
  },
  iconYellow: {
    backgroundColor: '#FFF8DC',
  },
  logCardText: {
    flex: 1,
  },
  logCardTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
});

export default DailyLogsSection;
