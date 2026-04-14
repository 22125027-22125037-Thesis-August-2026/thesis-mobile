import React from 'react';
import { View, Image, ScrollView, TouchableOpacity } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CustomButton, AppText } from '@/components';
import { RootStackParamList } from '@/navigation';
import styles from '@/screens/booking/TherapistDetailScreen.styles';
import { COLORS } from '@/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'TherapistDetails'>;
type TherapistDetailRouteProp = RouteProp<RootStackParamList, 'TherapistDetails'>;

type StatItem = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
};

type ReviewItem = {
  id: string;
  name: string;
  rating: number;
  comment: string;
};

const STATS: StatItem[] = [
  { id: '1', icon: 'people-outline', value: '2,000+', label: 'Bệnh nhân' },
  { id: '2', icon: 'briefcase-outline', value: '10+', label: 'Kinh nghiệm' },
  { id: '3', icon: 'star-outline', value: '4.8', label: 'Rating' },
  { id: '4', icon: 'chatbubble-ellipses-outline', value: '1,872', label: 'Đánh giá' },
];

const REVIEWS: ReviewItem[] = [
  {
    id: '1',
    name: 'Nguyen Thi Mai',
    rating: 5,
    comment: 'Bác sĩ lắng nghe rất kỹ và đưa ra hướng dẫn thực tế, dễ áp dụng.',
  },
  {
    id: '2',
    name: 'Tran Minh Quan',
    rating: 4,
    comment: 'Buổi trị liệu rất hiệu quả, tôi thấy thoải mái hơn sau mỗi lần gặp.',
  },
  {
    id: '3',
    name: 'Le Bao Chau',
    rating: 5,
    comment: 'Không gian trao đổi an toàn, tôi cảm thấy được tôn trọng và thấu hiểu.',
  },
];

const TherapistDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<TherapistDetailRouteProp>();
  const therapistId = route.params.id;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => {
      const iconName: keyof typeof Ionicons.glyphMap =
        index < rating ? 'star' : 'star-outline';

      return (
        <Ionicons
          key={`${therapistId}-star-${index + 1}`}
          name={iconName}
          size={14}
          color={COLORS.accentNeutral}
          style={styles.starIcon}
        />
      );
    });
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.white} />
        </TouchableOpacity>
        <AppText style={styles.headerTitle}>Thông tin chi tiết</AppText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.therapistCard}>
          <Image
            source={require('../../assets/booking/doctor.png')}
            style={styles.therapistImage}
            resizeMode="cover"
          />
          <View style={styles.therapistInfo}>
            <AppText style={styles.therapistName}>Dr. David Patel</AppText>
            <AppText style={styles.therapistSpecialty}>Tâm lý học lâm sàng</AppText>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={16} color={COLORS.textSecondary} />
              <AppText style={styles.locationText}>TP. Ho Chi Minh</AppText>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          {STATS.map((stat) => (
            <View key={stat.id} style={styles.statItem}>
              <View style={styles.statIconWrap}>
                <Ionicons name={stat.icon} size={18} color={COLORS.primary} />
              </View>
              <AppText style={styles.statValue}>{stat.value}</AppText>
              <AppText style={styles.statLabel}>{stat.label}</AppText>
            </View>
          ))}
        </View>

        <View style={styles.sectionCard}>
          <AppText style={styles.sectionTitle}>Giới thiệu bản thân</AppText>
          <AppText style={styles.sectionBody}>
            Tôi là chuyên gia tâm lý với hơn 10 năm kinh nghiệm trong lĩnh vực trị liệu
            lo âu, trầm cảm và quản lý stress. Mục tiêu của tôi là giúp bạn tìm lại
            sự cân bằng cảm xúc và nâng cao chất lượng cuộc sống.
          </AppText>
        </View>

        <View style={styles.sectionCard}>
          <AppText style={styles.sectionTitle}>Giờ làm việc</AppText>
          <View style={styles.workingHourRow}>
            <Ionicons name="time-outline" size={18} color={COLORS.primary} />
            <AppText style={styles.workingHourText}>Thứ 2 - Thứ 6: 08:00 - 18:00</AppText>
          </View>
          <View style={styles.workingHourRow}>
            <Ionicons name="time-outline" size={18} color={COLORS.primary} />
            <AppText style={styles.workingHourText}>Thứ 7: 08:00 - 12:00</AppText>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <AppText style={styles.sectionTitle}>Đánh giá</AppText>
          {REVIEWS.map((review) => (
            <View key={review.id} style={styles.reviewItem}>
              <Image
                source={require('../../assets/booking/doctor.png')}
                style={styles.reviewAvatar}
                resizeMode="cover"
              />
              <View style={styles.reviewContent}>
                <View style={styles.reviewHeaderRow}>
                  <AppText style={styles.reviewName}>{review.name}</AppText>
                  <View style={styles.starRow}>{renderStars(review.rating)}</View>
                </View>
                <AppText style={styles.reviewComment}>{review.comment}</AppText>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <CustomButton
          title="Đặt lịch hẹn"
          onPress={() => navigation.navigate('Booking', { therapistId })}
        />
      </View>
    </View>
  );
};

export default TherapistDetailScreen;