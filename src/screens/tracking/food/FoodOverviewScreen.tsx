import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { AppText } from '@/components';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { foodApi } from '@/api';
import { FOOD_WEEKDAY_LABELS, SATIETY_UI_MAP } from '@/constants';
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

const MIN_BAR_HEIGHT_PERCENT = 15;

const toPercent = (value: number): `${number}%` => {
  return `${value}%`;
};

const calculateBarHeight = (satietyLevel: string | null): `${number}%` => {
  if (!satietyLevel) {
    return toPercent(MIN_BAR_HEIGHT_PERCENT);
  }

  const satietyUi = SATIETY_UI_MAP[satietyLevel];
  if (!satietyUi) {
    return toPercent(MIN_BAR_HEIGHT_PERCENT);
  }

  const rawPercent = (satietyUi.value / 5) * 100;
  const boundedPercent = Math.min(100, Math.max(MIN_BAR_HEIGHT_PERCENT, rawPercent));

  return toPercent(boundedPercent);
};

const parseLogDate = (log: FoodLogResponse): Date => {
  return new Date(log.createdAt);
};

const FoodOverviewScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<TrackingStackParamList>>();

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

    const satietyUi = SATIETY_UI_MAP[mostRecentLog.satietyLevel];
    if (!satietyUi) {
      return null;
    }

    return {
      label: satietyUi.label,
      icon: satietyUi.icon,
    };
  }, [weeklyLogs]);

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
        label: FOOD_WEEKDAY_LABELS[index],
        satietyLevel: selectedSatietyLevel,
      };
    });
  }, [selectedWeekStart, weeklyLogs]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.root}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            <View style={styles.headerWrap}>
              <View style={styles.headerTopRow}>
                <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
                  <Feather name="chevron-left" size={22} color={COLORS.white} />
                </Pressable>
                <AppText style={styles.headerTitle}>Nhật ký dinh dưỡng</AppText>
              </View>

              <AppText style={styles.headerSubtitle}>
                Chất lượng ăn uống hôm nay của bạn
              </AppText>

              <View style={styles.statusRow}>
                <View>
                  <AppText style={styles.statusLabel}>
                    {todayStatus?.label ?? 'Chưa có dữ liệu'}
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
                <AppText style={styles.sectionTitle}>Thống kê dinh dưỡng</AppText>
                <Pressable hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Feather name="more-vertical" size={18} color={COLORS.textPrimary} />
                </Pressable>
              </View>

              <View style={styles.weekNavigatorRow}>
                <Pressable
                  style={styles.weekNavButton}
                  onPress={() =>
                    setSelectedWeekStart(previous => shiftWeek(previous, -1))
                  }>
                  <Feather name="chevron-left" size={18} color={COLORS.textPrimary} />
                </Pressable>
                <AppText style={styles.weekRangeLabel}>{weekRangeLabel}</AppText>
                <Pressable
                  style={styles.weekNavButton}
                  onPress={() =>
                    setSelectedWeekStart(previous => shiftWeek(previous, 1))
                  }>
                  <Feather name="chevron-right" size={18} color={COLORS.textPrimary} />
                </Pressable>
              </View>

              <View style={styles.chartCard}>
                {isLoading ? (
                  <View style={styles.loadingWrap}>
                    <ActivityIndicator color={COLORS.primary} />
                    <AppText style={styles.loadingText}>Đang tải dữ liệu...</AppText>
                  </View>
                ) : (
                  <View style={styles.chartArea}>
                    <View style={styles.gridOverlay}>
                      <View style={styles.gridLine} />
                      <View style={styles.gridLine} />
                      <View style={styles.gridLine} />
                      <View style={styles.gridLine} />
                    </View>

                    <View style={styles.barsRow}>
                      {dayStats.map(day => {
                        const satietyUi = day.satietyLevel
                          ? SATIETY_UI_MAP[day.satietyLevel]
                          : undefined;
                        const barColor = satietyUi?.color ?? COLORS.foodChartEmpty;
                        const iconName = satietyUi?.icon;

                        return (
                          <View key={day.dayIndex} style={styles.column}>
                            <View
                              style={[
                                styles.bar,
                                {
                                  height: calculateBarHeight(day.satietyLevel),
                                  backgroundColor: barColor,
                                },
                              ]}>
                              {iconName ? (
                                <MaterialCommunityIcons
                                  name={iconName}
                                  size={18}
                                  color={COLORS.textPrimary}
                                />
                              ) : null}
                            </View>
                            <AppText style={styles.dayLabel}>{day.label}</AppText>
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
            onPress={() => navigation.navigate('FoodEntry')}>
            <Feather name="plus" size={26} color={COLORS.white} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default FoodOverviewScreen;
