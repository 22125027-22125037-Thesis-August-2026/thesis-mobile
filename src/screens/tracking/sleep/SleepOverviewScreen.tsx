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

import * as sleepApi from '../../../api/sleepApi';
import { COLORS } from '../../../constants/colors';
import { SLEEP_QUALITY_UI_MAP, SLEEP_WEEKDAY_LABELS } from '../../../constants/sleep';
import { TrackingStackParamList } from '../../../navigation/types';
import { SleepLogResponse } from '../../../types/sleep';
import { styles } from './SleepOverviewScreen.styles';

type SleepDayStat = {
  dayIndex: number;
  label: string;
  durationMinutes: number | null;
  sleepQuality: number | null;
};

const MAX_CHART_DURATION_MINUTES = 600;
const MIN_BAR_HEIGHT_PERCENT = 20;

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

const formatAverageDuration = (minutes: number | null): string => {
  if (minutes === null || minutes <= 0) {
    return '0h 00m';
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${hours}h ${remainingMinutes.toString().padStart(2, '0')}m`;
};

const toPercent = (value: number): `${number}%` => {
  return `${value}%`;
};

const calculateBarHeight = (durationMinutes: number | null): `${number}%` => {
  if (!durationMinutes || durationMinutes <= 0) {
    return toPercent(MIN_BAR_HEIGHT_PERCENT);
  }

  const rawPercent = (durationMinutes / MAX_CHART_DURATION_MINUTES) * 100;
  const boundedPercent = Math.min(100, Math.max(MIN_BAR_HEIGHT_PERCENT, rawPercent));

  return toPercent(boundedPercent);
};

const parseLogDate = (log: SleepLogResponse): Date => {
  return new Date(log.wakeTime);
};

const SleepOverviewScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<TrackingStackParamList>>();

  const [weeklyLogs, setWeeklyLogs] = useState<SleepLogResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const loadLogs = async (): Promise<void> => {
      try {
        const logs = await sleepApi.getAllSleepLogs();
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

  const dayStats = useMemo<SleepDayStat[]>(() => {
    const today = new Date();
    const weekStart = startOfCurrentWeek(today);

    return Array.from({ length: 7 }, (_, index) => {
      const dayDate = new Date(weekStart);
      dayDate.setDate(weekStart.getDate() + index);

      const dayLog = weeklyLogs.find(log => {
        const logDate = parseLogDate(log);
        return (
          logDate.getFullYear() === dayDate.getFullYear() &&
          logDate.getMonth() === dayDate.getMonth() &&
          logDate.getDate() === dayDate.getDate()
        );
      });

      return {
        dayIndex: index,
        label: SLEEP_WEEKDAY_LABELS[index],
        durationMinutes: dayLog?.durationMinutes ?? null,
        sleepQuality: dayLog?.sleepQuality ?? null,
      };
    });
  }, [weeklyLogs]);

  const averageDurationMinutes = useMemo<number | null>(() => {
    if (weeklyLogs.length === 0) {
      return null;
    }

    const totalMinutes = weeklyLogs.reduce((sum, log) => sum + (log.durationMinutes ?? 0), 0);
    return Math.round(totalMinutes / weeklyLogs.length);
  }, [weeklyLogs]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.root}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.headerWrap}>
              <View style={styles.headerTopRow}>
                <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
                  <Feather name="chevron-left" size={22} color={COLORS.white} />
                </Pressable>
                <Text style={styles.headerTitle}>Chất lượng giấc mơ</Text>
              </View>

              <Text style={styles.averageValue}>{formatAverageDuration(averageDurationMinutes)}</Text>
              <Text style={styles.averageSubtitle}>trung bình trong tuần</Text>
            </View>

            <View style={styles.body}>
              <Text style={styles.sectionTitle}>Thống kê giấc ngủ</Text>

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
                        const qualityUi = day.sleepQuality
                          ? SLEEP_QUALITY_UI_MAP[day.sleepQuality]
                          : undefined;
                        const barColor = qualityUi?.color ?? COLORS.sleepChartEmpty;
                        const iconName = qualityUi?.icon;

                        return (
                          <View key={day.dayIndex} style={styles.column}>
                            <View
                              style={[
                                styles.bar,
                                {
                                  height: calculateBarHeight(day.durationMinutes),
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
            onPress={() => navigation.navigate('SleepEntry')}>
            <Feather name="plus" size={26} color={COLORS.white} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SleepOverviewScreen;
