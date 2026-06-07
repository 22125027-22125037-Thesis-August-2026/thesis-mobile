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
import { RootStackParamList } from '@/navigation';
import { COLORS, FONTS, SPACING } from '@/theme';
import { FoodLogRequest, FoodLogResponse } from '@/types';
import { endOfWeekSunday, isSameDate, playSoftHaptic, startOfWeekMonday } from '@/utils';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { styles } from './FoodMainScreen.styles';

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

const WATER_STEP_LITERS = 0.25;
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

const mealCountFromLog = (log: FoodLogResponse): number => {
  return Number.parseInt(log.satietyLevel, 10) || 0;
};

const FoodMainScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'FoodMain'>>();
  const { userInfo } = useContext(AuthContext)!;
  const viewProfileId = route.params?.viewProfileId;
  const { i18n, t } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();

  const [selectedDate, setSelectedDate] = useState<Date>(() =>
    clampToToday(new Date()),
  );
  const [currentLogId, setCurrentLogId] = useState<string | null>(null);
  const [waterLiters, setWaterLiters] = useState<number>(0);
  const [foodDescription, setFoodDescription] = useState<string>('');
  const [mealCount, setMealCount] = useState<number>(0);
  const [weeklyLogs, setWeeklyLogs] = useState<FoodLogResponse[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  const locale = i18n.resolvedLanguage ?? i18n.language;
  const selectedDateKey = useMemo(
    () => formatDateKey(selectedDate),
    [selectedDate],
  );
  const selectedWeekStart = useMemo(
    () => startOfWeekMonday(selectedDate),
    [selectedDate],
  );
  const selectedWeekEnd = useMemo(
    () => endOfWeekSunday(selectedWeekStart),
    [selectedWeekStart],
  );
  const weekDateKeys = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const date = new Date(selectedWeekStart);
        date.setDate(selectedWeekStart.getDate() + index);
        date.setHours(0, 0, 0, 0);
        return formatDateKey(date);
      }),
    [selectedWeekStart],
  );

  const loadLogs = useCallback(async (): Promise<void> => {
    setIsLoading(true);

    const startDate = formatDateKey(selectedWeekStart);
    const endDate = formatDateKey(selectedWeekEnd);

    try {
      const logs = await foodApi.getFoodLogs(viewProfileId ?? userInfo?.profileId ?? '', startDate, endDate);
      const sortedLogs = logs.slice().sort(sortByUpdatedAtDesc);
      setWeeklyLogs(sortedLogs);

      const foundLog =
        sortedLogs.find(log => log.entryDate === selectedDateKey) ?? null;

      if (foundLog) {
        setCurrentLogId(foundLog.id);
        setWaterLiters(foundLog.waterGlasses / 1000);
        setFoodDescription(foundLog.foodDescription);
        setMealCount(mealCountFromLog(foundLog));
      } else {
        setCurrentLogId(null);
        setWaterLiters(0);
        setFoodDescription('');
        setMealCount(0);
      }
    } catch (error) {
      console.error('[FoodMainScreen] Failed to fetch food logs:', error);
      setWeeklyLogs([]);
      setCurrentLogId(null);
      setWaterLiters(0);
      setFoodDescription('');
      setMealCount(0);
      Alert.alert(t('food.entry.errorTitle'), t('food.entry.errorMessage'));
    } finally {
      setIsLoading(false);
    }
  }, [selectedDateKey, t, selectedWeekStart, selectedWeekEnd]);

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

      return (latestDayLog?.waterGlasses ?? 0) / 1000;
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
        rating: latestLog ? mealCountFromLog(latestLog) : 0,
      };
    });
  }, [selectedWeekStart, t, weeklyLogs]);

  const chartValues = useMemo(
    () => weekTrend.map(day => day.rating),
    [weekTrend],
  );
  const averageMealCount = useMemo(() => {
    const meaningfulCounts = weeklyLogs
      .map(log => mealCountFromLog(log))
      .filter(count => count > 0);

    if (meaningfulCounts.length === 0) {
      return 0;
    }

    return (
      meaningfulCounts.reduce((sum, count) => sum + count, 0) /
      meaningfulCounts.length
    );
  }, [weeklyLogs]);
  const chartWidth = Math.max(
    screenWidth - SPACING.screenHorizontal * 2 - SPACING.md * 2,
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

  const barChartConfig = useMemo(
    () => ({
      backgroundColor: COLORS.surface,
      backgroundGradientFrom: COLORS.surface,
      backgroundGradientTo: COLORS.surface,
      decimalPlaces: 1,
      barPercentage: 0.65,
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
    setWaterLiters(previous =>
      Math.max(0, Math.round((previous - WATER_STEP_LITERS) * 100) / 100),
    );
  };

  const handleIncreaseWater = (): void => {
    setWaterLiters(previous =>
      Math.round((previous + WATER_STEP_LITERS) * 100) / 100,
    );
  };

  const handleDecreaseMeals = (): void => {
    setMealCount(previous => Math.max(0, previous - 1));
  };

  const handleIncreaseMeals = (): void => {
    setMealCount(previous => previous + 1);
  };

  const handleSave = async (): Promise<void> => {
    if (isSaving) {
      return;
    }

    playSoftHaptic();
    setIsSaving(true);

    const payload: FoodLogRequest = {
      waterGlasses: Math.round(waterLiters * 1000),
      foodDescription: foodDescription.trim() || '-',
      satietyLevel: String(mealCount),
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
        t('food.entry.successTitle'),
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

  const isSaveDisabled = isSaving || mealCount <= 0;

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
                  onPress={() => navigation.goBack()}
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
                    {averageMealCount > 0
                      ? averageMealCount.toFixed(1)
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
                  yAxisSuffix="L"
                  showValuesOnTopOfBars
                  withInnerLines={false}
                  chartConfig={barChartConfig}
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
                      {waterLiters.toFixed(2)}
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

              <View style={styles.waterTrackerCard}>
                <AppText style={styles.inputLabel}>
                  {t('food.main.mealCountLabel')}
                </AppText>

                <View style={styles.waterStepperRow}>
                  <Pressable
                    style={styles.waterCircleButton}
                    onPress={handleDecreaseMeals}
                  >
                    <Feather name="minus" size={20} color={COLORS.white} />
                  </Pressable>

                  <View style={styles.waterValueWrap}>
                    <AppText style={styles.waterValueText}>
                      {mealCount}
                    </AppText>
                    <AppText style={styles.waterValueUnit}>
                      {t('food.main.mealUnit')}
                    </AppText>
                  </View>

                  <Pressable
                    style={styles.waterCircleButton}
                    onPress={handleIncreaseMeals}
                  >
                    <Feather name="plus" size={20} color={COLORS.white} />
                  </Pressable>
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
                      {t('sleep.entry.iosDone')}
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
