import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { AppText } from '@/components';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';

import { sleepApi } from '@/api';
import { SLEEP_QUALITY_UI_MAP } from '@/constants';
import { COLORS } from '@/theme';
import { TrackingStackParamList } from '@/navigation';
import { SleepLogResponse } from '@/types';
import {
  endOfWeekSunday,
  formatWeekRangeLabel,
  isSameDate,
  shiftWeek,
  startOfWeekMonday,
} from '@/utils';
import { styles } from '@/screens/tracking/sleep/SleepOverviewScreen.styles';

type SleepDayStat = {
  dayIndex: number;
  label: string;
  durationMinutes: number | null;
  sleepQuality: number | null;
};

const MAX_CHART_DURATION_MINUTES = 600;
const CHART_DURATION_LEVELS: number[] = [600, 480, 360, 240, 120, 0];
const SLEEP_QUALITY_LEGEND_ORDER: number[] = [5, 4, 3, 2, 1];
const SLEEP_QUALITY_TRANSLATION_KEYS: Record<number, string> = {
  5: 'sleep.entry.quality.excellent.title',
  4: 'sleep.entry.quality.good.title',
  3: 'sleep.entry.quality.neutral.title',
  2: 'sleep.entry.quality.bad.title',
  1: 'sleep.entry.quality.terrible.title',
};

const WEEKDAY_TRANSLATION_KEYS: string[] = [
  'sleep.overview.weekdayMon',
  'sleep.overview.weekdayTue',
  'sleep.overview.weekdayWed',
  'sleep.overview.weekdayThu',
  'sleep.overview.weekdayFri',
  'sleep.overview.weekdaySat',
  'sleep.overview.weekdaySun',
];

