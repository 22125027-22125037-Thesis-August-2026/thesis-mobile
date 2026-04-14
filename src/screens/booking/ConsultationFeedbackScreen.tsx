import React from 'react';
import { ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import { AppText } from '@/components';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, FONTS } from '@/theme';
import { RootStackParamList } from '@/navigation';
import styles from '@/screens/booking/ConsultationFeedbackScreen.styles';

type ConsultationFeedbackNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ConsultationFeedback'
>;

const RATING_EMOJIS = ['😞', '🙁', '😐', '🙂', '😄'] as const;

const ConsultationFeedbackScreen: React.FC = () => {
  const navigation = useNavigation<ConsultationFeedbackNavigationProp>();
  const { t } = useTranslation();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.85}>
        <Ionicons name="chevron-back" size={22} color={COLORS.consultationFeedbackTitle} />
      </TouchableOpacity>

      <View style={styles.card}>
        <AppText style={styles.summaryTitle}>Tổng kết buổi tham vấn</AppText>
        <AppText style={styles.summarySubtitle}>Video</AppText>
        <AppText style={styles.summaryTime}>12:33 PM</AppText>
        <AppText style={styles.summaryDate}>Ngày 14 Tháng 2, 2025</AppText>
      </View>

      <View style={styles.card}>
        <AppText style={styles.cardTitle}>Chuyên gia tâm lý</AppText>
        <View style={styles.therapistRow}>
          <View style={styles.avatar}>
            <Ionicons name="person-outline" size={30} color={COLORS.consultationFeedbackSecondary} />
          </View>
          <View>
            <AppText style={styles.therapistName}>Nguyen Van A</AppText>
            <AppText style={styles.therapistDescription}>
              6 năm kinh nghiệm trong lĩnh vực tâm lý Trẻ vị thành niên và thanh thiếu niên
            </AppText>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <AppText style={styles.cardTitle}>Đánh giá buổi tham vấn</AppText>
        <View style={styles.ratingRow}>
          {RATING_EMOJIS.map((emoji) => (
            <View key={emoji} style={styles.ratingCircle}>
              <AppText style={styles.ratingEmoji}>{emoji}</AppText>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <AppText style={styles.cardTitle}>Review</AppText>
        <TextInput
          style={[styles.input, { fontFamily: FONTS.regular }]}
          placeholder={t('booking.consultationFeedback.feedbackPlaceholder')}
          placeholderTextColor={COLORS.consultationFeedbackSecondary}
          multiline
        />
      </View>

      <View style={styles.card}>
        <AppText style={styles.cardTitle}>Bài tập về nhà 1</AppText>
        <AppText style={styles.subtitleStrong}>Đi dạo trong công viên</AppText>
        <AppText style={styles.descriptionText}>
          Dành 1 buổi chiều trong tuần để đi dạo trong công viên
        </AppText>
      </View>

      <View style={styles.card}>
        <AppText style={styles.cardTitle}>Buổi tham vấn tiếp theo</AppText>
        <TouchableOpacity style={styles.primaryButton} activeOpacity={0.9}>
          <AppText style={styles.primaryButtonText}>Đặt lịch</AppText>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <AppText style={styles.cardTitle}>Lí do cho buổi tham vấn</AppText>
        <AppText style={styles.descriptionText}>
          Dạo này tôi lo lắng cho tương lai, mất ăn mất ngủ...
        </AppText>
      </View>

      <TouchableOpacity style={styles.confirmButton} activeOpacity={0.9}>
        <AppText style={styles.confirmButtonText}>Xác nhận</AppText>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ConsultationFeedbackScreen;
