import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components';
import { useTourTarget } from '@/components/tour';
import { TOUR_TARGETS } from '@/constants/tour';
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

  // Mỗi thẻ mới được đăng ký làm target riêng để tour giới thiệu từng tính năng.
  const treasureTarget = useTourTarget(TOUR_TARGETS.treasure);
  const stepsTarget = useTourTarget(TOUR_TARGETS.steps);
  const breathingTarget = useTourTarget(TOUR_TARGETS.breathing);
  const nutritionTarget = useTourTarget(TOUR_TARGETS.nutrition);
  const supportTarget = useTourTarget(TOUR_TARGETS.support);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <AppText style={styles.sectionTitle}>
          {t('home.dashboards.sectionTitle')}
        </AppText>
      </View>

      <View ref={treasureTarget.ref} onLayout={treasureTarget.onLayout} collapsable={false}>
        <TreasureMiniDashboard />
      </View>
      <SleepMiniDashboard hours={data.sleep.hours} avg={data.sleep.avg} />
      <View ref={stepsTarget.ref} onLayout={stepsTarget.onLayout} collapsable={false}>
        <StepsMiniDashboard
          days={data.steps.days}
          today={data.steps.today}
          goal={data.steps.goal}
        />
      </View>
      <View ref={breathingTarget.ref} onLayout={breathingTarget.onLayout} collapsable={false}>
        <BreathingMiniDashboard
          minutes={data.breathing.minutes}
          today={data.breathing.today}
          goalMinutes={data.breathing.goalMinutes}
        />
      </View>
      <DiaryMiniDashboard moods={data.diary.moods} streak={data.diary.streak} />
      <View ref={nutritionTarget.ref} onLayout={nutritionTarget.onLayout} collapsable={false}>
        <NutritionMiniDashboard
          waterLiters={data.nutrition.waterLiters}
          waterGoal={data.nutrition.waterGoal}
          weekScore={data.nutrition.weekScore}
          status={data.nutrition.status}
        />
      </View>
      <View ref={supportTarget.ref} onLayout={supportTarget.onLayout} collapsable={false}>
        <SupportMiniDashboard />
      </View>
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
