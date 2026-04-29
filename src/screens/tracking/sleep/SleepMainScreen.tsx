import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { LineChart } from 'react-native-chart-kit';
import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { sleepApi } from '@/api';
import { AppText } from '@/components';
import { AuthContext } from '@/context/AuthContext';
import { SLEEP_QUALITY_UI_MAP } from '@/constants';
import { RootStackParamList, TrackingStackParamList } from '@/navigation';
import { COLORS, FONTS, SPACING } from '@/theme';
import { SleepLogRequest, SleepLogResponse } from '@/types';
import { endOfWeekSunday, isSameDate, startOfWeekMonday } from '@/utils';
import { styles } from './SleepMainScreen.styles';

type SleepPickerTarget = 'date' | 'bedTime' | 'wakeTime' | null;

type SleepQualityOption = {
  value: number;
  titleKey: string;
  subtitleKey: string;
  icon: string;
  color: string;
};

type SleepDayTrend = {
  label: string;
  durationMinutes: number;
  quality: number | null;
};

const WEEKDAY_LABEL_KEYS: string[] = [
  'sleep.overview.weekdayMon',
  'sleep.overview.weekdayTue',
  'sleep.overview.weekdayWed',
  'sleep.overview.weekdayThu',
  'sleep.overview.weekdayFri',
  'sleep.overview.weekdaySat',
  'sleep.overview.weekdaySun',
];

const SLEEP_QUALITY_OPTIONS: SleepQualityOption[] = [
  {
    value: 5,
    titleKey: 'sleep.entry.quality.excellent.title',
    subtitleKey: 'sleep.entry.quality.excellent.subtitle',
    icon: 'emoticon-excited-outline',
    color: COLORS.sleepQualityExcellent,
  },
  {
    value: 4,
    titleKey: 'sleep.entry.quality.good.title',
    subtitleKey: 'sleep.entry.quality.good.subtitle',
    icon: 'emoticon-happy-outline',
    color: COLORS.sleepQualityGood,
  },
  {
    value: 3,
    titleKey: 'sleep.entry.quality.neutral.title',
    subtitleKey: 'sleep.entry.quality.neutral.subtitle',
    icon: 'emoticon-neutral-outline',
    color: COLORS.sleepQualityNeutral,
  },
  {
    value: 2,
    titleKey: 'sleep.entry.quality.bad.title',
    subtitleKey: 'sleep.entry.quality.bad.subtitle',
    icon: 'emoticon-sad-outline',
    color: COLORS.sleepQualityBad,
  },
  {
    value: 1,
    titleKey: 'sleep.entry.quality.terrible.title',
    subtitleKey: 'sleep.entry.quality.terrible.subtitle',
    icon: 'emoticon-cry-outline',
    color: COLORS.sleepQualityTerrible,
  },
];

const RECENT_HISTORY_LIMIT = 5;
const DEFAULT_SLEEP_QUALITY = 3;

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

