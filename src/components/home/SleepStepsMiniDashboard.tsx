import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components';
import { RootStackParamList } from '@/navigation';
import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from '@/theme';

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

const MAX_BAR_HOURS = 9;
const BAR_AREA_HEIGHT = 44;
const BAR_MAX_HEIGHT = 34;

const formatSteps = (value: number): string => value.toLocaleString('en-US');

interface BarChartProps {
  ratios: number[];
  color: string;
  labels: string[];
}

const BarChart: React.FC<BarChartProps> = ({ ratios, color, labels }) => (
  <View>
    <View style={styles.barsRow}>
      {ratios.map((ratio, i) => {
        const clamped = Math.min(1, Math.max(0, ratio));
        const barHeight = Math.max(6, clamped * BAR_MAX_HEIGHT);
        const opacity = 0.55 + clamped * 0.4;
        return (
          <View key={i} style={styles.barColumn}>
            <View
              style={[styles.bar, { height: barHeight, opacity, backgroundColor: color }]}
            />
          </View>
        );
      })}
    </View>
    <View style={styles.labelsRow}>
      {labels.map((label, i) => (
        <AppText key={i} style={styles.dayLabel}>
          {label}
        </AppText>
      ))}
    </View>
  </View>
);

interface SleepStepsMiniDashboardProps {
  hours: number[];
  avg: number;
  days: number[];
  today: number;
  goal: number;
}

const SleepStepsMiniDashboard: React.FC<SleepStepsMiniDashboardProps> = ({
  hours,
  avg,
  days,
  today,
  goal,
}) => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const dayLabels = getLast7DayLabels();

  const safeHours = hours.length === 7 ? hours : Array(7).fill(0);
  const sleepRatios = safeHours.map(h => h / MAX_BAR_HOURS);

  const safeDays = days.length === 7 ? days : Array(7).fill(0);
  const safeGoal = goal > 0 ? goal : 1;
  const stepRatios = safeDays.map(s => s / safeGoal);

  return (
    <View style={styles.card}>
      {/* Sleep section */}
      <Pressable style={styles.section} onPress={() => navigation.navigate('SleepMain')}>
        <View style={styles.headerRow}>
          <View style={[styles.iconBox, { backgroundColor: COLORS.sleepPurpleSoft }]}>
            <MaterialCommunityIcons
              name="weather-night"
              size={20}
              color={COLORS.sleepHeaderPurple}
            />
          </View>
          <View style={styles.headerText}>
            <AppText style={styles.title}>{t('home.dashboards.sleep.title')}</AppText>
            <AppText style={styles.subtitle}>
              {t('home.dashboards.sleep.subtitle', { avg: avg.toFixed(1) })}
            </AppText>
          </View>
          <MaterialCommunityIcons
            name="chevron-right"
            size={20}
            color={COLORS.textTertiary}
          />
        </View>
        <BarChart ratios={sleepRatios} color={COLORS.sleepHeaderPurple} labels={dayLabels} />
      </Pressable>

      <View style={styles.divider} />

      {/* Steps section */}
      <Pressable style={styles.section} onPress={() => navigation.navigate('StepMain')}>
        <View style={styles.headerRow}>
          <View style={[styles.iconBox, { backgroundColor: COLORS.stepsTealSoft }]}>
            <MaterialCommunityIcons
              name="shoe-print"
              size={20}
              color={COLORS.stepsHeaderTeal}
            />
          </View>
          <View style={styles.headerText}>
            <AppText style={styles.title}>{t('home.dashboards.steps.title')}</AppText>
            <AppText style={styles.subtitle}>
              {t('home.dashboards.steps.subtitle', {
                count: formatSteps(today),
                goal: formatSteps(goal),
              })}
            </AppText>
          </View>
          <MaterialCommunityIcons
            name="chevron-right"
            size={20}
            color={COLORS.textTertiary}
          />
        </View>
        <BarChart ratios={stepRatios} color={COLORS.stepsHeaderTeal} labels={dayLabels} />
      </Pressable>
    </View>
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
  section: {
    gap: 0,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderSubtle,
    marginVertical: SPACING.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    height: BAR_AREA_HEIGHT,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  labelsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  dayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textTertiary,
  },
});

export default SleepStepsMiniDashboard;
