import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import * as foodApi from '../../../api/foodApi';
import { COLORS } from '../../../constants/colors';
import { SATIETY_UI_MAP, FOOD_WEEKDAY_LABELS } from '../../../constants/food';
import { TrackingStackParamList } from '../../../navigation/types';
import { FoodLogResponse } from '../../../types/food';
import { styles } from './FoodOverviewScreen.styles';

type FoodDayStat = {
  dayIndex: number;
  label: string;
  satietyLevel: string | null;
};

const MIN_BAR_HEIGHT_PERCENT = 15;

const startOfCurrentWeek = (today: Date): Date => {
  const start = new Date(today);
  const day = start.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + mondayOffset);
  start.setHours(0, 0, 0, 0);
  return start;
};

const endOfCurrentWeek = (weekStart: Date): Date => {
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
};

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

const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
};

const FoodOverviewScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<TrackingStackParamList>>();

  const [weeklyLogs, setWeeklyLogs] = useState<FoodLogResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const loadLogs = async (): Promise<void> => {
      try {
        const logs = await foodApi.getAllFoodLogs();
        if (!isMounted) {
          return;
        }

        const today = new Date();
        const weekStart = startOfCurrentWeek(today);
        const weekEnd = endOfCurrentWeek(weekStart);

        const currentWeekLogs = logs.filter(log => {
          const logDate = parseLogDate(log);
          return logDate >= weekStart && logDate <= weekEnd;
        });

        setWeeklyLogs(currentWeekLogs);
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

  const todayStatus = useMemo<{ label: string; icon: string } | null>(() => {
    const todayLogs = weeklyLogs.filter(log => {
      const logDate = parseLogDate(log);
      return isToday(logDate);
    });

    if (todayLogs.length === 0) {
      return null;
    }

    const mostRecentLog = todayLogs.reduce((latest, current) => {
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
    const today = new Date();
    const weekStart = startOfCurrentWeek(today);

    return Array.from({ length: 7 }, (_, index) => {
      const dayDate = new Date(weekStart);
      dayDate.setDate(weekStart.getDate() + index);

      const dayLogs = weeklyLogs.filter(log => {
        const logDate = parseLogDate(log);
        return (
          logDate.getFullYear() === dayDate.getFullYear() &&
          logDate.getMonth() === dayDate.getMonth() &&
          logDate.getDate() === dayDate.getDate()
        );
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
  }, [weeklyLogs]);

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
                <Text style={styles.headerTitle}>Nhật ký dinh dưỡng</Text>
              </View>

              <Text style={styles.headerSubtitle}>
                Chất lượng ăn uống hôm nay của bạn
              </Text>

              <View style={styles.statusRow}>
                <View>
                  <Text style={styles.statusLabel}>
                    {todayStatus?.label ?? 'Chưa có dữ liệu'}
                  </Text>
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
                <Text style={styles.sectionTitle}>Thống kê dinh dưỡng</Text>
                <Pressable hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Feather name="more-vertical" size={18} color={COLORS.textPrimary} />
                </Pressable>
              </View>

              <View style={styles.chartCard}>
                {isLoading ? (
                  <View style={styles.loadingWrap}>
                    <ActivityIndicator color={COLORS.primary} />
                    <Text style={styles.loadingText}>Đang tải dữ liệu tuần này...</Text>
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
                            <Text style={styles.dayLabel}>{day.label}</Text>
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
