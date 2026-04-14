import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppText } from '@/components';
import {
  NavigationProp,
  ParamListBase,
  useNavigation,
} from '@react-navigation/native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';

import * as sleepApi from '@/api/sleepApi';
import { COLORS, FONTS } from '@/theme';
import { SleepLogRequest } from '@/types';
import { styles } from '@/screens/tracking/sleep/SleepEntryScreen.styles';

type PickerTarget = 'bedTime' | 'wakeTime' | null;

type SleepQualityOption = {
  value: number;
  titleKey: string;
  subtitleKey: string;
  icon: string;
  color: string;
};

const SLEEP_QUALITY_OPTIONS: SleepQualityOption[] = [
  {
    value: 5,
    titleKey: 'sleep.entry.quality.excellent.title',
    subtitleKey: 'sleep.entry.quality.excellent.subtitle',
    icon: 'emoticon-excited-outline',
    color: COLORS.journalMoodExcellent,
  },
  {
    value: 4,
    titleKey: 'sleep.entry.quality.good.title',
    subtitleKey: 'sleep.entry.quality.good.subtitle',
    icon: 'emoticon-happy-outline',
    color: COLORS.journalMoodNeutral,
  },
  {
    value: 3,
    titleKey: 'sleep.entry.quality.neutral.title',
    subtitleKey: 'sleep.entry.quality.neutral.subtitle',
    icon: 'emoticon-neutral-outline',
    color: COLORS.textSecondary,
  },
  {
    value: 2,
    titleKey: 'sleep.entry.quality.bad.title',
    subtitleKey: 'sleep.entry.quality.bad.subtitle',
    icon: 'emoticon-sad-outline',
    color: COLORS.journalMoodBad,
  },
  {
    value: 1,
    titleKey: 'sleep.entry.quality.terrible.title',
    subtitleKey: 'sleep.entry.quality.terrible.subtitle',
    icon: 'emoticon-cry-outline',
    color: COLORS.journalMoodActive,
  },
];

const getDefaultBedTime = (): Date => {
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() - 1);
  defaultDate.setHours(22, 0, 0, 0);
  return defaultDate;
};

const getDefaultWakeTime = (): Date => {
  const defaultDate = new Date();
  defaultDate.setHours(6, 0, 0, 0);
  return defaultDate;
};

const getTimeLocale = (language: string): string => {
  return language.startsWith('vi') ? 'vi-VN' : 'en-US';
};

