import React from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';
import { RootStackParamList } from '../../navigation/types';
import styles from './ConsultationFeedbackScreen.styles';

type ConsultationFeedbackNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ConsultationFeedback'
>;

const RATING_EMOJIS = ['😞', '🙁', '😐', '🙂', '😄'] as const;

const ConsultationFeedbackScreen: React.FC = () => {
  const navigation = useNavigation<ConsultationFeedbackNavigationProp>();

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
        <Text style={styles.summaryTitle}>Tổng kết buổi tham vấn</Text>
        <Text style={styles.summarySubtitle}>Video</Text>
        <Text style={styles.summaryTime}>12:33 PM</Text>
        <Text style={styles.summaryDate}>Ngày 14 Tháng 2, 2025</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Chuyên gia tâm lý</Text>
        <View style={styles.therapistRow}>
          <View style={styles.avatar}>
            <Ionicons name="person-outline" size={30} color={COLORS.consultationFeedbackSecondary} />
          </View>
          <View>
            <Text style={styles.therapistName}>Nguyen Van A</Text>
            <Text style={styles.therapistDescription}>
              6 năm kinh nghiệm trong lĩnh vực tâm lý Trẻ vị thành niên và thanh thiếu niên
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Đánh giá buổi tham vấn</Text>
        <View style={styles.ratingRow}>
          {RATING_EMOJIS.map((emoji) => (
            <View key={emoji} style={styles.ratingCircle}>
              <Text style={styles.ratingEmoji}>{emoji}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Review</Text>
        <TextInput
          style={styles.input}
          placeholder="Tôi thấy session này rất hiệu quả"
          placeholderTextColor={COLORS.consultationFeedbackSecondary}
          multiline
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Bài tập về nhà 1</Text>
        <Text style={styles.subtitleStrong}>Đi dạo trong công viên</Text>
        <Text style={styles.descriptionText}>
          Dành 1 buổi chiều trong tuần để đi dạo trong công viên
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Buổi tham vấn tiếp theo</Text>
        <TouchableOpacity style={styles.primaryButton} activeOpacity={0.9}>
          <Text style={styles.primaryButtonText}>Đặt lịch</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Lí do cho buổi tham vấn</Text>
        <Text style={styles.descriptionText}>
          Dạo này tôi lo lắng cho tương lai, mất ăn mất ngủ...
        </Text>
      </View>

      <TouchableOpacity style={styles.confirmButton} activeOpacity={0.9}>
        <Text style={styles.confirmButtonText}>Xác nhận</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ConsultationFeedbackScreen;
