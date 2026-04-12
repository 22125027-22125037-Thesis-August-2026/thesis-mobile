// src/screens/booking/MatchingFormScreen.tsx
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '@/navigation';
import { COLORS } from '@/theme';
import { MatchingFormData, INITIAL_MATCHING_FORM } from '@/types';
import { saveMatchingData } from '@/api';
import { CustomInput } from '@/components';
import styles from '@/screens/booking/MatchingFormScreen.styles';

const TOTAL_STEPS = 8;
const SCALE_VALUES = [1, 2, 3, 4, 5];

type StringFieldKey = {
  [K in keyof MatchingFormData]: MatchingFormData[K] extends string ? K : never;
}[keyof MatchingFormData];
type MoodLevelKey = keyof MatchingFormData['moodLevels'];

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MatchingForm'>;

const getOptionArrays = (t: (key: string) => string) => ({
  PRIOR_COUNSELING_OPTIONS: [
    t('matching.priorCounseling.never'),
    t('matching.priorCounseling.ineffective'),
    t('matching.priorCounseling.effective'),
  ],
  GENDER_OPTIONS: [
    t('matching.gender.male'),
    t('matching.gender.female'),
    t('matching.gender.other'),
  ],
  SEXUAL_ORIENTATION_OPTIONS: [
    t('matching.sexualOrientation.straight'),
    t('matching.sexualOrientation.gay'),
    t('matching.sexualOrientation.lesbian'),
    t('matching.sexualOrientation.bisexual'),
    t('matching.sexualOrientation.pansexual'),
    t('matching.sexualOrientation.asexual'),
    t('matching.sexualOrientation.exploring'),
    t('matching.sexualOrientation.noAnswer'),
  ],
  BINARY_OPTIONS: [
    t('matching.binaryOptions.no'),
    t('matching.binaryOptions.yes'),
  ],
  REASONS_OPTIONS: [
    t('matching.reasons.anxiety'),
    t('matching.reasons.depression'),
    t('matching.reasons.stress'),
    t('matching.reasons.insomnia'),
    t('matching.reasons.relationship'),
    t('matching.reasons.trauma'),
    t('matching.reasons.eating'),
  ],
  COMMUNICATION_STYLE_OPTIONS: [
    t('matching.communicationStyle.listener'),
    t('matching.communicationStyle.guide'),
    t('matching.communicationStyle.combined'),
  ],
});

const MatchingFormScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<MatchingFormData>(INITIAL_MATCHING_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const options = useMemo(() => getOptionArrays(t), [t]);

  /* ─── Helpers ─── */
  const updateField = <K extends keyof MatchingFormData>(key: K, value: MatchingFormData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const toggleReason = (value: string) => {
    setFormData(prev => {
      const current = prev.reasons;
      const next = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, reasons: next };
    });
  };

  const updateMoodLevel = (key: MoodLevelKey, value: number) => {
    setFormData(prev => ({
      ...prev,
      moodLevels: {
        ...prev.moodLevels,
        [key]: value,
      },
    }));
  };

  const renderPillSelect = (
    options: string[],
    selectedValue: string,
    fieldKey: StringFieldKey,
  ) => (
    <View style={styles.pillContainer}>
      {options.map(option => {
        const isSelected = selectedValue === option;
        return (
          <TouchableOpacity
            key={option}
            style={[styles.pill, isSelected ? styles.pillSelected : styles.pillUnselected]}
            onPress={() => updateField(fieldKey, option)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.pillText,
                isSelected ? styles.pillTextSelected : styles.pillTextUnselected,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderVerticalSingleSelect = (
    options: string[],
    selectedValue: string,
    fieldKey: StringFieldKey,
  ) => (
    <View style={styles.verticalOptionContainer}>
      {options.map(option => {
        const isSelected = selectedValue === option;
        return (
          <TouchableOpacity
            key={option}
            style={[
              styles.verticalOption,
              isSelected ? styles.verticalOptionSelected : styles.verticalOptionUnselected,
            ]}
            onPress={() => updateField(fieldKey, option)}
            activeOpacity={0.75}
          >
            <Text
              style={[
                styles.verticalOptionText,
                isSelected ? styles.verticalOptionTextSelected : styles.verticalOptionTextUnselected,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderVerticalMultiSelect = (options: string[], selectedValues: string[]) => (
    <View style={styles.verticalOptionContainer}>
      {options.map(option => {
        const isSelected = selectedValues.includes(option);
        return (
          <TouchableOpacity
            key={option}
            style={[
              styles.verticalOption,
              isSelected ? styles.verticalOptionSelected : styles.verticalOptionUnselected,
            ]}
            onPress={() => toggleReason(option)}
            activeOpacity={0.75}
          >
            <Text
              style={[
                styles.verticalOptionText,
                isSelected ? styles.verticalOptionTextSelected : styles.verticalOptionTextUnselected,
              ]}
            >
              {option}
            </Text>
            {isSelected && <Ionicons name="checkmark" size={16} color={COLORS.text} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderMoodScale = (label: string, field: MoodLevelKey) => {
    const currentValue = formData.moodLevels[field];
    return (
      <View style={styles.scaleSection}>
        <Text style={styles.scaleTitle}>{label}</Text>
        <View style={styles.gradientTrack}>
          <View style={[styles.gradientSegment, styles.gradientSegmentStart]} />
          <View style={[styles.gradientSegment, styles.gradientSegmentMiddle]} />
          <View style={[styles.gradientSegment, styles.gradientSegmentEnd]} />
        </View>
        <View style={styles.scaleButtonsRow}>
          {SCALE_VALUES.map(value => {
            const isSelected = currentValue === value;
            return (
              <TouchableOpacity
                key={`${field}-${value}`}
                style={[
                  styles.scalePoint,
                  isSelected ? styles.scalePointSelected : styles.scalePointUnselected,
                ]}
                onPress={() => updateMoodLevel(field, value)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.scalePointText,
                    isSelected ? styles.scalePointTextSelected : styles.scalePointTextUnselected,
                  ]}
                >
                  {value}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.scaleLegendRow}>
          <Text style={styles.scaleLegendText}>Ít</Text>
          <Text style={styles.scaleLegendText}>Nhiều</Text>
        </View>
      </View>
    );
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 1:
        return formData.hasPriorCounseling !== '';
      case 2:
        return formData.gender !== '' && formData.age.trim() !== '';
      case 3:
        return formData.sexualOrientation !== '';
      case 4:
        return formData.isLgbtqPriority !== '';
      case 5:
        return formData.selfHarmThought !== '';
      case 6:
        return formData.reasons.length > 0;
      case 7:
        return true;
      case 8:
        return formData.communicationStyle !== '';
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (step < TOTAL_STEPS) {
      setStep(prev => prev + 1);
      return;
    }
    // Final step — submit
    setIsSubmitting(true);
    try {
      await saveMatchingData(formData);
      navigation.navigate('TherapistFilter', { matchingSuccess: true });
    } catch {
      Alert.alert(t('auth.common.errorTitle'), t('matching.submitError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    } else {
      navigation.goBack();
    }
  };

  /* ─── Step Content ─── */
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.card}>
            <Text style={styles.questionTitle}>{t('matching.form.step1Title')}</Text>
            <Text style={styles.questionSubtitle}>
              {t('matching.form.step1Subtitle')}
            </Text>
            {renderVerticalSingleSelect(
              options.PRIOR_COUNSELING_OPTIONS,
              formData.hasPriorCounseling,
              'hasPriorCounseling',
            )}
          </View>
        );

      case 2:
        return (
          <View style={styles.card}>
            <Text style={styles.questionTitle}>{t('matching.form.step2Title')}</Text>
            <Text style={styles.questionSubtitle}>
              {t('matching.form.step2Subtitle')}
            </Text>
            {renderPillSelect(options.GENDER_OPTIONS, formData.gender, 'gender')}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputQuestionLabel}>{t('matching.form.step2AgeLabel')}</Text>
              <CustomInput
                iconName="calendar-outline"
                placeholder={t('matching.form.step2AgePlaceholder')}
                value={formData.age}
                onChangeText={text => updateField('age', text.replace(/[^0-9]/g, ''))}
              />
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.card}>
            <Text style={styles.questionTitle}>{t('matching.form.step3Title')}</Text>
            <Text style={styles.questionSubtitle}>
              {t('matching.form.step3Subtitle')}
            </Text>
            {renderPillSelect(
              options.SEXUAL_ORIENTATION_OPTIONS,
              formData.sexualOrientation,
              'sexualOrientation',
            )}
          </View>
        );

      case 4:
        return (
          <View style={styles.card}>
            <Text style={styles.questionTitle}>
              {t('matching.form.step4Title')}
            </Text>
            <Text style={styles.questionSubtitle}>
              {t('matching.form.step4Subtitle')}
            </Text>
            {renderPillSelect(options.BINARY_OPTIONS, formData.isLgbtqPriority, 'isLgbtqPriority')}
          </View>
        );

      case 5:
        return (
          <View style={styles.card}>
            <Text style={styles.questionTitle}>
              {t('matching.form.step5Title')}
            </Text>
            <Text style={styles.questionSubtitle}>
              {t('matching.form.step5Subtitle')}
            </Text>
            {renderPillSelect(options.BINARY_OPTIONS, formData.selfHarmThought, 'selfHarmThought')}
          </View>
        );

      case 6:
        return (
          <View style={styles.card}>
            <Text style={styles.questionTitle}>{t('matching.form.step6Title')}</Text>
            <Text style={styles.questionSubtitle}>
              {t('matching.form.step6Subtitle')}
            </Text>
            {renderVerticalMultiSelect(options.REASONS_OPTIONS, formData.reasons)}
          </View>
        );

      case 7:
        return (
          <View style={styles.card}>
            <Text style={styles.questionTitle}>{t('matching.form.step7Title')}</Text>
            <Text style={styles.questionSubtitle}>
              {t('matching.form.step7Subtitle')}
            </Text>
            {renderMoodScale(t('matching.moodScales.anxiety'), 'anxiety')}
            {renderMoodScale(t('matching.moodScales.lossInterest'), 'lossInterest')}
            {renderMoodScale(t('matching.form.step7Fatigue'), 'fatigue')}
          </View>
        );

      case 8:
        return (
          <View style={styles.card}>
            <Text style={styles.questionTitle}>{t('matching.form.step8Title')}</Text>
            <Text style={styles.questionSubtitle}>
              {t('matching.form.step8Subtitle')}
            </Text>
            {renderVerticalSingleSelect(
              options.COMMUNICATION_STYLE_OPTIONS,
              formData.communicationStyle,
              'communicationStyle',
            )}
          </View>
        );

      default:
        return null;
    }
  };

  /* ─── Render ─── */
  return (
    <View style={styles.container}>
      {/* Header with progress */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.stepIndicator}>
            {step}/{TOTAL_STEPS}
          </Text>
        </View>
        <Text style={styles.brandText}>uMatter</Text>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFill, { width: `${(step / TOTAL_STEPS) * 100}%` }]} />
        </View>
      </View>

      {/* Content */}
      <ImageBackground
        source={require('../../assets/booking/leaf_bg.png')}
        style={styles.leafBackground}
        resizeMode="cover"
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {renderStepContent()}
        </ScrollView>
      </ImageBackground>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.footerButtonNext, !canProceed() && styles.footerButtonNextDisabled]}
          onPress={handleNext}
          disabled={!canProceed() || isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Ionicons name="arrow-forward" size={24} color={COLORS.white} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MatchingFormScreen;
