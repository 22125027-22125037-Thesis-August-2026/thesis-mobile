import React, { useEffect, useMemo, useState } from 'react';
import { View, Image, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CustomButton, AppText } from '@/components';
import { getTherapistDetails, TherapistDetail } from '@/api';
import { RootStackParamList } from '@/navigation';
import styles from '@/screens/booking/TherapistDetailScreen.styles';
import { COLORS } from '@/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'TherapistDetails'>;
type TherapistDetailRouteProp = RouteProp<RootStackParamList, 'TherapistDetails'>;

type StatItem = {
  id: string;
  icon: string;
  value: string;
  label: string;
};

const FALLBACK_AVATAR = require('../../assets/booking/doctor.png');

const TherapistDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<TherapistDetailRouteProp>();
  const therapistId = route.params.id;
  const [therapist, setTherapist] = useState<TherapistDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const loadTherapistDetail = async () => {
      setLoading(true);
      setErrorMessage('');

      try {
        const response = await getTherapistDetails(therapistId);
        setTherapist(response);
      } catch {
        setErrorMessage('Không thể tải thông tin chuyên gia. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    loadTherapistDetail();
  }, [therapistId]);

  const stats: StatItem[] = useMemo(() => {
    if (!therapist) {
      return [];
    }

    return [
      {
        id: '1',
        icon: 'people-outline',
        value: therapist.stats.patientCount.toLocaleString(),
        label: 'Bệnh nhân',
      },
      {
        id: '2',
        icon: 'briefcase-outline',
        value: `${therapist.stats.yearsOfExperience.toLocaleString()}+`,
        label: 'Kinh nghiệm',
      },
      {
        id: '3',
        icon: 'star-outline',
        value: therapist.stats.averageRating.toFixed(1),
        label: 'Rating',
      },
      {
        id: '4',
        icon: 'chatbubble-ellipses-outline',
        value: therapist.stats.reviewCount.toLocaleString(),
        label: 'Đánh giá',
      },
    ];
  }, [therapist]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => {
      const iconName = index < rating ? 'star' : 'star-outline';

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
        {loading ? (
          <View style={styles.sectionCard}>
            <ActivityIndicator color={COLORS.primary} size="small" />
            <AppText style={styles.sectionBody}>Đang tải thông tin chuyên gia...</AppText>
          </View>
        ) : null}

        {!loading && errorMessage ? (
          <View style={styles.sectionCard}>
            <AppText style={styles.sectionTitle}>Có lỗi xảy ra</AppText>
            <AppText style={styles.sectionBody}>{errorMessage}</AppText>
          </View>
        ) : null}

        {!loading && therapist ? (
          <>
        <View style={styles.therapistCard}>
          <Image
            source={therapist.avatarUrl ? { uri: therapist.avatarUrl } : FALLBACK_AVATAR}
            style={styles.therapistImage}
            resizeMode="cover"
          />
          <View style={styles.therapistInfo}>
            <AppText style={styles.therapistName}>{therapist.fullName}</AppText>
            <AppText style={styles.therapistSpecialty}>{therapist.specialty}</AppText>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={16} color={COLORS.textSecondary} />
              <AppText style={styles.locationText}>{therapist.location}</AppText>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          {stats.map((stat) => (
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
          <AppText style={styles.sectionBody}>{therapist.bio}</AppText>
        </View>

        <View style={styles.sectionCard}>
          <AppText style={styles.sectionTitle}>Giờ làm việc</AppText>
          {therapist.workingHours.length > 0 ? (
            therapist.workingHours.map((workingHour) => (
              <View
                key={`${workingHour.dayLabel}-${workingHour.startTime}-${workingHour.endTime}`}
                style={styles.workingHourRow}
              >
                <Ionicons name="time-outline" size={18} color={COLORS.primary} />
                <AppText style={styles.workingHourText}>
                  {`${workingHour.dayLabel}: ${workingHour.startTime} - ${workingHour.endTime}`}
                </AppText>
              </View>
            ))
          ) : (
            <AppText style={styles.workingHourText}>Chưa có lịch làm việc</AppText>
          )}
        </View>

        <View style={styles.sectionCard}>
          <AppText style={styles.sectionTitle}>Đánh giá</AppText>
          {therapist.reviews.length > 0 ? (
            therapist.reviews.map((review) => (
            <View key={review.id} style={styles.reviewItem}>
              <Image
                source={review.reviewerAvatarUrl ? { uri: review.reviewerAvatarUrl } : FALLBACK_AVATAR}
                style={styles.reviewAvatar}
                resizeMode="cover"
              />
              <View style={styles.reviewContent}>
                <View style={styles.reviewHeaderRow}>
                  <AppText style={styles.reviewName}>{review.reviewerName}</AppText>
                  <View style={styles.starRow}>{renderStars(review.rating)}</View>
                </View>
                <AppText style={styles.reviewComment}>{review.comment}</AppText>
              </View>
            </View>
            ))
          ) : (
            <AppText style={styles.sectionBody}>Chưa có đánh giá nào</AppText>
          )}
        </View>
          </>
        ) : null}
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