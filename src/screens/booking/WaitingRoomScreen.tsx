import React, { useEffect, useMemo, useState } from 'react';
import { Image, ScrollView, TouchableOpacity, View } from 'react-native';
import { AppText } from '@/components';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AxiosError } from 'axios';
import { bookSession, getTherapistDetails, TherapistDetail } from '@/api';
import { RootStackParamList } from '@/navigation';
import { COLORS } from '@/theme';
import styles from '@/screens/booking/WaitingRoomScreen.styles';

type WaitingRoomRouteProp = RouteProp<RootStackParamList, 'WaitingRoom'>;
type WaitingRoomNavigationProp = NativeStackNavigationProp<RootStackParamList, 'WaitingRoom'>;

const FALLBACK_REASON =
  'Bạn đang cảm thấy áp lực và mong muốn nhận được sự hỗ trợ từ chuyên gia để cải thiện tinh thần.';
const FALLBACK_AVATAR = require('../../assets/booking/doctor.png');

const TEN_MINUTES_IN_MS = 10 * 60 * 1000;

const parseAppointmentStart = (slotStartDatetime: string): Date | null => {
  const parsed = new Date(slotStartDatetime);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatRelativeRemaining = (remainingMs: number): string => {
  if (remainingMs <= 0) {
    return 'đã bắt đầu';
  }

  const totalMinutes = Math.floor(remainingMs / 60000);
  if (totalMinutes < 1) {
    return 'trong vài giây nữa';
  }

  if (totalMinutes < 60) {
    return `trong ${totalMinutes} phút nữa`;
  }

  const totalHours = Math.floor(totalMinutes / 60);
  if (totalHours < 24) {
    return `trong ${totalHours} giờ nữa`;
  }

  const totalDays = Math.floor(totalHours / 24);
  if (totalDays < 30) {
    return `trong ${totalDays} ngày nữa`;
  }

  const totalMonths = Math.floor(totalDays / 30);
  if (totalMonths < 12) {
    return `trong ${totalMonths} tháng nữa`;
  }

  const totalYears = Math.floor(totalDays / 365);
  return `trong ${totalYears} năm nữa`;
};

const WaitingRoomScreen: React.FC = () => {
  const navigation = useNavigation<WaitingRoomNavigationProp>();
  const route = useRoute<WaitingRoomRouteProp>();
  const {
    therapistId,
    slotId,
    slotStartDatetime,
    method,
    reason = FALLBACK_REASON,
    isBooked: routeIsBooked = false,
  } = route.params;

  const [now, setNow] = useState<Date>(new Date());
  const [therapist, setTherapist] = useState<TherapistDetail | null>(null);
  const [therapistError, setTherapistError] = useState<string>('');
  const [isLoadingTherapist, setIsLoadingTherapist] = useState<boolean>(true);
  const [isBooking, setIsBooking] = useState<boolean>(false);
  const [isBooked, setIsBooked] = useState<boolean>(routeIsBooked);
  const [bookingError, setBookingError] = useState<string>('');

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadTherapist = async () => {
      setIsLoadingTherapist(true);
      setTherapistError('');

      try {
        const response = await getTherapistDetails(therapistId);
        if (isMounted) {
          setTherapist(response);
        }
      } catch {
        if (isMounted) {
          setTherapistError('Không thể tải thông tin chuyên gia.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingTherapist(false);
        }
      }
    };

    loadTherapist();

    return () => {
      isMounted = false;
    };
  }, [therapistId]);

  const appointmentStart = useMemo(() => parseAppointmentStart(slotStartDatetime), [slotStartDatetime]);

  const displayTime = useMemo(() => {
    if (!appointmentStart) {
      return '--:--';
    }

    return appointmentStart.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }, [appointmentStart]);

  const displayDate = useMemo(() => {
    if (!appointmentStart) {
      return '--/--/----';
    }

    return appointmentStart.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }, [appointmentStart]);

  const remainingMs = useMemo(() => {
    if (!appointmentStart) {
      return null;
    }

    return appointmentStart.getTime() - now.getTime();
  }, [appointmentStart, now]);

  const remainingText = useMemo(() => {
    if (remainingMs === null) {
      return 'không xác định';
    }

    return formatRelativeRemaining(remainingMs);
  }, [remainingMs]);

  const canJoin = isBooked && remainingMs !== null && remainingMs <= TEN_MINUTES_IN_MS;
  const shouldDisableJoinButton = isBooked && !canJoin;
  const isPrimaryDisabled = isBooking || shouldDisableJoinButton;

  const handlePrimaryAction = async () => {
    if (isBooked) {
      if (!canJoin) {
        return;
      }

      navigation.navigate('VideoConsultation');
      return;
    }

    setIsBooking(true);
    setBookingError('');

    try {
      await bookSession({ slotId });
      setIsBooked(true);
    } catch (error) {
      const axiosError = error as AxiosError<{ detail?: string; message?: string }>;
      const backendMessage = axiosError.response?.data?.detail ?? axiosError.response?.data?.message;
      setBookingError(backendMessage ?? 'Đặt lịch thất bại. Vui lòng thử lại.');
    } finally {
      setIsBooking(false);
    }
  };

  const therapistLocation = therapist?.location?.trim() || 'Đang cập nhật cơ sở';
  const therapistSpecialty = therapist?.specialty?.trim() || 'Đang cập nhật chuyên môn';
  const therapistName = therapist?.fullName?.trim() || 'Đang cập nhật';
  const therapistAvatarSource = therapist?.avatarUrl
    ? { uri: therapist.avatarUrl }
    : FALLBACK_AVATAR;

  const primaryButtonText = isBooked ? 'Tham gia' : 'Xác nhận đặt lịch với chuyên gia';
  const statusMessage =
    remainingText === 'không xác định'
      ? 'Không thể xác định thời gian bắt đầu buổi tham vấn'
      : remainingText === 'đã bắt đầu'
        ? 'Buổi tham vấn đã bắt đầu'
        : `Buổi tham vấn sẽ bắt đầu ${remainingText}`;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Ionicons name="chevron-back" size={22} color={COLORS.text} />
      </TouchableOpacity>

      <View style={styles.card}>
        <AppText style={styles.cardTitle}>Tham vấn chuyên gia</AppText>
        <AppText style={styles.cardSubtitle}>{method}</AppText>

        <View style={styles.timeDateRow}>
          <AppText style={styles.timeText}>{displayTime}</AppText>
          <AppText style={styles.dateText}>{displayDate}</AppText>
        </View>

        <View style={styles.statusBadge}>
          <Ionicons name="time-outline" size={14} color={COLORS.consultationFeedbackPrimary} />
          <AppText style={styles.statusText}>{statusMessage}</AppText>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          style={[
            styles.joinButton,
            isPrimaryDisabled ? styles.joinButtonDisabled : styles.joinButtonActive,
          ]}
          onPress={handlePrimaryAction}
          disabled={isPrimaryDisabled}
        >
          <AppText style={styles.joinButtonText}>{isBooking ? 'Đang xử lý...' : primaryButtonText}</AppText>
        </TouchableOpacity>

        {isBooked && shouldDisableJoinButton ? (
          <AppText style={styles.helperText}>Bạn chỉ có thể tham gia trong vòng 10 phút trước giờ hẹn.</AppText>
        ) : null}

        {bookingError ? <AppText style={styles.errorText}>{bookingError}</AppText> : null}
      </View>

      <View style={styles.card}>
        <AppText style={styles.infoTitle}>Lí do</AppText>
        <AppText style={styles.reasonText}>{reason}</AppText>
      </View>

      <View style={styles.card}>
        <AppText style={styles.infoTitle}>Chuyên gia tâm lý</AppText>
        <View style={styles.therapistCard}>
          <Image source={therapistAvatarSource} style={styles.therapistImage} resizeMode="cover" />
          <View style={styles.therapistInfo}>
            <AppText style={styles.therapistName}>{therapistName}</AppText>
            <AppText style={styles.therapistSpecialty}>{therapistSpecialty}</AppText>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={16} color={COLORS.textSecondary} />
              <AppText style={styles.locationText}>{therapistLocation}</AppText>
            </View>
          </View>
        </View>

        {isLoadingTherapist ? <AppText style={styles.helperText}>Đang tải thông tin chuyên gia...</AppText> : null}
        {therapistError ? <AppText style={styles.errorText}>{therapistError}</AppText> : null}
      </View>
    </ScrollView>
  );
};

export default WaitingRoomScreen;
