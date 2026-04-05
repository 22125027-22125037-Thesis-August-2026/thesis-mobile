import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { NavigationContext, NavigationProp } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';

import * as diaryApi from '../../../api/diaryApi';
import { COLORS } from '../../../constants/colors';
import { t } from '../../../constants/i18n';
import { MoodTone, getMoodTone } from '../../../constants/moods';
import { TrackingStackParamList } from '../../../navigation/types';
import { DiaryEntryResponse } from '../../../types/diary';
import { styles } from './DiaryOverviewScreen.styles';

type MoodCellTone = MoodTone | 'empty';

type GridCell = {
  key: string;
  mood: MoodCellTone;
  dayLabel: string;
  isCurrentMonth: boolean;
};

const WEEKDAY_KEYS = [
  'overview.weekdayMon',
  'overview.weekdayTue',
  'overview.weekdayWed',
  'overview.weekdayThu',
  'overview.weekdayFri',
  'overview.weekdaySat',
  'overview.weekdaySun',
] as const;

const shiftMonth = (date: Date, delta: number): Date => {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
};

const findTodayEntry = (entries: DiaryEntryResponse[]): DiaryEntryResponse | undefined => {
  const today = new Date();

  return entries.find(entry => {
    const createdDate = new Date(entry.createdAt);

    return (
      !Number.isNaN(createdDate.getTime()) &&
      createdDate.getFullYear() === today.getFullYear() &&
      createdDate.getMonth() === today.getMonth() &&
      createdDate.getDate() === today.getDate()
    );
  });
};

const toDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const getMoodDotStyle = (mood: MoodCellTone): { backgroundColor: string; borderColor: string } => {
  if (mood === 'negative') {
    return {
      backgroundColor: COLORS.accentNegative,
      borderColor: COLORS.accentNegative,
    };
  }

  if (mood === 'neutral') {
    return {
      backgroundColor: COLORS.accentNeutral,
      borderColor: COLORS.accentNeutral,
    };
  }

  if (mood === 'positive') {
    return {
      backgroundColor: COLORS.accentPositive,
      borderColor: COLORS.accentPositive,
    };
  }

  return {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.inputBorder,
  };
};

const generateMoodGrid = (entries: DiaryEntryResponse[], monthDate: Date): GridCell[] => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingDays = (firstDayOfMonth.getDay() + 6) % 7;
  const totalCells = Math.ceil((leadingDays + daysInMonth) / 7) * 7;

  const moodByDate = new Map<string, MoodCellTone>();
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  sortedEntries.forEach(entry => {
    const createdAt = new Date(entry.createdAt);

    if (
      Number.isNaN(createdAt.getTime()) ||
      createdAt.getFullYear() !== year ||
      createdAt.getMonth() !== month
    ) {
      return;
    }

    const dateKey = toDateKey(createdAt);

    if (!moodByDate.has(dateKey)) {
      moodByDate.set(dateKey, getMoodTone(entry.moodTag, entry.positivityScore));
    }
  });

  return Array.from({ length: totalCells }, (_, index) => {
    const dayNumber = index - leadingDays + 1;
    const isCurrentMonth = dayNumber >= 1 && dayNumber <= daysInMonth;

    if (!isCurrentMonth) {
      return {
        key: `mood-cell-${index}`,
        mood: 'empty',
        dayLabel: '',
        isCurrentMonth: false,
      };
    }

    const dateKey = toDateKey(new Date(year, month, dayNumber));

    return {
      key: `mood-cell-${year}-${month + 1}-${dayNumber}`,
      mood: moodByDate.get(dateKey) ?? 'empty',
      dayLabel: String(dayNumber),
      isCurrentMonth: true,
    };
  });
};

