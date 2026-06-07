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

const BAR_AREA_HEIGHT = 48;
const BAR_MAX_HEIGHT = 36;

interface BreathingMiniDashboardProps {
  minutes: number[];
  today: number;
  goalMinutes: number;
}

const BreathingMiniDashboard: React.FC<BreathingMiniDashboardProps> = ({
  minutes,
  today,
  goalMinutes,
}) => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const safeDays = minutes.length === 7 ? minutes : Array(7).fill(0);
  const safeGoal = goalMinutes > 0 ? goalMinutes : 1;
  const dayLabels = getLast7DayLabels();

  return (
    <Pressable style={styles.card} onPress={() => navigation.navigate('BreathingMain')}>
      <View style={styles.headerRow}>
        <View style={styles.iconBox}>
          <MaterialCommunityIcons
            name="meditation"
            size={22}
            color={COLORS.breathingHeader}
          />
        </View>
        <View style={styles.headerText}>
          <AppText style={styles.title}>
            {t('home.dashboards.breathing.title')}
          </AppText>
          <AppText style={styles.subtitle}>
            {t('home.dashboards.breathing.subtitle', {
              count: today,
              goal: goalMinutes,
            })}
          </AppText>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.textTertiary} />
      </View>

      <View style={styles.barsRow}>
        {safeDays.map((value, i) => {
          const ratio = Math.min(1, value / safeGoal);
          const barHeight = Math.max(6, ratio * BAR_MAX_HEIGHT);
          const opacity = 0.55 + ratio * 0.4;
          return (
            <View key={i} style={styles.barColumn}>
              <View
                style={[
                  styles.bar,
                  {
                    height: barHeight,
                    opacity,
                  },
                ]}
              />
            </View>
          );
        })}
      </View>
      <View style={styles.labelsRow}>
        {dayLabels.map((label, i) => (
          <AppText key={i} style={styles.dayLabel}>{label}</AppText>
        ))}
      </View>
    </Pressable>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: 14,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.breathingSoft,
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
    backgroundColor: COLORS.breathingHeader,
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

export default BreathingMiniDashboard;
