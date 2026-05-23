import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components';
import { RootStackParamList } from '@/navigation';
import { HomeDashboardData } from '@/hooks/useHomeDashboardData';
import { COLORS, FONT_SIZES, SPACING } from '@/theme';

import DiaryMiniDashboard from './DiaryMiniDashboard';
import NutritionMiniDashboard from './NutritionMiniDashboard';
import SleepMiniDashboard from './SleepMiniDashboard';

interface MiniDashboardsSectionProps {
  data: HomeDashboardData;
}

const MiniDashboardsSection: React.FC<MiniDashboardsSectionProps> = ({ data }) => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <AppText style={styles.sectionTitle}>
          {t('home.dashboards.sectionTitle')}
        </AppText>
        <Pressable onPress={() => navigation.navigate('DiaryOverview')}>
          <AppText style={styles.seeAll}>{t('home.dashboards.seeAll')}</AppText>
        </Pressable>
      </View>

      <SleepMiniDashboard hours={data.sleep.hours} avg={data.sleep.avg} />
      <DiaryMiniDashboard moods={data.diary.moods} streak={data.diary.streak} />
      <NutritionMiniDashboard
        waterCups={data.nutrition.waterCups}
        waterGoal={data.nutrition.waterGoal}
        weekScore={data.nutrition.weekScore}
        status={data.nutrition.status}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  seeAll: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default MiniDashboardsSection;