const formatHourMinute = (date: Date, locale: string): string => {
  return date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

const SleepEntryScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { i18n, t } = useTranslation();
  const timeLocale = getTimeLocale(i18n.resolvedLanguage ?? i18n.language);

  const [bedTime, setBedTime] = useState<Date>(getDefaultBedTime);
  const [wakeTime, setWakeTime] = useState<Date>(getDefaultWakeTime);
  const [sleepQuality, setSleepQuality] = useState<number>(3);
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null);

  const canSubmit = useMemo(() => !isSubmitting, [isSubmitting]);

  const openPicker = (target: Exclude<PickerTarget, null>): void => {
    setPickerTarget(target);
  };

  const closePicker = (): void => {
    setPickerTarget(null);
  };

  const currentPickerValue = pickerTarget === 'wakeTime' ? wakeTime : bedTime;

  const updateTargetTime = (nextDate: Date): void => {
    if (pickerTarget === 'bedTime') {
      setBedTime(nextDate);
      return;
    }

    if (pickerTarget === 'wakeTime') {
      setWakeTime(nextDate);
    }
  };

  const handlePickerChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ): void => {
    if (event.type === 'dismissed') {
      closePicker();
      return;
    }

    if (selectedDate) {
      updateTargetTime(selectedDate);
    }

    if (Platform.OS !== 'ios') {
      closePicker();
    }
  };

  const handleSubmit = async (): Promise<void> => {
    setIsSubmitting(true);

    const payload: SleepLogRequest = {
      bedTime: bedTime.toISOString(),
      wakeTime: wakeTime.toISOString(),
      sleepQuality,
      note: note.trim(),
    };

    try {
      await sleepApi.createSleepLog(payload);
      Alert.alert(
        t('sleep.entry.successTitle'),
        t('sleep.entry.successMessage'),
      );
      navigation.goBack();
    } catch {
      Alert.alert(t('sleep.entry.errorTitle'), t('sleep.entry.errorMessage'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.screen}>
          <ScrollView
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.headerRow}>
              <Pressable style={styles.backButton} onPress={navigation.goBack}>
                <Feather
                  name="arrow-left"
                  size={20}
                  color={COLORS.textPrimary}
                />
              </Pressable>
              <AppText style={styles.headerLabel}>
                {t('sleep.entry.headerTitle')}
              </AppText>
            </View>

            <AppText style={styles.title}>
              {t('sleep.entry.mainQuestion')}
            </AppText>

            <View style={styles.timeRow}>
              <Pressable
                style={styles.timeCard}
                onPress={() => openPicker('bedTime')}
              >
                <AppText style={styles.timeLabel}>
                  {t('sleep.entry.bedTimeLabel')}
                </AppText>
                <View style={styles.timeValueRow}>
                  <AppText style={styles.timeValue}>
                    {formatHourMinute(bedTime, timeLocale)}
                  </AppText>
                  <Feather
                    name="clock"
                    size={18}
                    color={COLORS.textSecondary}
                  />
                </View>
              </Pressable>

              <Pressable
                style={styles.timeCard}
                onPress={() => openPicker('wakeTime')}
              >
                <AppText style={styles.timeLabel}>
                  {t('sleep.entry.wakeTimeLabel')}
                </AppText>
                <View style={styles.timeValueRow}>
                  <AppText style={styles.timeValue}>
                    {formatHourMinute(wakeTime, timeLocale)}
                  </AppText>
                  <Feather name="sun" size={18} color={COLORS.textSecondary} />
                </View>
              </Pressable>
            </View>

            <View style={styles.selectorSection}>
              {SLEEP_QUALITY_OPTIONS.map(option => {
                const isSelected = sleepQuality === option.value;

                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.qualityRow,
                      isSelected && styles.qualityRowSelected,
                    ]}
                    onPress={() => setSleepQuality(option.value)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.qualityTextBlock}>
                      <AppText style={styles.qualityTitle}>
                        {t(option.titleKey)}
                      </AppText>
                      <AppText style={styles.qualitySubtitle}>
                        {t(option.subtitleKey)}
                      </AppText>
                    </View>

                    <View style={styles.timelineHolder}>
                      <View style={styles.timelineTrack}>
                        {isSelected ? (
                          <View
                            style={[
                              styles.timelineKnob,
                              { backgroundColor: option.color },
                            ]}
                          />
                        ) : null}
                      </View>
                    </View>

                    <View style={styles.iconHolder}>
                      <MaterialCommunityIcons
                        name={option.icon}
                        size={26}
                        color={option.color}
                      />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View>
              <AppText style={styles.sectionTitle}>
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
                  editable={!isSubmitting}
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              style={[
                styles.submitButton,
                !canSubmit && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!canSubmit}
            >
              {isSubmitting ? (
                <ActivityIndicator color={COLORS.buttonPrimaryText} />
              ) : (
                <View style={styles.submitContent}>
                  <AppText style={styles.submitText}>
                    {t('sleep.entry.submitButton')}
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

          {pickerTarget && Platform.OS !== 'ios' ? (
            <DateTimePicker
              value={currentPickerValue}
              mode="time"
              is24Hour
              display="default"
              onChange={handlePickerChange}
            />
          ) : null}

          {pickerTarget && Platform.OS === 'ios' ? (
            <>
              <Pressable
                style={styles.iosPickerBackdrop}
                onPress={closePicker}
              />
              <View style={styles.iosPickerCard}>
                <View style={styles.iosPickerHeader}>
                  <Pressable onPress={closePicker}>
                    <AppText style={styles.iosPickerDone}>
                      {t('sleep.entry.iosDone')}
                    </AppText>
                  </Pressable>
                </View>
                <DateTimePicker
                  value={currentPickerValue}
                  mode="time"
                  is24Hour
                  display="spinner"
                  onChange={handlePickerChange}
                />
              </View>
            </>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SleepEntryScreen;
