import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, BackHandler, Image, ScrollView, TouchableOpacity, View } from 'react-native';
import { AppText } from '@/components';
import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AxiosError } from 'axios';
import {
  bookSession,
  getTherapistAvailableSlots,
  getTherapistDetails,
  TherapistAvailableSlot,
  TherapistDetail,
} from '@/api';
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

const formatTimeLabel = (isoDatetime: string): string =>
  new Date(isoDatetime).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

const formatGroupDateLabel = (dateString: string): string => {
  const parsed = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return dateString;
  }
  return parsed.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

type GroupedSlots = Array<{
  date: string;
  items: Array<{ slotId: string; startDatetime: string; label: string }>;
}>;

const groupSlotsByDate = (slots: TherapistAvailableSlot[]): GroupedSlots => {
  const grouped: Record<string, { slotId: string; startDatetime: string; label: string }[]> = {};

  for (const slot of slots) {
    const dateKey = slot.startDatetime.slice(0, 10);
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push({
      slotId: slot.slotId,
      startDatetime: slot.startDatetime,
      label: `${formatTimeLabel(slot.startDatetime)} - ${formatTimeLabel(slot.endDatetime)}`,
    });
  }

  for (const dateKey of Object.keys(grouped)) {
    grouped[dateKey].sort((a, b) => a.startDatetime.localeCompare(b.startDatetime));
  }

  return Object.keys(grouped)
    .sort()
    .map(date => ({ date, items: grouped[date] }));
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
    appointmentId: routeAppointmentId,
    therapistId,
    slotId: routeSlotId,
    slotStartDatetime: routeSlotStartDatetime,
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
  const [appointmentId, setAppointmentId] = useState<string | undefined>(routeAppointmentId);
  const [bookingError, setBookingError] = useState<string>('');
  const [currentSlotId, setCurrentSlotId] = useState<string>(routeSlotId);
  const [currentSlotStartDatetime, setCurrentSlotStartDatetime] = useState<string>(routeSlotStartDatetime);
  const [availableSlots, setAvailableSlots] = useState<TherapistAvailableSlot[]>([]);
  const [isLoadingAvailableSlots, setIsLoadingAvailableSlots] = useState<boolean>(false);
  const [availableSlotsError, setAvailableSlotsError] = useState<string>('');
  const [showAvailableSlots, setShowAvailableSlots] = useState<boolean>(false);
  const leaveAlertVisibleRef = useRef<boolean>(false);

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

  const appointmentStart = useMemo(
    () => parseAppointmentStart(currentSlotStartDatetime),
    [currentSlotStartDatetime],
  );

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

  const therapistLocation = therapist?.location?.trim() || 'Đang cập nhật cơ sở';
  const therapistSpecialty = therapist?.specialty?.trim() || 'Đang cập nhật chuyên môn';
  const therapistName = therapist?.fullName?.trim() || 'Đang cập nhật';
  const therapistAvatarSource = therapist?.avatarUrl
    ? { uri: therapist.avatarUrl }
    : FALLBACK_AVATAR;

  const groupedAvailableSlots = useMemo(
    () => groupSlotsByDate(availableSlots),
    [availableSlots],
  );

  const loadAvailableSlots = useCallback(async () => {
    setIsLoadingAvailableSlots(true);
    setAvailableSlotsError('');
    try {
      const slots = await getTherapistAvailableSlots(therapistId);
      setAvailableSlots(slots);
    } catch {
      setAvailableSlotsError('Không thể tải danh sách khung giờ trống. Vui lòng thử lại.');
    } finally {
      setIsLoadingAvailableSlots(false);
    }
  }, [therapistId]);

  const confirmBooking = useCallback(async () => {
    if (isBooking || isBooked) {
      return;
    }

    setIsBooking(true);
    setBookingError('');

    try {
      const bookingResponse = await bookSession({ slotId: currentSlotId });
      setAppointmentId(bookingResponse.appointmentId);
      setIsBooked(true);
      setShowAvailableSlots(false);
      setAvailableSlots([]);
    } catch (error) {
      const axiosError = error as AxiosError<{ detail?: string; message?: string }>;
      const backendMessage = axiosError.response?.data?.detail ?? axiosError.response?.data?.message;
      setBookingError(backendMessage ?? 'Đặt lịch thất bại. Vui lòng thử lại.');
      if (axiosError.response?.status === 409) {
        setShowAvailableSlots(true);
        loadAvailableSlots();
      }
    } finally {
      setIsBooking(false);
    }
  }, [isBooking, isBooked, currentSlotId, loadAvailableSlots]);

  const handleSelectAlternativeSlot = useCallback((slot: TherapistAvailableSlot) => {
    setCurrentSlotId(slot.slotId);
    setCurrentSlotStartDatetime(slot.startDatetime);
    setBookingError('');
  }, []);

  const handleJoinConsultation = useCallback(() => {
    navigation.navigate('VideoConsultation', {
      appointmentId,
      therapistId,
      slotId: currentSlotId,
      slotStartDatetime: currentSlotStartDatetime,
      method,
      reason,
      therapistName,
      therapistSpecialty,
      therapistAvatarUrl: therapist?.avatarUrl ?? null,
    });
  }, [
    navigation,
    appointmentId,
    therapistId,
    currentSlotId,
    currentSlotStartDatetime,
    method,
    reason,
    therapistName,
    therapistSpecialty,
    therapist?.avatarUrl,
  ]);

  const handlePrimaryAction = () => {
    if (isBooked) {
      if (!canJoin) {
        return;
      }
      handleJoinConsultation();
      return;
    }
    confirmBooking();
  };

  const navigateToTherapistTab = useCallback(() => {
    navigation.navigate('MainTabs', { screen: 'TherapistTab' });
  }, [navigation]);

  const promptLeaveConfirmation = useCallback(
    (onLeave: () => void) => {
      if (leaveAlertVisibleRef.current) {
        return;
      }
      leaveAlertVisibleRef.current = true;

      Alert.alert(
        'Buổi tham vấn chưa được xác nhận',
        'Bạn vẫn chưa xác nhận đặt lịch với chuyên gia. Bạn muốn xác nhận đặt lịch ngay bây giờ hay quay lại để chỉnh sửa thông tin?',
        [
          {
            text: 'Quay lại chỉnh sửa',
            style: 'destructive',
            onPress: () => {
              leaveAlertVisibleRef.current = false;
              onLeave();
            },
          },
          {
            text: 'Xác nhận đặt lịch',
            style: 'default',
            onPress: () => {
              leaveAlertVisibleRef.current = false;
              confirmBooking();
            },
          },
        ],
        {
          cancelable: true,
          onDismiss: () => {
            leaveAlertVisibleRef.current = false;
          },
        },
      );
    },
    [confirmBooking],
  );

  const handleHeaderBack = useCallback(() => {
    if (!isBooked) {
      promptLeaveConfirmation(() => navigation.goBack());
      return;
    }
    navigateToTherapistTab();
  }, [isBooked, navigateToTherapistTab, navigation, promptLeaveConfirmation]);

  useFocusEffect(
    useCallback(() => {
      const onHardwareBack = () => {
        if (!isBooked) {
          promptLeaveConfirmation(() => navigation.goBack());
          return true;
        }
        navigateToTherapistTab();
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onHardwareBack);
      return () => subscription.remove();
    }, [isBooked, navigateToTherapistTab, navigation, promptLeaveConfirmation]),
  );

  const primaryButtonText = isBooked ? 'Tham gia' : 'Xác nhận đặt lịch với chuyên gia';
  const statusMessage =
    remainingText === 'không xác định'
      ? 'Không thể xác định thời gian bắt đầu buổi tham vấn'
      : remainingText === 'đã bắt đầu'
        ? 'Buổi tham vấn đã bắt đầu'
        : `Buổi tham vấn sẽ bắt đầu ${remainingText}`;

  const floatingButtonLabel = isBooked
    ? 'Quay về trang chủ'
    : 'Xác nhận đặt lịch với chuyên gia';
  const floatingButtonDisabled = !isBooked && isBooking;
  const handleFloatingPress = isBooked ? navigateToTherapistTab : confirmBooking;

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleHeaderBack}
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

          {!isBooked ? (
            <AppText style={styles.reminderText}>
              * Bạn cần nhấn nút trên để xác nhận đặt lịch với chuyên gia.
            </AppText>
          ) : null}

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

        {showAvailableSlots ? (
          <View style={styles.card}>
            <AppText style={styles.infoTitle}>Khung giờ trống khác</AppText>
            <AppText style={styles.helperText}>
              Khung giờ bạn chọn đã được đặt. Hãy chọn một khung giờ khác bên dưới rồi nhấn xác nhận lại.
            </AppText>

            {isLoadingAvailableSlots ? (
              <View style={styles.availableSlotsLoadingRow}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <AppText style={[styles.helperText, styles.availableSlotsLoadingText]}>
                  Đang tải khung giờ trống...
                </AppText>
              </View>
            ) : null}

            {!isLoadingAvailableSlots && availableSlotsError ? (
              <AppText style={styles.errorText}>{availableSlotsError}</AppText>
            ) : null}

            {!isLoadingAvailableSlots && !availableSlotsError && groupedAvailableSlots.length === 0 ? (
              <AppText style={styles.helperText}>Hiện không còn khung giờ trống.</AppText>
            ) : null}

            {!isLoadingAvailableSlots && !availableSlotsError
              ? groupedAvailableSlots.map(group => (
                  <View key={group.date} style={styles.availableSlotsDateGroup}>
                    <AppText style={styles.availableSlotsDateLabel}>
                      {formatGroupDateLabel(group.date)}
                    </AppText>
                    <View style={styles.availableSlotsGrid}>
                      {group.items.map(item => {
                        const isSelected = currentSlotId === item.slotId;
                        return (
                          <TouchableOpacity
                            key={item.slotId}
                            activeOpacity={0.8}
                            style={[
                              styles.availableSlotButton,
                              isSelected
                                ? styles.availableSlotButtonSelected
                                : styles.availableSlotButtonUnselected,
                            ]}
                            onPress={() =>
                              handleSelectAlternativeSlot({
                                slotId: item.slotId,
                                startDatetime: item.startDatetime,
                                endDatetime: '',
                              })
                            }
                          >
                            <AppText
                              style={[
                                styles.availableSlotButtonText,
                                isSelected
                                  ? styles.availableSlotButtonTextSelected
                                  : styles.availableSlotButtonTextUnselected,
                              ]}
                            >
                              {item.label}
                            </AppText>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                ))
              : null}
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.floatingContainer}>
        <TouchableOpacity
          activeOpacity={0.9}
          style={[
            styles.floatingButton,
            isBooked ? styles.floatingButtonSecondary : styles.floatingButtonPrimary,
          ]}
          onPress={handleFloatingPress}
          disabled={floatingButtonDisabled}
        >
          {isBooked ? (
            <Ionicons name="people-outline" size={18} color={COLORS.white} />
          ) : null}
          <AppText
            style={isBooked ? styles.floatingButtonTextSecondary : styles.floatingButtonText}
          >
            {!isBooked && isBooking ? 'Đang xử lý...' : floatingButtonLabel}
          </AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default WaitingRoomScreen;