const DiaryOverviewScreen: React.FC = () => {
  const navigation = useContext(NavigationContext) as
    | NavigationProp<TrackingStackParamList>
    | undefined;
  const [entries, setEntries] = useState<DiaryEntryResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [calendarDate, setCalendarDate] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  useEffect(() => {
    let isMounted = true;

    const fetchEntries = async (): Promise<void> => {
      setIsLoading(true);

      try {
        const data = await diaryApi.getDiaryEntries();

        if (isMounted) {
          setEntries(data);
        }
      } catch (error) {
        console.error('[DiaryOverview] Failed to fetch entries:', error);
        if (isMounted) {
          setEntries([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchEntries();

    return () => {
      isMounted = false;
    };
  }, []);

  const yearlyCountText = useMemo(
    () => t('overview.yearCount', { count: entries.length }),
    [entries.length],
  );
  const monthTitleText = useMemo(
    () =>
      t('overview.monthTitle', {
        month: calendarDate.getMonth() + 1,
        year: calendarDate.getFullYear(),
      }),
    [calendarDate],
  );
  const moodGrid = useMemo(() => generateMoodGrid(entries, calendarDate), [entries, calendarDate]);
  const todayEntry = useMemo(() => findTodayEntry(entries), [entries]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={COLORS.buttonPrimary} />
          <Text style={styles.loadingText}>{t('overview.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerWrap}>
          <View style={styles.headerBackground}>
            <View style={[styles.headerRing, styles.headerRingTopLeft]} />
            <View style={[styles.headerRing, styles.headerRingTopRight]} />
            <View style={[styles.headerRing, styles.headerRingMidRight]} />
            <View style={[styles.headerRing, styles.headerRingBottomLeft]} />
            <View style={[styles.headerRing, styles.headerRingSmall]} />
            <View style={styles.headerInner}>
              <View style={styles.headerTopRow}>
                <Pressable
                  style={styles.backButton}
                  onPress={() => navigation?.goBack()}
                  disabled={!navigation}>
                  <Feather name="chevron-left" size={24} color={COLORS.white} />
                </Pressable>
                <Text style={styles.headerTitle}>{t('overview.headerTitle')}</Text>
              </View>

              <View style={styles.centerWrap}>
                <Text style={styles.scoreText}>{yearlyCountText}</Text>
                <Text style={styles.subtitle}>{t('overview.subtitleLine1')}{`\n`}{t('overview.subtitleLine2')}</Text>
              </View>
            </View>
          </View>

          <Pressable
            style={styles.fabButton}
            onPress={() => {
              if (!navigation) {
                return;
              }

              if (todayEntry) {
                navigation.navigate('DiaryEntry', { entryId: todayEntry.id });
                return;
              }

              navigation.navigate('DiaryEntry');
            }}>
            <Feather name="plus" size={34} color={COLORS.white} />
          </Pressable>
        </View>

        <View style={styles.contentWrap}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>{t('overview.sectionTitle')}</Text>
            <Pressable onPress={() => navigation?.navigate('DiaryDashboard')}>
              <Ionicons
                name="ellipsis-vertical"
                size={20}
                color={COLORS.placeholder}
              />
            </Pressable>
          </View>

          <View style={styles.monthHeaderRow}>
            <Pressable
              style={styles.monthNavButton}
              onPress={() => setCalendarDate(previous => shiftMonth(previous, -1))}>
              <Feather name="chevron-left" size={18} color={COLORS.textPrimary} />
            </Pressable>

            <Text style={styles.monthTitle}>{monthTitleText}</Text>

            <Pressable
              style={styles.monthNavButton}
              onPress={() => setCalendarDate(previous => shiftMonth(previous, 1))}>
              <Feather name="chevron-right" size={18} color={COLORS.textPrimary} />
            </Pressable>
          </View>

          <View style={styles.weekdayRow}>
            {WEEKDAY_KEYS.map(weekdayKey => (
              <Text key={weekdayKey} style={styles.weekdayText}>
                {t(weekdayKey)}
              </Text>
            ))}
          </View>

          <View style={styles.gridWrap}>
            {moodGrid.map(cell => {
              const dotColor = getMoodDotStyle(cell.mood);

              return (
                <View
                  key={cell.key}
                  style={[
                    styles.moodDot,
                    !cell.isCurrentMonth && styles.moodDotInactive,
                    {
                      backgroundColor: dotColor.backgroundColor,
                      borderColor: dotColor.borderColor,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.dayText,
                      !cell.isCurrentMonth && styles.dayTextInactive,
                      cell.mood !== 'empty' && styles.dayTextFilled,
                    ]}>
                    {cell.dayLabel}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DiaryOverviewScreen;
