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

import { foodApi } from '@/api';
import { SATIETY_UI_MAP } from '@/constants';
import { COLORS } from '@/theme';
import { TrackingStackParamList } from '@/navigation';
import { FoodLogResponse } from '@/types';
import {
  endOfWeekSunday,
  formatWeekRangeLabel,
  isSameDate,
  shiftWeek,
  startOfWeekMonday,
} from '@/utils';
import { styles } from '@/screens/tracking/food/FoodOverviewScreen.styles';

type FoodDayStat = {
  dayIndex: number;
  label: string;
  satietyLevel: string | null;
};

const EMPTY_BAR_HEIGHT_PERCENT = 0;
const MAX_SATIETY_LEVEL = 6;
const CHART_LEVELS: number[] = [5, 4, 3, 2, 1, 0];
const SATIETY_LEGEND_ORDER: string[] = [
  'ENERGIZED',
  'NORMAL',
  'INDULGENT',
  'OVERATE',
  'SKIPPED',
];

const toPercent = (value: number): `${number}%` => {
  return `${value}%`;
};

const calculateBarHeight = (satietyValue: number | null): `${number}%` => {
  if (!satietyValue || satietyValue <= 0) {
    return toPercent(EMPTY_BAR_HEIGHT_PERCENT);
  }

  const boundedValue = Math.min(MAX_SATIETY_LEVEL, Math.max(1, satietyValue));
  return toPercent((boundedValue / MAX_SATIETY_LEVEL) * 100);
};

const parseLogDate = (log: FoodLogResponse): Date => {
  return new Date(log.createdAt);
};

const SATIETY_LEVEL_TRANSLATION_KEYS: Record<string, string> = {
  ENERGIZED: 'food.satiety.energized',
  NORMAL: 'food.satiety.normal',
  INDULGENT: 'food.satiety.indulgent',
  OVERATE: 'food.satiety.overate',
  SKIPPED: 'food.satiety.skipped',
};

const WEEKDAY_TRANSLATION_KEYS: string[] = [
  'food.overview.weekdayMon',
  'food.overview.weekdayTue',
  'food.overview.weekdayWed',
  'food.overview.weekdayThu',
  'food.overview.weekdayFri',
  'food.overview.weekdaySat',
  'food.overview.weekdaySun',
];

const FoodOverviewScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<TrackingStackParamList>>();
  const { t } = useTranslation();

  const [allLogs, setAllLogs] = useState<FoodLogResponse[]>([]);
  const [selectedWeekStart, setSelectedWeekStart] = useState<Date>(
    startOfWeekMonday(new Date()),
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const loadLogs = async (): Promise<void> => {
      try {
        const logs = await foodApi.getAllFoodLogs();
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

  const weeklyLogs = useMemo<FoodLogResponse[]>(() => {
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

  const todayStatus = useMemo<{ label: string; icon: string } | null>(() => {
    if (weeklyLogs.length === 0) {
      return null;
    }

    const mostRecentLog = weeklyLogs.reduce((latest, current) => {
      const latestDate = parseLogDate(latest);
      const currentDate = parseLogDate(current);
      return currentDate > latestDate ? current : latest;
    });

    const satietyLevelKey =
      SATIETY_LEVEL_TRANSLATION_KEYS[mostRecentLog.satietyLevel];
    const satietyUi = SATIETY_UI_MAP[mostRecentLog.satietyLevel];
    if (!satietyUi || !satietyLevelKey) {
      return null;
    }

    return {
      label: t(satietyLevelKey),
      icon: satietyUi.icon,
    };
  }, [t, weeklyLogs]);

  const dayStats = useMemo<FoodDayStat[]>(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const dayDate = new Date(selectedWeekStart);
      dayDate.setDate(selectedWeekStart.getDate() + index);

      const dayLogs = weeklyLogs.filter(log => {
        const logDate = parseLogDate(log);
        return isSameDate(logDate, dayDate);
      });

      let selectedSatietyLevel: string | null = null;

      if (dayLogs.length > 0) {
        const mostRecentLog = dayLogs.reduce((latest, current) => {
          const latestDate = parseLogDate(latest);
          const currentDate = parseLogDate(current);
          return currentDate > latestDate ? current : latest;
        });

        selectedSatietyLevel = mostRecentLog.satietyLevel;
      }

      return {
        dayIndex: index,
        label: t(WEEKDAY_TRANSLATION_KEYS[index]),
        satietyLevel: selectedSatietyLevel,
      };
    });
  }, [selectedWeekStart, t, weeklyLogs]);

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
                  {t('food.overview.headerTitle')}
                </AppText>
              </View>

              <AppText style={styles.headerSubtitle}>
                {t('food.overview.subtitle')}
              </AppText>

              <View style={styles.statusRow}>
                <View>
                  <AppText style={styles.statusLabel}>
                    {todayStatus?.label ?? t('food.overview.noData')}
                  </AppText>
                </View>
                <View style={styles.statusIconCircle}>
                  <MaterialCommunityIcons
                    name={todayStatus?.icon ?? 'emoticon-outline'}
                    size={40}
                    color={COLORS.textPrimary}
                  />
                </View>
              </View>
            </View>

            <View style={styles.body}>
              <View style={styles.sectionHeader}>
                <AppText style={styles.sectionTitle}>
                  {t('food.overview.chartTitle')}
                </AppText>
                <Pressable hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Feather
                    name="more-vertical"
                    size={18}
                    color={COLORS.textPrimary}
                  />
                </Pressable>
              </View>

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
                      {t('food.overview.loading')}
                    </AppText>
                  </View>
                ) : (
                  <View style={styles.chartArea}>
                    <View style={styles.chartInner}>
                      <View style={styles.yAxis}>
                        {CHART_LEVELS.map(level => (
                          <AppText key={level} style={styles.yAxisLabel}>
                            {level}
                          </AppText>
                        ))}
                      </View>

                      <View style={styles.plotArea}>
                        <View style={styles.gridOverlay}>
                          {CHART_LEVELS.map(level => (
                            <View key={level} style={styles.gridLine} />
                          ))}
                        </View>

                        <View style={styles.barsRow}>
                          {dayStats.map(day => {
                            const satietyUi = day.satietyLevel
                              ? SATIETY_UI_MAP[day.satietyLevel]
                              : undefined;
                            const barColor =
                              satietyUi?.color ?? COLORS.foodChartEmpty;
                            const iconName = satietyUi?.icon;

                            return (
                              <View key={day.dayIndex} style={styles.column}>
                                <View
                                  style={[
                                    styles.bar,
                                    {
                                      height: calculateBarHeight(
                                        satietyUi?.value ?? null,
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
                      {SATIETY_LEGEND_ORDER.map(level => {
                        const satietyUi = SATIETY_UI_MAP[level];
                        const satietyLabelKey =
                          SATIETY_LEVEL_TRANSLATION_KEYS[level];

                        if (!satietyUi || !satietyLabelKey) {
                          return null;
                        }

                        return (
                          <View key={level} style={styles.legendItem}>
                            <View
                              style={[
                                styles.legendDot,
                                { backgroundColor: satietyUi.color },
                              ]}
                            />
                            <AppText style={styles.legendText}>
                              {satietyUi.value}. {t(satietyLabelKey)}
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
            onPress={() => navigation.navigate('FoodEntry')}
          >
            <Feather name="plus" size={26} color={COLORS.white} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default FoodOverviewScreen;
