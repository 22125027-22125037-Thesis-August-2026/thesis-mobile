import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { NavigationProp, useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { foodApi } from '@/api';
import { AppText } from '@/components';
import { TrackingStackParamList } from '@/navigation';
import { COLORS, FONTS, SPACING } from '@/theme';
import { FoodLogRequest, FoodLogResponse } from '@/types';
import { endOfWeekSunday, isSameDate, startOfWeekMonday } from '@/utils';
import { styles } from './FoodMainScreen.styles';

type FoodPickerTarget = 'date' | null;

type MealTypeOption = {
  labelKey: string;
  value: string;
};

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

const MEAL_TYPE_OPTIONS: MealTypeOption[] = [
  { labelKey: 'food.meal.breakfast', value: 'BREAKFAST' },
  { labelKey: 'food.meal.lunch', value: 'LUNCH' },
  { labelKey: 'food.meal.dinner', value: 'DINNER' },
  { labelKey: 'food.meal.snack', value: 'SNACK' },
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
const DEFAULT_MEAL_TYPE = 'LUNCH';
const DEFAULT_SATIETY_VALUE = 4;
const MAX_DESCRIPTION_LENGTH = 300;

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

const formatSelectedDate = (date: Date, locale: string): string => {
  const weekday = date.toLocaleDateString(locale, { weekday: 'long' });
  const day = date.toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  return `${weekday}, ${day}`;
};

const foodLogDateKey = (log: FoodLogResponse): string => {
  return log.entryDate ?? formatDateKey(new Date(log.createdAt));
};

const foodLogDate = (log: FoodLogResponse): Date => {
  return parseDateKey(foodLogDateKey(log));
};

const foodLogSortValue = (log: FoodLogResponse): number => {
  return new Date(log.createdAt).getTime();
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
  const { i18n, t } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [allLogs, setAllLogs] = useState<FoodLogResponse[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [mealType, setMealType] = useState<string>(DEFAULT_MEAL_TYPE);
  const [satietyLevel, setSatietyLevel] = useState<number>(
    DEFAULT_SATIETY_VALUE,
  );
  const [foodDescription, setFoodDescription] = useState<string>('');
  const [hydrationByDate, setHydrationByDate] = useState<
    Record<string, number>
  >({});

  const locale = i18n.resolvedLanguage ?? i18n.language;
  const selectedDateKey = useMemo(
    () => formatDateKey(selectedDate),
    [selectedDate],
  );

  const refreshLogs = useCallback(async (): Promise<void> => {
    setIsLoadingLogs(true);

    try {
      const logs = await foodApi.getAllFoodLogs();
      setAllLogs(logs);
    } catch (error) {
      console.error('[FoodMainScreen] Failed to load food logs:', error);
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
        .filter(log => foodLogDateKey(log) === selectedDateKey)
        .sort(
          (left, right) => foodLogSortValue(right) - foodLogSortValue(left),
        )[0] ?? null
    );
  }, [allLogs, selectedDateKey]);

  useEffect(() => {
    if (selectedLog) {
      setMealType(selectedLog.mealType);
      setSatietyLevel(satietyValueForLevel(selectedLog.satietyLevel));
      setFoodDescription(selectedLog.foodDescription);
      return;
    }

    setMealType(DEFAULT_MEAL_TYPE);
    setSatietyLevel(DEFAULT_SATIETY_VALUE);
    setFoodDescription('');
  }, [selectedDateKey, selectedLog]);

  const selectedHydration = hydrationByDate[selectedDateKey] ?? 0;

  const selectedWeekStart = useMemo(
    () => startOfWeekMonday(selectedDate),
    [selectedDate],
  );
  const selectedWeekEnd = useMemo(
    () => endOfWeekSunday(selectedWeekStart),
    [selectedWeekStart],
  );

  const weekEntries = useMemo<FoodLogResponse[]>(() => {
    return allLogs.filter(log => {
      const logDate = foodLogDate(log);
      return logDate >= selectedWeekStart && logDate <= selectedWeekEnd;
    });
  }, [allLogs, selectedWeekEnd, selectedWeekStart]);

  const weekTrend = useMemo<FoodDayTrend[]>(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(selectedWeekStart);
      date.setDate(selectedWeekStart.getDate() + index);

      const dayLogs = weekEntries.filter(log =>
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
  }, [selectedWeekStart, t, weekEntries]);

  const chartValues = useMemo(
    () => weekTrend.map(day => day.rating),
    [weekTrend],
  );
  const averageMindfulScore = useMemo(() => {
    const meaningfulScores = weekEntries
      .map(log => satietyValueForLevel(log.satietyLevel))
      .filter(score => score > 0);

    if (meaningfulScores.length === 0) {
      return 0;
    }

    return (
      meaningfulScores.reduce((sum, score) => sum + score, 0) /
      meaningfulScores.length
    );
  }, [weekEntries]);

  const totalMeals = useMemo(() => weekEntries.length, [weekEntries]);

  const recentEntries = useMemo(() => {
    return allLogs
      .slice()
      .sort((left, right) => foodLogSortValue(right) - foodLogSortValue(left))
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
      decimalPlaces: 0,
      color: (opacity = 1): string =>
        hexToRgba(COLORS.foodHeaderOrange, opacity),
      labelColor: (opacity = 1): string =>
        hexToRgba(COLORS.textSecondary, opacity),
      propsForBackgroundLines: {
        stroke: COLORS.borderSubtle,
        strokeDasharray: '4 6',
      },
      propsForDots: {
        r: '4',
        strokeWidth: '2',
        stroke: COLORS.foodHeaderOrange,
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
      setSelectedDate(nextDate);
    }

    if (Platform.OS !== 'ios') {
      setShowDatePicker(false);
    }
  };

  const handleSave = async (): Promise<void> => {
    if (isSaving) {
      return;
    }

    setIsSaving(true);

    const payload: FoodLogRequest = {
      mealType,
      foodDescription: foodDescription.trim(),
      satietyLevel: satietyOptionForValue(satietyLevel).level,
      entryDate: selectedDateKey,
    };

    try {
      if (selectedLog) {
        await foodApi.updateFoodLog(selectedLog.id, payload);
      } else {
        await foodApi.createFoodLog(payload);
      }

      await refreshLogs();

      Alert.alert(t('food.entry.successTitle'), t('food.entry.successMessage'));
    } catch (error) {
      console.error('[FoodMainScreen] Failed to save food log:', error);
      Alert.alert(t('food.entry.errorTitle'), t('food.entry.errorMessage'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleIncreaseHydration = (): void => {
    setHydrationByDate(previous => ({
      ...previous,
      [selectedDateKey]: (previous[selectedDateKey] ?? 0) + 1,
    }));
  };

  const handleSelectHistoryEntry = (log: FoodLogResponse): void => {
    setSelectedDate(foodLogDate(log));
  };

  const saveButtonLabel = selectedLog
    ? t('food.main.saveButtonUpdate')
    : t('food.main.saveButtonCreate');

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
                  onPress={navigation.goBack}
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

              {isLoadingLogs ? (
                <View style={styles.loadingWrap}>
                  <ActivityIndicator color={COLORS.foodHeaderOrange} />
                  <AppText style={styles.loadingText}>
                    {t('food.overview.loading')}
                  </AppText>
                </View>
              ) : weekEntries.length === 0 ? (
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
                <View style={styles.summaryCard}>
                  <AppText style={styles.summaryValue}>{totalMeals}</AppText>
                  <AppText style={styles.summaryLabel}>
                    {t('food.main.totalLabel')}
                  </AppText>
                </View>
              </View>
            </View>

            <View style={styles.sectionCard}>
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

              <View style={styles.hydrationCard}>
                <View style={styles.hydrationTextWrap}>
                  <AppText style={styles.inputLabel}>
                    {t('food.main.hydrationLabel')}
                  </AppText>
                  <AppText style={styles.hydrationValue}>
                    {selectedHydration} {t('food.main.hydrationUnit')}
                  </AppText>
                </View>
                <Pressable
                  style={styles.hydrationButton}
                  onPress={handleIncreaseHydration}
                >
                  <Feather name="plus" size={20} color={COLORS.white} />
                </Pressable>
              </View>

              <View style={styles.tagSection}>
                <AppText style={styles.inputLabel}>
                  {t('food.main.mealTagsLabel')}
                </AppText>
                <View style={styles.tagRow}>
                  {MEAL_TYPE_OPTIONS.map(option => {
                    const isSelected = mealType === option.value;

                    return (
                      <Pressable
                        key={option.value}
                        style={[
                          styles.tagChip,
                          isSelected && styles.tagChipSelected,
                        ]}
                        onPress={() => setMealType(option.value)}
                      >
                        <AppText
                          style={[
                            styles.tagText,
                            isSelected && styles.tagTextSelected,
                          ]}
                        >
                          {t(option.labelKey)}
                        </AppText>
                      </Pressable>
                    );
                  })}
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
                  (isSaving || foodDescription.trim().length === 0) &&
                    styles.submitButtonDisabled,
                ]}
                onPress={handleSave}
                disabled={isSaving || foodDescription.trim().length === 0}
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
            </View>

            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <AppText style={styles.sectionTitle}>
                    {t('food.main.historyTitle')}
                  </AppText>
                  <AppText style={styles.sectionSubtitle}>
                    {t('food.main.historyEmpty')}
                  </AppText>
                </View>
              </View>

              {recentEntries.length === 0 ? (
                <View style={styles.emptyHistoryState}>
                  <AppText style={styles.emptyStateText}>
                    {t('food.main.historyEmpty')}
                  </AppText>
                </View>
              ) : (
                <View style={styles.historyList}>
                  {recentEntries.map(log => {
                    const satietyOption = satietyOptionForValue(
                      satietyValueForLevel(log.satietyLevel),
                    );

                    return (
                      <Pressable
                        key={log.id}
                        style={styles.historyItem}
                        onPress={() => handleSelectHistoryEntry(log)}
                      >
                        <View style={styles.historyIconWrap}>
                          <MaterialCommunityIcons
                            name={satietyOption.icon}
                            size={22}
                            color={satietyOption.color}
                          />
                        </View>
                        <View style={styles.historyContent}>
                          <View style={styles.historyTopRow}>
                            <AppText style={styles.historyTitleText}>
                              {formatSelectedDate(foodLogDate(log), locale)}
                            </AppText>
                            <AppText style={styles.historyMetaText}>
                              {t(
                                MEAL_TYPE_OPTIONS.find(
                                  option => option.value === log.mealType,
                                )?.labelKey ?? 'food.meal.lunch',
                              )}
                            </AppText>
                          </View>
                          <AppText
                            style={styles.historySubtitleText}
                            numberOfLines={2}
                          >
                            {log.foodDescription}
                          </AppText>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>
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
                      {t('sleep.entry.iosDone')}
                    </AppText>
                  </Pressable>
                </View>
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
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
              maximumDate={new Date()}
            />
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default FoodMainScreen;
