import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components';
import { HomeDashboardData } from '@/hooks/useHomeDashboardData';
import { COLORS, SPACING } from '@/theme';

import BreathingMiniDashboard from './BreathingMiniDashboard';
import DiaryMiniDashboard from './DiaryMiniDashboard';
import NutritionMiniDashboard from './NutritionMiniDashboard';
import SleepMiniDashboard from './SleepMiniDashboard';
import StepsMiniDashboard from './StepsMiniDashboard';
import SupportMiniDashboard from './SupportMiniDashboard';
import TreasureMiniDashboard from './TreasureMiniDashboard';

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

      <TreasureMiniDashboard />
      <SleepMiniDashboard hours={data.sleep.hours} avg={data.sleep.avg} />
      <StepsMiniDashboard
        days={data.steps.days}
        today={data.steps.today}
        goal={data.steps.goal}
      />
      <BreathingMiniDashboard
        minutes={data.breathing.minutes}
        today={data.breathing.today}
        goalMinutes={data.breathing.goalMinutes}
      />
      <DiaryMiniDashboard moods={data.diary.moods} streak={data.diary.streak} />
      <NutritionMiniDashboard
        waterLiters={data.nutrition.waterLiters}
        waterGoal={data.nutrition.waterGoal}
        weekScore={data.nutrition.weekScore}
        status={data.nutrition.status}
      />
      <SupportMiniDashboard />
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