const formatTime = (date: Date, locale: string): string => {
  return date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

const formatSelectedDate = (date: Date, locale: string): string => {
  const weekday = date.toLocaleDateString(locale, { weekday: 'long' });
  const day = date.toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  return `${weekday}, ${day}`;
};

const formatLocalDateTime = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  const hours = `${date.getHours()}`.padStart(2, '0');
  const minutes = `${date.getMinutes()}`.padStart(2, '0');
  const seconds = `${date.getSeconds()}`.padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

const createDefaultBedTime = (selectedDate: Date): Date => {
  const bedTime = new Date(selectedDate);
  bedTime.setDate(bedTime.getDate() - 1);
  bedTime.setHours(22, 0, 0, 0);
  return bedTime;
};

const createDefaultWakeTime = (selectedDate: Date): Date => {
  const wakeTime = new Date(selectedDate);
  wakeTime.setHours(6, 0, 0, 0);
  return wakeTime;
};

const sleepLogDateKey = (log: SleepLogResponse): string => {
  return log.entryDate ?? formatDateKey(new Date(log.wakeTime));
};

const sleepLogDate = (log: SleepLogResponse): Date => {
  return parseDateKey(sleepLogDateKey(log));
};

const sleepLogSortValue = (log: SleepLogResponse): number => {
  return new Date(log.updatedAt ?? log.createdAt).getTime();
};

const sleepLogQualityIcon = (quality: number | null): string => {
  if (!quality) {
    return 'emoticon-outline';
  }

  return SLEEP_QUALITY_UI_MAP[quality]?.icon ?? 'emoticon-outline';
};

const formatDuration = (minutes: number): string => {
  const totalHours = minutes / 60;
  return `${totalHours.toFixed(1)}h`;
};

const formatDurationLabel = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${`${remainingMinutes}`.padStart(2, '0')}m`;
};

const SleepMainScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<TrackingStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'SleepMain'>>();
  const { userInfo } = useContext(AuthContext)!;
  const viewProfileId = route.params?.viewProfileId;
  const { i18n, t } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [allLogs, setAllLogs] = useState<SleepLogResponse[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const [pickerTarget, setPickerTarget] = useState<SleepPickerTarget>(null);
  const [bedTime, setBedTime] = useState<Date>(
    createDefaultBedTime(new Date()),
  );
  const [wakeTime, setWakeTime] = useState<Date>(
    createDefaultWakeTime(new Date()),
  );
  const [sleepQuality, setSleepQuality] = useState<number>(
    DEFAULT_SLEEP_QUALITY,
  );
  const [note, setNote] = useState<string>('');

  const locale = i18n.resolvedLanguage ?? i18n.language;
  const selectedDateKey = useMemo(
    () => formatDateKey(selectedDate),
    [selectedDate],
  );

  const refreshLogs = useCallback(async (): Promise<void> => {
    setIsLoadingLogs(true);

    try {
      const logs = await sleepApi.getAllSleepLogs(viewProfileId ?? userInfo?.profileId ?? '');
      setAllLogs(logs);
    } catch (error) {
      console.error('[SleepMainScreen] Failed to load sleep logs:', error);
      setAllLogs([]);
    } finally {
      setIsLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    void refreshLogs();
  }, [refreshLogs]);

  const selectedLog = useMemo(() => {
    return (
      allLogs
        .filter(log => sleepLogDateKey(log) === selectedDateKey)
        .sort(
          (left, right) => sleepLogSortValue(right) - sleepLogSortValue(left),
        )[0] ?? null
    );
  }, [allLogs, selectedDateKey]);

  useEffect(() => {
    if (selectedLog) {
      setBedTime(new Date(selectedLog.bedTime));
      setWakeTime(new Date(selectedLog.wakeTime));
      setSleepQuality(selectedLog.sleepQuality ?? DEFAULT_SLEEP_QUALITY);
      setNote(selectedLog.note ?? '');
      return;
    }

    setBedTime(createDefaultBedTime(selectedDate));
    setWakeTime(createDefaultWakeTime(selectedDate));
    setSleepQuality(DEFAULT_SLEEP_QUALITY);
    setNote('');
  }, [selectedDate, selectedLog]);

  const selectedWeekStart = useMemo(
    () => startOfWeekMonday(selectedDate),
    [selectedDate],
  );
  const selectedWeekEnd = useMemo(
    () => endOfWeekSunday(selectedWeekStart),
    [selectedWeekStart],
  );

  const weekEntries = useMemo<SleepLogResponse[]>(() => {
    return allLogs.filter(log => {
      const logDate = sleepLogDate(log);
      return logDate >= selectedWeekStart && logDate <= selectedWeekEnd;
    });
  }, [allLogs, selectedWeekEnd, selectedWeekStart]);

  const weekTrend = useMemo<SleepDayTrend[]>(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(selectedWeekStart);
      date.setDate(selectedWeekStart.getDate() + index);

      const dayLogs = weekEntries.filter(log =>
        isSameDate(sleepLogDate(log), date),
      );
      const latestLog =
        dayLogs
          .slice()
          .sort(
            (left, right) => sleepLogSortValue(right) - sleepLogSortValue(left),
          )[0] ?? null;

      return {
        label: t(WEEKDAY_LABEL_KEYS[index]),
        durationMinutes: latestLog?.durationMinutes ?? 0,
        quality: latestLog?.sleepQuality ?? null,
      };
    });
  }, [selectedWeekStart, t, weekEntries]);

  const chartValues = useMemo(
    () => weekTrend.map(day => day.durationMinutes / 60),
    [weekTrend],
  );
  const weekAverageDurationMinutes = useMemo(() => {
    if (weekEntries.length === 0) {
      return 0;
    }

    const totalMinutes = weekEntries.reduce(
      (sum, log) => sum + (log.durationMinutes ?? 0),
      0,
    );

    return Math.round(totalMinutes / weekEntries.length);
  }, [weekEntries]);

  const weekTotalDurationMinutes = useMemo(() => {
    return weekEntries.reduce(
      (sum, log) => sum + (log.durationMinutes ?? 0),
      0,
    );
  }, [weekEntries]);

  const averageSleepQuality = useMemo(() => {
    const qualityValues = weekEntries
      .map(log => log.sleepQuality)
      .filter(
        (quality): quality is number =>
          typeof quality === 'number' && quality > 0,
      );

    if (qualityValues.length === 0) {
      return 0;
    }

    return (
      qualityValues.reduce((sum, quality) => sum + quality, 0) /
      qualityValues.length
    );
  }, [weekEntries]);

  const recentEntries = useMemo(() => {
    return allLogs
      .slice()
      .sort((left, right) => sleepLogSortValue(right) - sleepLogSortValue(left))
      .slice(0, RECENT_HISTORY_LIMIT);
  }, [allLogs]);

  const chartWidth = Math.max(
    screenWidth - SPACING.screenHorizontal * 2 - 16,
    280,
  );

  const chartConfig = useMemo(
    () => ({
      backgroundColor: COLORS.surface,
      backgroundGradientFrom: COLORS.surface,
      backgroundGradientTo: COLORS.surface,
      decimalPlaces: 1,
      color: (opacity = 1): string =>
        hexToRgba(COLORS.sleepHeaderPurple, opacity),
      labelColor: (opacity = 1): string =>
        hexToRgba(COLORS.textSecondary, opacity),
      propsForBackgroundLines: {
        stroke: COLORS.borderSubtle,
        strokeDasharray: '4 6',
      },
      propsForDots: {
        r: '4',
        strokeWidth: '2',
        stroke: COLORS.sleepHeaderPurple,
      },
      propsForLabels: {
        fontSize: 10,
      },
    }),
    [],
  );

  const currentPickerValue =
    pickerTarget === 'date'
      ? selectedDate
      : pickerTarget === 'bedTime'
      ? bedTime
      : wakeTime;

  const handlePickerChange = (
    event: DateTimePickerEvent,
    nextDate?: Date,
  ): void => {
    if (event.type === 'dismissed') {
      setShowPicker(false);
      setPickerTarget(null);
      return;
    }

    if (nextDate) {
      if (pickerTarget === 'date') {
        setSelectedDate(nextDate);
      } else if (pickerTarget === 'bedTime') {
        setBedTime(nextDate);
      } else if (pickerTarget === 'wakeTime') {
        setWakeTime(nextDate);
      }
    }

    if (Platform.OS !== 'ios') {
      setShowPicker(false);
      setPickerTarget(null);
    }
  };

  const handleOpenPicker = (target: SleepPickerTarget): void => {
    setPickerTarget(target);
    setShowPicker(true);
  };

  const handleClosePicker = (): void => {
    setShowPicker(false);
    setPickerTarget(null);
  };

  const selectedQualityOption =
    SLEEP_QUALITY_OPTIONS.find(option => option.value === sleepQuality) ??
    SLEEP_QUALITY_OPTIONS[2];

  const handleSave = async (): Promise<void> => {
    if (isSaving) {
      return;
    }

    setIsSaving(true);

    const payload: SleepLogRequest = {
      bedTime: formatLocalDateTime(bedTime),
      wakeTime: formatLocalDateTime(wakeTime),
      sleepQuality,
      note: note.trim(),
      entryDate: selectedDateKey,
    };

    try {
      if (selectedLog) {
        await sleepApi.updateSleepLog(selectedLog.id, payload);
      } else {
        await sleepApi.createSleepLog(payload);
      }

      await refreshLogs();

      Alert.alert(
        t('sleep.entry.successTitle'),
        t('sleep.entry.successMessage'),
      );
    } catch (error) {
      console.error('[SleepMainScreen] Failed to save sleep log:', error);
      Alert.alert(t('sleep.entry.errorTitle'), t('sleep.entry.errorMessage'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectHistoryEntry = (log: SleepLogResponse): void => {
    setSelectedDate(sleepLogDate(log));
  };

  const saveButtonLabel = selectedLog
    ? t('sleep.main.saveButtonUpdate')
    : t('sleep.main.saveButtonCreate');

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.screen}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.headerCard}>
              <View style={styles.headerTopRow}>
                <Pressable
                  style={styles.backButton}
                  onPress={() => navigation.navigate('Home')}
                >
                  <Feather name="chevron-left" size={22} color={COLORS.white} />
                </Pressable>

                <View style={styles.headerTitleBlock}>
                  <AppText style={styles.headerTitle}>
                    {t('sleep.main.headerTitle')}
                  </AppText>
                  <AppText style={styles.headerSubtitle}>
                    {t('sleep.main.overviewSubtitle')}
                  </AppText>
                </View>
              </View>

              <Pressable
                style={styles.dateSelector}
                onPress={() => handleOpenPicker('date')}
              >
                <View style={styles.dateSelectorIconWrap}>
                  <Feather name="calendar" size={18} color={COLORS.white} />
                </View>
                <View style={styles.dateSelectorTextWrap}>
                  <AppText style={styles.dateSelectorLabel}>
                    {t('sleep.main.selectedDateLabel')}
                  </AppText>
                  <AppText style={styles.dateSelectorValue}>
                    {formatSelectedDate(selectedDate, locale)}
                  </AppText>
                </View>
                <Feather name="chevron-down" size={18} color={COLORS.white} />
              </Pressable>
            </View>

            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <AppText style={styles.sectionTitle}>
                    {t('sleep.main.overviewTitle')}
                  </AppText>
                  <AppText style={styles.sectionSubtitle}>
                    {t('sleep.main.overviewSubtitle')}
                  </AppText>
                </View>
              </View>

              {isLoadingLogs ? (
                <View style={styles.loadingWrap}>
                  <ActivityIndicator color={COLORS.sleepHeaderPurple} />
                  <AppText style={styles.loadingText}>
                    {t('sleep.overview.loading')}
                  </AppText>
                </View>
              ) : weekEntries.length === 0 ? (
                <View style={styles.emptyChartState}>
                  <MaterialCommunityIcons
                    name="sleep"
                    size={30}
                    color={COLORS.textSecondary}
                  />
                  <AppText style={styles.emptyStateText}>
                    {t('sleep.main.noData')}
                  </AppText>
                </View>
              ) : (
                <LineChart
                  data={{
                    labels: WEEKDAY_LABEL_KEYS.map(key => t(key)),
                    datasets: [
                      {
                        data: chartValues,
                        color: () => COLORS.sleepHeaderPurple,
                        strokeWidth: 3,
                      },
                    ],
                  }}
                  width={chartWidth}
                  height={220}
                  fromZero
                  segments={4}
                  yAxisSuffix="h"
                  withDots
                  withShadow={false}
                  withInnerLines
                  withOuterLines={false}
                  withVerticalLabels
                  withHorizontalLabels
                  bezier
                  chartConfig={chartConfig}
                  style={styles.chart}
                  formatYLabel={(value: string): string =>
                    Number(value).toFixed(1)
                  }
                />
              )}

              <View style={styles.summaryRow}>
                <View style={styles.summaryCard}>
                  <AppText style={styles.summaryValue}>
                    {formatDuration(weekAverageDurationMinutes)}
                  </AppText>
                  <AppText style={styles.summaryLabel}>
                    {t('sleep.main.averageLabel')}
                  </AppText>
                </View>
                <View style={styles.summaryCard}>
                  <AppText style={styles.summaryValue}>
                    {formatDuration(weekTotalDurationMinutes)}
                  </AppText>
                  <AppText style={styles.summaryLabel}>
                    {t('sleep.main.totalLabel')}
                  </AppText>
                </View>
                <View style={styles.summaryCard}>
                  <AppText style={styles.summaryValue}>
                    {averageSleepQuality > 0
                      ? averageSleepQuality.toFixed(1)
                      : '0.0'}
                  </AppText>
                  <AppText style={styles.summaryLabel}>
                    {t('sleep.main.averageQualityLabel')}
                  </AppText>
                </View>
              </View>
            </View>

            {!viewProfileId && <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <AppText style={styles.sectionTitle}>
                    {t('sleep.main.quickEntryTitle')}
                  </AppText>
                  <AppText style={styles.sectionSubtitle}>
                    {t('sleep.main.quickEntrySubtitle')}
                  </AppText>
                </View>
              </View>

              <View style={styles.timeRow}>
                <Pressable
                  style={styles.timeCard}
                  onPress={() => handleOpenPicker('bedTime')}
                >
                  <AppText style={styles.timeLabel}>
                    {t('sleep.entry.bedTimeLabel')}
                  </AppText>
                  <View style={styles.timeValueRow}>
                    <AppText style={styles.timeValue}>
                      {formatTime(bedTime, locale)}
                    </AppText>
                    <Feather
                      name="moon"
                      size={18}
                      color={COLORS.textSecondary}
                    />
                  </View>
                </Pressable>

                <Pressable
                  style={styles.timeCard}
                  onPress={() => handleOpenPicker('wakeTime')}
                >
                  <AppText style={styles.timeLabel}>
                    {t('sleep.entry.wakeTimeLabel')}
                  </AppText>
                  <View style={styles.timeValueRow}>
                    <AppText style={styles.timeValue}>
                      {formatTime(wakeTime, locale)}
                    </AppText>
                    <Feather
                      name="sun"
                      size={18}
                      color={COLORS.textSecondary}
                    />
                  </View>
                </Pressable>
              </View>

              <View style={styles.qualityList}>
                {SLEEP_QUALITY_OPTIONS.map(option => {
                  const isSelected = sleepQuality === option.value;

                  return (
                    <Pressable
                      key={option.value}
                      style={[
                        styles.qualityItem,
                        isSelected && styles.qualityItemSelected,
                      ]}
                      onPress={() => setSleepQuality(option.value)}
                    >
                      <View style={styles.qualityTextBlock}>
                        <AppText style={styles.qualityTitle}>
                          {t(option.titleKey)}
                        </AppText>
                      </View>
                      <View style={styles.qualityIconWrap}>
                        <MaterialCommunityIcons
                          name={option.icon}
                          size={26}
                          color={option.color}
                        />
                      </View>
                    </Pressable>
                  );
                })}
              </View>

              <View>
                <AppText style={styles.inputLabel}>
                  {t('sleep.entry.noteLabel')}
                </AppText>
                <View style={styles.noteCard}>
                  <TextInput
                    style={[styles.noteInput, { fontFamily: FONTS.regular }]}
                    placeholder={t('sleep.entry.notePlaceholder')}
                    placeholderTextColor={COLORS.placeholder}
                    multiline
                    value={note}
                    onChangeText={setNote}
                    editable={!isSaving}
                  />
                </View>
              </View>

              <Pressable
                style={[
                  styles.submitButton,
                  isSaving && styles.submitButtonDisabled,
                ]}
                onPress={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color={COLORS.buttonPrimaryText} />
                ) : (
                  <View style={styles.submitContent}>
                    <AppText style={styles.submitText}>
                      {saveButtonLabel}
                    </AppText>
                    <Feather
                      name="check"
                      size={20}
                      color={COLORS.buttonPrimaryText}
                    />
                  </View>
                )}
              </Pressable>
            </View>}

            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <AppText style={styles.sectionTitle}>
                    {t('sleep.main.historyTitle')}
                  </AppText>
                </View>
              </View>

              {recentEntries.length === 0 ? (
                <View style={styles.emptyHistoryState}>
                  <AppText style={styles.emptyStateText}>
                    {t('sleep.main.historyEmpty')}
                  </AppText>
                </View>
              ) : (
                <View style={styles.historyList}>
                  {recentEntries.map(log => {
                    const logDate = sleepLogDate(log);
                    const logQuality = log.sleepQuality ?? null;
                    const qualityUi =
                      logQuality && SLEEP_QUALITY_UI_MAP[logQuality]
                        ? SLEEP_QUALITY_UI_MAP[logQuality]
                        : null;

                    return (
                      <Pressable
                        key={log.id}
                        style={styles.historyItem}
                        onPress={() => handleSelectHistoryEntry(log)}
                      >
                        <View style={styles.historyIconWrap}>
                          <MaterialCommunityIcons
                            name={sleepLogQualityIcon(logQuality)}
                            size={22}
                            color={qualityUi?.color ?? COLORS.sleepHeaderPurple}
                          />
                        </View>
                        <View style={styles.historyContent}>
                          <View style={styles.historyTopRow}>
                            <AppText style={styles.historyTitleText}>
                              {formatSelectedDate(logDate, locale)}
                            </AppText>
                            <AppText style={styles.historyMetaText}>
                              {formatDurationLabel(log.durationMinutes)}
                            </AppText>
                          </View>
                          <AppText style={styles.historySubtitleText}>
                            {formatTime(new Date(log.bedTime), locale)}
                            {' · '}
                            {formatTime(new Date(log.wakeTime), locale)}
                          </AppText>
                          {log.note ? (
                            <AppText
                              style={styles.historyNoteText}
                              numberOfLines={2}
                            >
                              {log.note}
                            </AppText>
                          ) : null}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>
          </ScrollView>

          {showPicker && Platform.OS === 'ios' ? (
            <Modal transparent animationType="fade" visible={showPicker}>
              <Pressable
                style={styles.pickerBackdrop}
                onPress={handleClosePicker}
              />
              <View style={styles.pickerCard}>
                <View style={styles.pickerHeader}>
                  <Pressable onPress={handleClosePicker}>
                    <AppText style={styles.pickerDoneText}>
                      {t('sleep.entry.iosDone')}
                    </AppText>
                  </Pressable>
                </View>
                <DateTimePicker
                  value={currentPickerValue}
                  mode={pickerTarget === 'date' ? 'date' : 'time'}
                  display="spinner"
                  is24Hour
                  onChange={handlePickerChange}
                  maximumDate={pickerTarget === 'date' ? new Date() : undefined}
                />
              </View>
            </Modal>
          ) : null}

          {showPicker && Platform.OS !== 'ios' ? (
            <DateTimePicker
              value={currentPickerValue}
              mode={pickerTarget === 'date' ? 'date' : 'time'}
              display="default"
              is24Hour
              onChange={handlePickerChange}
              maximumDate={pickerTarget === 'date' ? new Date() : undefined}
            />
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SleepMainScreen;
