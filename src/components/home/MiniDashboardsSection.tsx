import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components';
import { HomeDashboardData } from '@/hooks/useHomeDashboardData';
import { COLORS, SPACING } from '@/theme';

import DiaryMiniDashboard from './DiaryMiniDashboard';
import NutritionMiniDashboard from './NutritionMiniDashboard';
import SleepMiniDashboard from './SleepMiniDashboard';
import StepsMiniDashboard from './StepsMiniDashboard';

interface MiniDashboardsSectionProps {
  data: HomeDashboardData;
}

const MiniDashboardsSection: React.FC<MiniDashboardsSectionProps> = ({ data }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <AppText style={styles.sectionTitle}>
          {t('home.dashboards.sectionTitle')}
        </AppText>
      </View>

      <SleepMiniDashboard hours={data.sleep.hours} avg={data.sleep.avg} />
      <StepsMiniDashboard
        days={data.steps.days}
        today={data.steps.today}
        goal={data.steps.goal}
      />
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
});

export default MiniDashboardsSection;
