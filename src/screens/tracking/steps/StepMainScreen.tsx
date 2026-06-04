import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
  useWindowDimensions,
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { stepsApi } from '@/api';
import { AppText } from '@/components';
import { AuthContext } from '@/context/AuthContext';
import { STEPS_DAILY_GOAL } from '@/hooks/useHomeDashboardData';
import { RootStackParamList } from '@/navigation';
import {
  getTodaySteps,
  requestPermission,
  subscribe,
  syncTodaySteps,
} from '@/services/stepTracker';
import { COLORS, SPACING } from '@/theme';
import { StepLogResponse } from '@/types';
import { endOfWeekSunday, isSameDate, startOfWeekMonday } from '@/utils';
import { styles } from './StepMainScreen.styles';

// Rough estimates: ~0.8 m per step, ~0.04 kcal per step.
const KM_PER_STEP = 0.0008;
const KCAL_PER_STEP = 0.04;

const WEEKDAY_LABEL_KEYS: string[] = [
  'steps.main.weekdayMon',
  'steps.main.weekdayTue',
  'steps.main.weekdayWed',
  'steps.main.weekdayThu',
  'steps.main.weekdayFri',
  'steps.main.weekdaySat',
  'steps.main.weekdaySun',
];

const hexToRgba = (hexColor: string, opacity: number): string => {
  const normalizedHex = hexColor.replace('#', '');
  const parsedHex = Number.parseInt(normalizedHex, 16);
  const red = (parsedHex >> 16) & 255;
  const green = (parsedHex >> 8) & 255;
  const blue = parsedHex & 255;
  return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
};

const formatDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateKey = (dateKey: string): Date => {
  const [year, month, day] = dateKey.split('-').map(part => Number(part));
  return new Date(year, month - 1, day);
};

const stepLogDate = (log: StepLogResponse): Date => {
  return log.entryDate
    ? parseDateKey(log.entryDate)
    : new Date(log.loggedAt ?? log.createdAt);
};

const stepLogSortValue = (log: StepLogResponse): number => {
  return new Date(log.updatedAt ?? log.createdAt).getTime();
};

const formatNumber = (value: number): string =>
  Math.round(value).toLocaleString('en-US');

const StepMainScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'StepMain'>>();
  const { userInfo } = useContext(AuthContext)!;
  const viewProfileId = route.params?.viewProfileId;
  const profileId = viewProfileId ?? userInfo?.profileId ?? '';
  const isOwnProfile = !viewProfileId;
  const { t } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();

  const [todaySteps, setTodaySteps] = useState<number>(0);
  const [weekLogs, setWeekLogs] = useState<StepLogResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const goal = STEPS_DAILY_GOAL;

  const weekStart = useMemo(() => startOfWeekMonday(new Date()), []);
  const weekEnd = useMemo(() => endOfWeekSunday(weekStart), [weekStart]);

  const fetchWeek = useCallback(async (): Promise<void> => {
    if (!profileId) return;
    try {
      const logs = await stepsApi.getStepLogsInRange(
        profileId,
        formatDateKey(weekStart),
        formatDateKey(weekEnd),
      );
      setWeekLogs(logs);
    } catch (error) {
      console.error('[StepMainScreen] Failed to load step logs:', error);
      setWeekLogs([]);
    }
  }, [profileId, weekStart, weekEnd]);

  // Initial load: permission -> live subscription -> sync -> fetch week.
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let isMounted = true;

    const init = async (): Promise<void> => {
      setIsLoading(true);

      if (isOwnProfile) {
        await requestPermission();

        const initialToday = await getTodaySteps();
        if (isMounted) setTodaySteps(initialToday);

        // Live updates while the screen is mounted.
        unsubscribe = subscribe(live => {
          if (isMounted) setTodaySteps(live);
        });

        // Push today's count to the backend (safe to call on mount).
        await syncTodaySteps(goal);
      }

      await fetchWeek();
      if (isMounted) setIsLoading(false);
    };

    void init();

    return () => {
      isMounted = false;
      unsubscribe?.();
    };
  }, [fetchWeek, goal, isOwnProfile]);

  const handleRefresh = useCallback(async (): Promise<void> => {
    setIsRefreshing(true);
    if (isOwnProfile) {
      const live = await getTodaySteps();
      setTodaySteps(live);
      await syncTodaySteps(goal);
    }
    await fetchWeek();
    setIsRefreshing(false);
  }, [fetchWeek, goal, isOwnProfile]);

  const weekTrend = useMemo<number[]>(() => {
    // Latest log per weekday (Mon..Sun) within the current week.
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);

      const dayLogs = weekLogs.filter(log =>
        isSameDate(stepLogDate(log), date),
      );
      const latest =
        dayLogs
          .slice()
          .sort((left, right) => stepLogSortValue(right) - stepLogSortValue(left))[0] ??
        null;

      let count = latest?.stepCount ?? 0;
      // Reflect the live sensor count for today's bar.
      if (isOwnProfile && isSameDate(date, new Date())) {
        count = Math.max(count, todaySteps);
      }
      return count;
    });
  }, [weekStart, weekLogs, todaySteps, isOwnProfile]);

  const hasWeekData = useMemo(
    () => weekTrend.some(value => value > 0),
    [weekTrend],
  );

  const weekTotal = useMemo(
    () => weekTrend.reduce((sum, value) => sum + value, 0),
    [weekTrend],
  );

  const weekAverage = useMemo(() => {
    const activeDays = weekTrend.filter(value => value > 0);
    if (activeDays.length === 0) return 0;
    return Math.round(weekTotal / activeDays.length);
  }, [weekTrend, weekTotal]);

  const weekBest = useMemo(
    () => weekTrend.reduce((max, value) => Math.max(max, value), 0),
    [weekTrend],
  );

  const progressRatio = Math.min(1, goal > 0 ? todaySteps / goal : 0);
  const remaining = Math.max(0, goal - todaySteps);
  const distanceKm = todaySteps * KM_PER_STEP;
  const calories = todaySteps * KCAL_PER_STEP;

  const chartWidth = Math.max(
    screenWidth - SPACING.screenHorizontal * 2 - 16,
    280,
  );

  const chartConfig = useMemo(
    () => ({
      backgroundColor: COLORS.surface,
      backgroundGradientFrom: COLORS.surface,
      backgroundGradientTo: COLORS.surface,
      decimalPlaces: 0,
      color: (opacity = 1): string => hexToRgba(COLORS.stepsHeaderTeal, opacity),
      labelColor: (opacity = 1): string =>
        hexToRgba(COLORS.textSecondary, opacity),
      barPercentage: 0.6,
      propsForBackgroundLines: {
        stroke: COLORS.borderSubtle,
        strokeDasharray: '4 6',
      },
      propsForLabels: {
        fontSize: 10,
      },
    }),
    [],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.stepsHeaderTeal}
            />
          }
        >
          <View style={styles.headerCard}>
            <View style={styles.headerTopRow}>
              <Pressable
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Feather name="chevron-left" size={22} color={COLORS.white} />
              </Pressable>

              <View style={styles.headerTitleBlock}>
                <AppText style={styles.headerTitle}>
                  {t('steps.main.headerTitle')}
                </AppText>
                <AppText style={styles.headerSubtitle}>
                  {t('steps.main.headerSubtitle')}
                </AppText>
              </View>
            </View>

            <View style={styles.heroBlock}>
              <AppText style={styles.heroLabel}>
                {t('steps.main.todayLabel')}
              </AppText>
              <AppText style={styles.heroValue}>{formatNumber(todaySteps)}</AppText>
              <AppText style={styles.heroGoal}>
                {t('steps.main.goalLabel', { goal: formatNumber(goal) })}
              </AppText>

              <View style={styles.progressTrack}>
                <View
                  style={[styles.progressFill, { width: `${progressRatio * 100}%` }]}
                />
              </View>

              <AppText style={styles.heroRemaining}>
                {remaining > 0
                  ? t('steps.main.remaining', { count: formatNumber(remaining) })
                  : t('steps.main.goalReached')}
              </AppText>

              <View style={styles.heroStatsRow}>
                <View style={styles.heroStatCard}>
                  <AppText style={styles.heroStatValue}>
                    {distanceKm.toFixed(2)} km
                  </AppText>
                  <AppText style={styles.heroStatLabel}>
                    {t('steps.main.distanceLabel')}
                  </AppText>
                </View>
                <View style={styles.heroStatCard}>
                  <AppText style={styles.heroStatValue}>
                    {formatNumber(calories)} kcal
                  </AppText>
                  <AppText style={styles.heroStatLabel}>
                    {t('steps.main.caloriesLabel')}
                  </AppText>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <AppText style={styles.sectionTitle}>
                  {t('steps.main.weeklyTitle')}
                </AppText>
                <AppText style={styles.sectionSubtitle}>
                  {t('steps.main.weeklySubtitle')}
                </AppText>
              </View>
            </View>

            {isLoading ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator color={COLORS.stepsHeaderTeal} />
                <AppText style={styles.loadingText}>
                  {t('steps.main.loading')}
                </AppText>
              </View>
            ) : !hasWeekData ? (
              <View style={styles.emptyChartState}>
                <MaterialCommunityIcons
                  name="shoe-print"
                  size={30}
                  color={COLORS.textSecondary}
                />
                <AppText style={styles.emptyStateText}>
                  {t('steps.main.noData')}
                </AppText>
              </View>
            ) : (
              <BarChart
                data={{
                  labels: WEEKDAY_LABEL_KEYS.map(key => t(key)),
                  datasets: [{ data: weekTrend }],
                }}
                width={chartWidth}
                height={220}
                fromZero
                segments={4}
                yAxisLabel=""
                yAxisSuffix=""
                withInnerLines
                showValuesOnTopOfBars={false}
                chartConfig={chartConfig}
                style={styles.chart}
              />
            )}

            <View style={styles.summaryRow}>
              <View style={styles.summaryCard}>
                <AppText style={styles.summaryValue}>
                  {formatNumber(weekAverage)}
                </AppText>
                <AppText style={styles.summaryLabel}>
                  {t('steps.main.averageLabel')}
                </AppText>
              </View>
              <View style={styles.summaryCard}>
                <AppText style={styles.summaryValue}>
                  {formatNumber(weekTotal)}
                </AppText>
                <AppText style={styles.summaryLabel}>
                  {t('steps.main.totalLabel')}
                </AppText>
              </View>
              <View style={styles.summaryCard}>
                <AppText style={styles.summaryValue}>
                  {formatNumber(weekBest)}
                </AppText>
                <AppText style={styles.summaryLabel}>
                  {t('steps.main.bestLabel')}
                </AppText>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default StepMainScreen;