const formatAverageDuration = (
  minutes: number | null,
  formatter: (key: string, options?: Record<string, unknown>) => string,
): string => {
  if (minutes === null || minutes <= 0) {
    return formatter('sleep.overview.durationFormat', {
      hours: 0,
      minutes: '00',
    });
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return formatter('sleep.overview.durationFormat', {
    hours,
    minutes: remainingMinutes.toString().padStart(2, '0'),
  });
};

const toPercent = (value: number): `${number}%` => {
  return `${value}%`;
};

const calculateBarHeight = (durationMinutes: number | null): `${number}%` => {
  if (!durationMinutes || durationMinutes <= 0) {
    return toPercent(0);
  }

  const boundedMinutes = Math.min(
    MAX_CHART_DURATION_MINUTES,
    Math.max(0, durationMinutes),
  );
  const boundedPercent = (boundedMinutes / MAX_CHART_DURATION_MINUTES) * 100;

  return toPercent(boundedPercent);
};

const parseLogDate = (log: SleepLogResponse): Date => {
  return new Date(log.wakeTime);
};

const SleepOverviewScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<TrackingStackParamList>>();
  const { t } = useTranslation();

  const [allLogs, setAllLogs] = useState<SleepLogResponse[]>([]);
  const [selectedWeekStart, setSelectedWeekStart] = useState<Date>(
    startOfWeekMonday(new Date()),
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const loadLogs = async (): Promise<void> => {
      try {
        const logs = await sleepApi.getAllSleepLogs();
        if (!isMounted) {
          return;
        }

        setAllLogs(logs);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadLogs();

    return () => {
      isMounted = false;
    };
  }, []);

  const weeklyLogs = useMemo<SleepLogResponse[]>(() => {
    const weekEnd = endOfWeekSunday(selectedWeekStart);

    return allLogs.filter(log => {
      const logDate = parseLogDate(log);
      return logDate >= selectedWeekStart && logDate <= weekEnd;
    });
  }, [allLogs, selectedWeekStart]);

  const weekRangeLabel = useMemo(
    () => formatWeekRangeLabel(selectedWeekStart),
    [selectedWeekStart],
  );

  const dayStats = useMemo<SleepDayStat[]>(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const dayDate = new Date(selectedWeekStart);
      dayDate.setDate(selectedWeekStart.getDate() + index);

      const dayLog = weeklyLogs.find(log => {
        const logDate = parseLogDate(log);
        return isSameDate(logDate, dayDate);
      });

      return {
        dayIndex: index,
        label: t(WEEKDAY_TRANSLATION_KEYS[index]),
        durationMinutes: dayLog?.durationMinutes ?? null,
        sleepQuality: dayLog?.sleepQuality ?? null,
      };
    });
  }, [selectedWeekStart, t, weeklyLogs]);

  const averageDurationMinutes = useMemo<number | null>(() => {
    if (weeklyLogs.length === 0) {
      return null;
    }

    const totalMinutes = weeklyLogs.reduce(
      (sum, log) => sum + (log.durationMinutes ?? 0),
      0,
    );
    return Math.round(totalMinutes / weeklyLogs.length);
  }, [weeklyLogs]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.root}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.headerWrap}>
              <View style={styles.headerTopRow}>
                <Pressable
                  style={styles.backButton}
                  onPress={() => navigation.goBack()}
                >
                  <Feather name="chevron-left" size={22} color={COLORS.white} />
                </Pressable>
                <AppText style={styles.headerTitle}>
                  {t('sleep.overview.headerTitle')}
                </AppText>
              </View>

              <AppText style={styles.averageValue}>
                {formatAverageDuration(averageDurationMinutes, t)}
              </AppText>
              <AppText style={styles.averageSubtitle}>
                {t('sleep.overview.subtitle')}
              </AppText>
            </View>

            <View style={styles.body}>
              <AppText style={styles.sectionTitle}>
                {t('sleep.overview.chartTitle')}
              </AppText>

              <View style={styles.weekNavigatorRow}>
                <Pressable
                  style={styles.weekNavButton}
                  onPress={() =>
                    setSelectedWeekStart(previous => shiftWeek(previous, -1))
                  }
                >
                  <Feather
                    name="chevron-left"
                    size={18}
                    color={COLORS.textPrimary}
                  />
                </Pressable>
                <AppText style={styles.weekRangeLabel}>
                  {weekRangeLabel}
                </AppText>
                <Pressable
                  style={styles.weekNavButton}
                  onPress={() =>
                    setSelectedWeekStart(previous => shiftWeek(previous, 1))
                  }
                >
                  <Feather
                    name="chevron-right"
                    size={18}
                    color={COLORS.textPrimary}
                  />
                </Pressable>
              </View>

              <View style={styles.chartCard}>
                {isLoading ? (
                  <View style={styles.loadingWrap}>
                    <ActivityIndicator color={COLORS.primary} />
                    <AppText style={styles.loadingText}>
                      {t('sleep.overview.loading')}
                    </AppText>
                  </View>
                ) : (
                  <View style={styles.chartArea}>
                    <View style={styles.chartInner}>
                      <View style={styles.yAxis}>
                        {CHART_DURATION_LEVELS.map(level => (
                          <AppText key={level} style={styles.yAxisLabel}>
                            {Math.floor(level / 60)}h
                          </AppText>
                        ))}
                      </View>

                      <View style={styles.plotArea}>
                        <View style={styles.gridOverlay}>
                          {CHART_DURATION_LEVELS.map(level => (
                            <View key={level} style={styles.gridLine} />
                          ))}
                        </View>

                        <View style={styles.barsRow}>
                          {dayStats.map(day => {
                            const qualityUi = day.sleepQuality
                              ? SLEEP_QUALITY_UI_MAP[day.sleepQuality]
                              : undefined;
                            const barColor =
                              qualityUi?.color ?? COLORS.sleepChartEmpty;
                            const iconName = qualityUi?.icon;

                            return (
                              <View key={day.dayIndex} style={styles.column}>
                                <View
                                  style={[
                                    styles.bar,
                                    {
                                      height: calculateBarHeight(
                                        day.durationMinutes,
                                      ),
                                      backgroundColor: barColor,
                                    },
                                  ]}
                                >
                                  {iconName ? (
                                    <MaterialCommunityIcons
                                      name={iconName}
                                      size={18}
                                      color={COLORS.textPrimary}
                                    />
                                  ) : null}
                                </View>
                                <AppText style={styles.dayLabel}>
                                  {day.label}
                                </AppText>
                              </View>
                            );
                          })}
                        </View>
                      </View>
                    </View>

                    <View style={styles.legendWrap}>
                      {SLEEP_QUALITY_LEGEND_ORDER.map(level => {
                        const qualityUi = SLEEP_QUALITY_UI_MAP[level];
                        const qualityLabelKey =
                          SLEEP_QUALITY_TRANSLATION_KEYS[level];

                        if (!qualityUi || !qualityLabelKey) {
                          return null;
                        }

                        return (
                          <View key={level} style={styles.legendItem}>
                            <View
                              style={[
                                styles.legendDot,
                                { backgroundColor: qualityUi.color },
                              ]}
                            />
                            <AppText style={styles.legendText}>
                              {level}. {t(qualityLabelKey)}
                            </AppText>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>

          <Pressable
            style={styles.fab}
            onPress={() => navigation.navigate('SleepEntry')}
          >
            <Feather name="plus" size={26} color={COLORS.white} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SleepOverviewScreen;
