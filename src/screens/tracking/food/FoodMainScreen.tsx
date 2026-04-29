import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { BarChart, LineChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';

import { foodApi } from '@/api';
import { AppText } from '@/components';
import { AuthContext } from '@/context/AuthContext';
import { RootStackParamList, TrackingStackParamList } from '@/navigation';
import { COLORS, FONTS, SPACING } from '@/theme';
import { FoodLogRequest, FoodLogResponse } from '@/types';
import { isSameDate, startOfWeekMonday } from '@/utils';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { styles } from './FoodMainScreen.styles';

type SatietyOption = {
  value: number;
  level: string;
  titleKey: string;
  subtitleKey: string;
  icon: string;
  color: string;
};

type FoodDayTrend = {
  label: string;
  rating: number;
};

const WEEKDAY_LABEL_KEYS: string[] = [
  'food.overview.weekdayMon',
  'food.overview.weekdayTue',
  'food.overview.weekdayWed',
  'food.overview.weekdayThu',
  'food.overview.weekdayFri',
  'food.overview.weekdaySat',
  'food.overview.weekdaySun',
];

const SATIETY_OPTIONS: SatietyOption[] = [
  {
    value: 5,
    level: 'ENERGIZED',
    titleKey: 'food.satiety.energized',
    subtitleKey: 'food.satietySubtitle.energized',
    icon: 'emoticon-happy-outline',
    color: COLORS.sleepQualityExcellent,
  },
  {
    value: 4,
    level: 'NORMAL',
    titleKey: 'food.satiety.normal',
    subtitleKey: 'food.satietySubtitle.normal',
    icon: 'emoticon-outline',
    color: COLORS.sleepQualityGood,
  },
  {
    value: 3,
    level: 'INDULGENT',
    titleKey: 'food.satiety.indulgent',
    subtitleKey: 'food.satietySubtitle.indulgent',
    icon: 'emoticon-neutral-outline',
    color: COLORS.emotionNeutral,
  },
  {
    value: 2,
    level: 'OVERATE',
    titleKey: 'food.satiety.overate',
    subtitleKey: 'food.satietySubtitle.overate',
    icon: 'emoticon-sad-outline',
    color: COLORS.sleepQualityBad,
  },
  {
    value: 1,
    level: 'SKIPPED',
    titleKey: 'food.satiety.skipped',
    subtitleKey: 'food.satietySubtitle.skipped',
    icon: 'emoticon-cry-outline',
    color: COLORS.sleepQualityTerrible,
  },
];

const RECENT_HISTORY_LIMIT = 5;
const DEFAULT_SATIETY_VALUE = 4;
const MAX_DESCRIPTION_LENGTH = 300;

const formatDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateKey = (dateKey: string): Date => {
  const [year, month, day] = dateKey.split('-').map(part => Number(part));
  return new Date(year, month - 1, day, 0, 0, 0, 0);
};

const formatSelectedDate = (date: Date, locale: string): string => {
  const weekday = date.toLocaleDateString(locale, { weekday: 'long' });
  const fullDate = date.toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return `${weekday}, ${fullDate}`;
};

const sortByUpdatedAtDesc = (
  left: FoodLogResponse,
  right: FoodLogResponse,
): number => {
  return (
    new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
  );
};

const clampToToday = (date: Date): Date => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  return next > now ? now : next;
};

const getWeekDateKeys = (selectedDate: Date): string[] => {
  const dates: string[] = [];

  for (let index = 6; index >= 0; index -= 1) {
    const date = new Date(selectedDate);
    date.setDate(selectedDate.getDate() - index);
    date.setHours(0, 0, 0, 0);
    dates.push(formatDateKey(date));
  }

  return dates;
};

const foodLogSortValue = (log: FoodLogResponse): number => {
  return new Date(log.createdAt).getTime();
};

const toRgba = (hexColor: string, opacity: number): string => {
  const normalizedHex = hexColor.replace('#', '');
  const parsedHex = Number.parseInt(normalizedHex, 16);
  const red = (parsedHex >> 16) & 255;
  const green = (parsedHex >> 8) & 255;
  const blue = parsedHex & 255;

  return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
};

const satietyValueForLevel = (satietyLevel: string): number => {
  return (
    SATIETY_OPTIONS.find(option => option.level === satietyLevel)?.value ??
    DEFAULT_SATIETY_VALUE
  );
};

const satietyOptionForValue = (value: number): SatietyOption => {
  return (
    SATIETY_OPTIONS.find(option => option.value === value) ?? SATIETY_OPTIONS[1]
  );
};

const FoodMainScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<TrackingStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'FoodMain'>>();
  const { userInfo } = useContext(AuthContext)!;
  const viewProfileId = route.params?.viewProfileId;
  const { i18n, t } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();

  const [selectedDate, setSelectedDate] = useState<Date>(() =>
    clampToToday(new Date()),
  );
  const [allLogs, setAllLogs] = useState<FoodLogResponse[]>([]);
  const [currentLogId, setCurrentLogId] = useState<string | null>(null);
  const [waterGlasses, setWaterGlasses] = useState<number>(0);
  const [foodDescription, setFoodDescription] = useState<string>('');
  const [satietyLevel, setSatietyLevel] = useState<number>(
    DEFAULT_SATIETY_VALUE,
  );
  const [weeklyLogs, setWeeklyLogs] = useState<FoodLogResponse[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  const locale = i18n.resolvedLanguage ?? i18n.language;
  const selectedDateKey = useMemo(
    () => formatDateKey(selectedDate),
    [selectedDate],
  );
  const weekDateKeys = useMemo(
    () => getWeekDateKeys(selectedDate),
    [selectedDate],
  );

  const loadLogs = useCallback(async (): Promise<void> => {
    setIsLoading(true);

    const requestStart = new Date(selectedDate);
    requestStart.setDate(selectedDate.getDate() - 7);
    requestStart.setHours(0, 0, 0, 0);

    const startDate = formatDateKey(requestStart);
    const endDate = weekDateKeys[weekDateKeys.length - 1];

    try {
      const logs = await foodApi.getFoodLogs(viewProfileId ?? userInfo?.profileId ?? '', startDate, endDate);
      const sortedLogs = logs.slice().sort(sortByUpdatedAtDesc);
      setWeeklyLogs(sortedLogs);

      const foundLog =
        sortedLogs.find(log => log.entryDate === selectedDateKey) ?? null;

      if (foundLog) {
        setCurrentLogId(foundLog.id);
        setWaterGlasses(foundLog.waterGlasses);
        setFoodDescription(foundLog.foodDescription);
        setSatietyLevel(satietyValueForLevel(foundLog.satietyLevel));
      } else {
        setCurrentLogId(null);
        setWaterGlasses(0);
        setFoodDescription('');
        setSatietyLevel(DEFAULT_SATIETY_VALUE);
      }
    } catch (error) {
      console.error('[FoodMainScreen] Failed to fetch food logs:', error);
      setWeeklyLogs([]);
      setCurrentLogId(null);
      setWaterGlasses(0);
      setFoodDescription('');
      setSatietyLevel(DEFAULT_SATIETY_VALUE);
      Alert.alert(t('food.entry.errorTitle'), t('food.entry.errorMessage'));
    } finally {
      setIsLoading(false);
    }
  }, [selectedDateKey, t, weekDateKeys]);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

  const chartData = useMemo(() => {
    const labels = weekDateKeys.map(dateKey => {
      const date = parseDateKey(dateKey);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    });

    const values = weekDateKeys.map(dateKey => {
      const latestDayLog = weeklyLogs
        .filter(log => log.entryDate === dateKey)
        .sort(sortByUpdatedAtDesc)[0];

      return latestDayLog?.waterGlasses ?? 0;
    });

    return {
      labels,
      datasets: [{ data: values }],
    };
  }, [weekDateKeys, weeklyLogs]);

  const foodLogDateKey = (log: FoodLogResponse): string => {
    return log.entryDate ?? formatDateKey(new Date(log.createdAt));
  };

  const foodLogDate = (log: FoodLogResponse): Date => {
    return parseDateKey(foodLogDateKey(log));
  };

  const selectedWeekStart = useMemo(
    () => startOfWeekMonday(selectedDate),
    [selectedDate],
  );

  const weekTrend = useMemo<FoodDayTrend[]>(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(selectedWeekStart);
      date.setDate(selectedWeekStart.getDate() + index);

      const dayLogs = weeklyLogs.filter(log =>
        isSameDate(foodLogDate(log), date),
      );
      const latestLog =
        dayLogs
          .slice()
          .sort(
            (left, right) => foodLogSortValue(right) - foodLogSortValue(left),
          )[0] ?? null;

      return {
        label: t(WEEKDAY_LABEL_KEYS[index]),
        rating: latestLog ? satietyValueForLevel(latestLog.satietyLevel) : 0,
      };
    });
  }, [selectedWeekStart, t, weeklyLogs]);

  const chartValues = useMemo(
    () => weekTrend.map(day => day.rating),
    [weekTrend],
  );
  const averageMindfulScore = useMemo(() => {
    const meaningfulScores = weeklyLogs
      .map(log => satietyValueForLevel(log.satietyLevel))
      .filter(score => score > 0);

    if (meaningfulScores.length === 0) {
      return 0;
    }

    return (
      meaningfulScores.reduce((sum, score) => sum + score, 0) /
      meaningfulScores.length
    );
  }, [weeklyLogs]);
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
      color: (opacity = 1): string => toRgba(COLORS.foodHeaderOrange, opacity),
      labelColor: (opacity = 1): string =>
        toRgba(COLORS.textSecondary, opacity),
      propsForBackgroundLines: {
        stroke: COLORS.borderSubtle,
      },
      propsForLabels: {
        fontSize: 10,
      },
    }),
    [],
  );

  const handleDateChange = (
    event: DateTimePickerEvent,
    nextDate?: Date,
  ): void => {
    if (event.type === 'dismissed') {
      setShowDatePicker(false);
      return;
    }

    if (nextDate) {
      setSelectedDate(clampToToday(nextDate));
    }

    if (Platform.OS !== 'ios') {
      setShowDatePicker(false);
    }
  };

  const handleDecreaseWater = (): void => {
    setWaterGlasses(previous => Math.max(0, previous - 1));
  };

  const handleIncreaseWater = (): void => {
    setWaterGlasses(previous => previous + 1);
  };

  const handleSave = async (): Promise<void> => {
    if (isSaving) {
      return;
    }

    setIsSaving(true);

    const payload: FoodLogRequest = {
      waterGlasses,
      foodDescription: foodDescription.trim(),
      satietyLevel: satietyOptionForValue(satietyLevel).level,
      entryDate: selectedDateKey,
    };

    try {
      if (currentLogId) {
        await foodApi.updateFoodLog(currentLogId, payload);
      } else {
        await foodApi.createFoodLog(payload);
      }

      await loadLogs();

      Alert.alert(
        t('food.entry.successTitle', { defaultValue: 'Thanh cong' }),
        t('food.entry.successMessage'),
      );
    } catch (error) {
      console.error('[FoodMainScreen] Failed to save food log:', error);
      Alert.alert(
        t('food.entry.errorTitle'),
        t('food.entry.errorMessage'),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const isSaveDisabled = isSaving || foodDescription.trim().length === 0;

  const today = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }, []);

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
                    {t('food.main.headerTitle')}
                  </AppText>
                  <AppText style={styles.headerSubtitle}>
                    {t('food.main.overviewSubtitle')}
                  </AppText>
                </View>
              </View>

              <Pressable
                style={styles.dateSelector}
                onPress={() => setShowDatePicker(true)}
              >
                <View style={styles.dateSelectorIconWrap}>
                  <Feather name="calendar" size={18} color={COLORS.white} />
                </View>
                <View style={styles.dateSelectorTextWrap}>
                  <AppText style={styles.dateSelectorLabel}>
                    {t('food.main.selectedDateLabel')}
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
                    {t('food.main.overviewTitle')}
                  </AppText>
                  <AppText style={styles.sectionSubtitle}>
                    {t('food.main.overviewSubtitle')}
                  </AppText>
                </View>
              </View>

              {isLoading ? (
                <View style={styles.loadingWrap}>
                  <ActivityIndicator color={COLORS.foodHeaderOrange} />
                  <AppText style={styles.loadingText}>
                    {t('food.overview.loading')}
                  </AppText>
                </View>
              ) : weeklyLogs.length === 0 ? (
                <View style={styles.emptyChartState}>
                  <MaterialCommunityIcons
                    name="food-apple-outline"
                    size={30}
                    color={COLORS.textSecondary}
                  />
                  <AppText style={styles.emptyStateText}>
                    {t('food.main.noData')}
                  </AppText>
                </View>
              ) : (
                <LineChart
                  data={{
                    labels: WEEKDAY_LABEL_KEYS.map(key => t(key)),
                    datasets: [
                      {
                        data: chartValues,
                        color: () => COLORS.foodHeaderOrange,
                        strokeWidth: 3,
                      },
                    ],
                  }}
                  width={chartWidth}
                  height={220}
                  fromZero
                  segments={4}
                  yAxisSuffix=""
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
                    Number(value).toFixed(0)
                  }
                />
              )}

              <View style={styles.summaryRow}>
                <View style={styles.summaryCard}>
                  <AppText style={styles.summaryValue}>
                    {averageMindfulScore > 0
                      ? averageMindfulScore.toFixed(1)
                      : '0.0'}
                  </AppText>
                  <AppText style={styles.summaryLabel}>
                    {t('food.main.averageLabel')}
                  </AppText>
                </View>
              </View>
            </View>

            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <AppText style={styles.sectionTitle}>
                    {t('food.main.waterChartTitle')}
                  </AppText>
                  <AppText style={styles.sectionSubtitle}>
                    {t('food.main.waterChartSubtitle')}
                  </AppText>
                </View>
              </View>

              {isLoading ? (
                <View style={styles.loadingWrap}>
                  <ActivityIndicator color={COLORS.foodHeaderOrange} />
                  <AppText style={styles.loadingText}>
                    {t('food.overview.loading')}
                  </AppText>
                </View>
              ) : (
                <BarChart
                  data={chartData}
                  width={chartWidth}
                  height={230}
                  fromZero
                  yAxisLabel=""
                  yAxisSuffix=""
                  showValuesOnTopOfBars
                  withInnerLines={false}
                  chartConfig={chartConfig}
                  style={styles.chart}
                />
              )}
            </View>

            {!viewProfileId && <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <AppText style={styles.sectionTitle}>
                    {t('food.main.quickEntryTitle')}
                  </AppText>
                  <AppText style={styles.sectionSubtitle}>
                    {t('food.main.quickEntrySubtitle')}
                  </AppText>
                </View>
              </View>

              <View style={styles.waterTrackerCard}>
                <AppText style={styles.inputLabel}>
                  {t('food.main.hydrationLabel')}
                </AppText>

                <View style={styles.waterStepperRow}>
                  <Pressable
                    style={styles.waterCircleButton}
                    onPress={handleDecreaseWater}
                  >
                    <Feather name="minus" size={20} color={COLORS.white} />
                  </Pressable>

                  <View style={styles.waterValueWrap}>
                    <AppText style={styles.waterValueText}>
                      {waterGlasses}
                    </AppText>
                    <AppText style={styles.waterValueUnit}>
                      {t('food.main.hydrationUnit')}
                    </AppText>
                  </View>

                  <Pressable
                    style={styles.waterCircleButton}
                    onPress={handleIncreaseWater}
                  >
                    <Feather name="plus" size={20} color={COLORS.white} />
                  </Pressable>
                </View>
              </View>

              <View style={styles.satietySection}>
                <AppText style={styles.inputLabel}>
                  {t('food.main.mindfulLabel')}
                </AppText>
                <View style={styles.satietyList}>
                  {SATIETY_OPTIONS.map(option => {
                    const isSelected = satietyLevel === option.value;

                    return (
                      <Pressable
                        key={option.value}
                        style={[
                          styles.satietyItem,
                          isSelected && styles.satietyItemSelected,
                        ]}
                        onPress={() => setSatietyLevel(option.value)}
                      >
                        <View style={styles.satietyTextBlock}>
                          <AppText style={styles.satietyTitle}>
                            {t(option.titleKey)}
                          </AppText>
                          <AppText style={styles.satietySubtitle}>
                            {t(option.subtitleKey)}
                          </AppText>
                        </View>
                        <View style={styles.satietyIconWrap}>
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
              </View>

              <View>
                <AppText style={styles.inputLabel}>
                  {t('food.entry.descriptionLabel')}
                </AppText>
                <View style={styles.descriptionCard}>
                  <TextInput
                    style={[
                      styles.descriptionInput,
                      { fontFamily: FONTS.regular },
                    ]}
                    placeholder={t('food.entry.descriptionPlaceholder')}
                    placeholderTextColor={COLORS.placeholder}
                    multiline
                    maxLength={MAX_DESCRIPTION_LENGTH}
                    value={foodDescription}
                    onChangeText={setFoodDescription}
                    editable={!isSaving}
                  />
                </View>
              </View>

              <Pressable
                style={[
                  styles.submitButton,
                  isSaveDisabled && styles.submitButtonDisabled,
                ]}
                onPress={handleSave}
                disabled={isSaveDisabled}
              >
                {isSaving ? (
                  <ActivityIndicator color={COLORS.buttonPrimaryText} />
                ) : (
                  <View style={styles.submitContent}>
                    <AppText style={styles.submitText}>
                      {t('food.main.saveButtonCreate')}
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
          </ScrollView>

          {showDatePicker && Platform.OS === 'ios' ? (
            <Modal transparent animationType="fade" visible={showDatePicker}>
              <Pressable
                style={styles.pickerBackdrop}
                onPress={() => setShowDatePicker(false)}
              />
              <View style={styles.pickerCard}>
                <View style={styles.pickerHeader}>
                  <Pressable onPress={() => setShowDatePicker(false)}>
                    <AppText style={styles.pickerDoneText}>
                      {t('sleep.entry.iosDone', { defaultValue: 'Xong' })}
                    </AppText>
                  </Pressable>
                </View>
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  maximumDate={today}
                />
              </View>
            </Modal>
          ) : null}

          {showDatePicker && Platform.OS !== 'ios' ? (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={today}
            />
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default FoodMainScreen;
