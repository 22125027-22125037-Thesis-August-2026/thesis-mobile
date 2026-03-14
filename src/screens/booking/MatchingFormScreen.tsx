// src/screens/booking/MatchingFormScreen.tsx
import React, { useState } from 'react';
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
import { RootStackParamList } from '../../navigation/types';
import { COLORS } from '../../constants/colors';
import { MatchingFormData, INITIAL_MATCHING_FORM } from '../../types/matching';
import { saveMatchingData } from '../../api/therapistApi';
import CustomInput from '../../components/CustomInput';
import styles from './MatchingFormScreen.styles';

const TOTAL_STEPS = 8;
const SCALE_VALUES = [1, 2, 3, 4, 5];

/* ─── Option data ─── */
const PRIOR_COUNSELING_OPTIONS = [
  'Chưa bao giờ',
  'Đã từng, nhưng không hiệu quả',
  'Đã từng, và thấy rất tốt',
];
const GENDER_OPTIONS = ['Nam', 'Nữ', 'Khác'];
const SEXUAL_ORIENTATION_OPTIONS = [
  'Straight',
  'Gay',
  'Lesbian',
  'Bisexual',
  'Pansexual',
  'Asexual',
  'Đang tìm hiểu',
  'Không muốn nói',
];
const BINARY_OPTIONS = ['Không', 'Có'];
const REASONS_OPTIONS = [
  'Lo âu, hồi hộp',
  'Buồn chán, mất động lực',
  'Áp lực học tập/thi cử',
  'Mất ngủ',
  'Mối quan hệ/Gia đình',
  'Chấn thương tâm lý',
  'Rối loạn ăn uống',
];
const COMMUNICATION_STYLE_OPTIONS = ['Người lắng nghe', 'Người hướng dẫn', 'Kết hợp cả hai'];

type StringFieldKey = {
  [K in keyof MatchingFormData]: MatchingFormData[K] extends string ? K : never;
}[keyof MatchingFormData];
type MoodLevelKey = keyof MatchingFormData['moodLevels'];

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MatchingForm'>;

const MatchingFormScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<MatchingFormData>(INITIAL_MATCHING_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      Alert.alert('Lỗi', 'Không thể gửi dữ liệu. Vui lòng thử lại.');
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
            <Text style={styles.questionTitle}>Bạn đã từng đi trị liệu bao giờ chưa?</Text>
            <Text style={styles.questionSubtitle}>
              Câu trả lời giúp chuyên gia hiểu điểm bắt đầu của bạn.
            </Text>
            {renderVerticalSingleSelect(
              PRIOR_COUNSELING_OPTIONS,
              formData.hasPriorCounseling,
              'hasPriorCounseling',
            )}
          </View>
        );

      case 2:
        return (
          <View style={styles.card}>
            <Text style={styles.questionTitle}>Giới tính của bạn là gì?</Text>
            <Text style={styles.questionSubtitle}>
              Chúng tôi dùng thông tin này để tinh chỉnh kết quả ghép nối.
            </Text>
            {renderPillSelect(GENDER_OPTIONS, formData.gender, 'gender')}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputQuestionLabel}>Bạn bao nhiêu tuổi?</Text>
              <CustomInput
                iconName="calendar-outline"
                placeholder="Nhập tuổi của bạn"
                value={formData.age}
                onChangeText={text => updateField('age', text.replace(/[^0-9]/g, ''))}
              />
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.card}>
            <Text style={styles.questionTitle}>Bạn xác định xu hướng tình dục của mình là?</Text>
            <Text style={styles.questionSubtitle}>
              Bạn có thể bỏ qua bằng cách chọn "Không muốn nói".
            </Text>
            {renderPillSelect(
              SEXUAL_ORIENTATION_OPTIONS,
              formData.sexualOrientation,
              'sexualOrientation',
            )}
          </View>
        );

      case 4:
        return (
          <View style={styles.card}>
            <Text style={styles.questionTitle}>
              Bạn có muốn được ưu tiên ghép đôi với chuyên gia thuộc cộng đồng LGBTQ+ không?
            </Text>
            <Text style={styles.questionSubtitle}>
              Điều này giúp hệ thống ưu tiên danh sách chuyên gia phù hợp với bạn.
            </Text>
            {renderPillSelect(BINARY_OPTIONS, formData.isLgbtqPriority, 'isLgbtqPriority')}
          </View>
        );

      case 5:
        return (
          <View style={styles.card}>
            <Text style={styles.questionTitle}>
              Hiện tại, bạn có đang suy nghĩ về việc làm hại bản thân hoặc người khác không?
            </Text>
            <Text style={styles.questionSubtitle}>
              Nếu bạn cần hỗ trợ khẩn cấp, hãy liên hệ dịch vụ y tế ngay lập tức.
            </Text>
            {renderPillSelect(BINARY_OPTIONS, formData.selfHarmThought, 'selfHarmThought')}
          </View>
        );

      case 6:
        return (
          <View style={styles.card}>
            <Text style={styles.questionTitle}>Điều gì khiến bạn tìm đến trị liệu hôm nay?</Text>
            <Text style={styles.questionSubtitle}>
              Bạn có thể chọn nhiều hơn một lý do.
            </Text>
            {renderVerticalMultiSelect(REASONS_OPTIONS, formData.reasons)}
          </View>
        );

      case 7:
        return (
          <View style={styles.card}>
            <Text style={styles.questionTitle}>Hôm nay bạn đang cảm thấy như thế nào?</Text>
            <Text style={styles.questionSubtitle}>
              Chọn mức độ cho từng trạng thái từ ít đến nhiều.
            </Text>
            {renderMoodScale('Lo lắng', 'anxiety')}
            {renderMoodScale('Mất hứng thú', 'lossInterest')}
            {renderMoodScale('Mệt mỏi', 'fatigue')}
          </View>
        );

      case 8:
        return (
          <View style={styles.card}>
            <Text style={styles.questionTitle}>Bạn mong đợi phong cách giao tiếp nào từ chuyên gia?</Text>
            <Text style={styles.questionSubtitle}>
              Chọn kiểu trao đổi khiến bạn cảm thấy thoải mái nhất.
            </Text>
            {renderVerticalSingleSelect(
              COMMUNICATION_STYLE_OPTIONS,
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
