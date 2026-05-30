import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppText, AppointmentStatusBadge } from '@/components';
import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import {
  AppointmentDetail,
  AppointmentStatus,
  bookSession,
  cancelAppointment,
  getAppointmentDetail,
  getTherapistAvailableSlots,
  getTherapistDetails,
  TherapistAvailableSlot,
  TherapistDetail,
} from '@/api';
import { RootStackParamList } from '@/navigation';
import { COLORS, FONTS } from '@/theme';
import styles from '@/screens/booking/WaitingRoomScreen.styles';

const CANCEL_REASON_MAX_LENGTH = 1000;
const APPOINTMENT_REFRESH_INTERVAL_MS = 30000;
const STATUSES_THAT_CAN_CANCEL: AppointmentStatus[] = [
  'REQUESTED',
  'UPCOMING',
  'IN_PROGRESS',
];
const STATUSES_THAT_CAN_JOIN: AppointmentStatus[] = ['UPCOMING', 'IN_PROGRESS'];

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
  const { t } = useTranslation();
  const navigation = useNavigation<WaitingRoomNavigationProp>();
  const route = useRoute<WaitingRoomRouteProp>();
  const {
    appointmentId: routeAppointmentId,
    therapistId,
    slotId: routeSlotId,
    slotStartDatetime: routeSlotStartDatetime,
    method,
    reason: routeReason = FALLBACK_REASON,
    isBooked: routeIsBooked = false,
  } = route.params;

  const [now, setNow] = useState<Date>(new Date());
  const [therapist, setTherapist] = useState<TherapistDetail | null>(null);
  const [therapistError, setTherapistError] = useState<string>('');
  const [isLoadingTherapist, setIsLoadingTherapist] = useState<boolean>(true);
  const [isBooking, setIsBooking] = useState<boolean>(false);
  const [isBooked, setIsBooked] = useState<boolean>(routeIsBooked);
  const [appointmentId, setAppointmentId] = useState<string | undefined>(routeAppointmentId);
  const [appointmentDetail, setAppointmentDetail] = useState<AppointmentDetail | null>(null);
  const [bookingError, setBookingError] = useState<string>('');
  const [currentSlotId, setCurrentSlotId] = useState<string>(routeSlotId);
  const [currentSlotStartDatetime, setCurrentSlotStartDatetime] = useState<string>(routeSlotStartDatetime);
  const [availableSlots, setAvailableSlots] = useState<TherapistAvailableSlot[]>([]);
  const [isLoadingAvailableSlots, setIsLoadingAvailableSlots] = useState<boolean>(false);
  const [availableSlotsError, setAvailableSlotsError] = useState<string>('');
  const [showAvailableSlots, setShowAvailableSlots] = useState<boolean>(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState<boolean>(false);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [isCancelling, setIsCancelling] = useState<boolean>(false);
  const [cancelError, setCancelError] = useState<string>('');
  const leaveAlertVisibleRef = useRef<boolean>(false);

  const status: AppointmentStatus | null = appointmentDetail?.status
    ?? (isBooked ? 'REQUESTED' : null);
  const reason = appointmentDetail?.reason || routeReason;

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

  const refreshAppointmentDetail = useCallback(async (): Promise<void> => {
    if (!appointmentId) {
      return;
    }
    try {
      const detail = await getAppointmentDetail(appointmentId);
      if (detail) {
        setAppointmentDetail(detail);
        if (detail.startDatetime) {
          setCurrentSlotStartDatetime(detail.startDatetime);
        }
        if (detail.slotId) {
          setCurrentSlotId(detail.slotId);
        }
      }
    } catch (error) {
      console.warn('[WaitingRoom] Failed to refresh appointment detail:', error);
    }
  }, [appointmentId]);

  useEffect(() => {
    void refreshAppointmentDetail();
  }, [refreshAppointmentDetail]);

  useFocusEffect(
    useCallback(() => {
      void refreshAppointmentDetail();
    }, [refreshAppointmentDetail]),
  );

  useEffect(() => {
    if (!appointmentId) {
      return;
    }
    if (status === 'COMPLETED' || status === 'CANCELLED') {
      return;
    }
    const timer = setInterval(() => {
      void refreshAppointmentDetail();
    }, APPOINTMENT_REFRESH_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [appointmentId, refreshAppointmentDetail, status]);

  const appointmentStart = useMemo(
    () => parseAppointmentStart(currentSlotStartDatetime),
    [currentSlotStartDatetime],
  );

  const appointmentEnd = useMemo(
    () =>
      appointmentDetail?.endDatetime
        ? parseAppointmentStart(appointmentDetail.endDatetime)
        : null,
    [appointmentDetail?.endDatetime],
  );

  const displayEndTime = useMemo(() => {
    if (!appointmentEnd) {
      return '';
    }
    return appointmentEnd.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }, [appointmentEnd]);

  const cancelledAtLabel = useMemo(() => {
    if (!appointmentDetail?.cancelledAt) {
      return '';
    }
    const parsed = new Date(appointmentDetail.cancelledAt);
    if (Number.isNaN(parsed.getTime())) {
      return '';
    }
    return parsed.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }, [appointmentDetail?.cancelledAt]);

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

  const isAwaitingApproval = status === 'REQUESTED';
  const isCancelledStatus = status === 'CANCELLED';
  const isCompletedStatus = status === 'COMPLETED';
  const statusAllowsJoin = status ? STATUSES_THAT_CAN_JOIN.includes(status) : false;
  const statusAllowsCancel = status ? STATUSES_THAT_CAN_CANCEL.includes(status) : false;
  const canJoin =
    isBooked
    && statusAllowsJoin
    && remainingMs !== null
    && remainingMs <= TEN_MINUTES_IN_MS;
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
      const trimmedReason = routeReason && routeReason !== FALLBACK_REASON
        ? routeReason.trim()
        : '';
      const bookingResponse = await bookSession({
        slotId: currentSlotId,
        reason: trimmedReason.length > 0 ? trimmedReason : undefined,
        mode: method === 'Chat' ? 'TEXT' : 'VIDEO',
      });
      setAppointmentId(bookingResponse.appointmentId);
      setIsBooked(true);
      setShowAvailableSlots(false);
      setAvailableSlots([]);
      void refreshAppointmentDetail();
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
  }, [
    isBooking,
    isBooked,
    currentSlotId,
    loadAvailableSlots,
    method,
    refreshAppointmentDetail,
    routeReason,
  ]);

  const openCancelDialog = useCallback(() => {
    setCancelReason('');
    setCancelError('');
    setIsCancelDialogOpen(true);
  }, []);

  const closeCancelDialog = useCallback(() => {
    if (isCancelling) {
      return;
    }
    setIsCancelDialogOpen(false);
  }, [isCancelling]);

  const submitCancellation = useCallback(async () => {
    if (!appointmentId) {
      return;
    }
    const trimmed = cancelReason.trim();
    if (trimmed.length === 0) {
      setCancelError(t('booking.appointmentDetail.cancelErrorRequired'));
      return;
    }
    if (trimmed.length > CANCEL_REASON_MAX_LENGTH) {
      setCancelError(t('booking.appointmentDetail.cancelErrorTooLong'));
      return;
    }

    setIsCancelling(true);
    setCancelError('');

    try {
      const updated = await cancelAppointment(appointmentId, { reason: trimmed });
      setAppointmentDetail(updated);
      setIsCancelDialogOpen(false);
    } catch (error) {
      const axiosError = error as AxiosError<{ detail?: string; message?: string }>;
      const backendMessage =
        axiosError.response?.data?.detail ?? axiosError.response?.data?.message;
      if (axiosError.response?.status === 409) {
        setCancelError(
          backendMessage ?? t('booking.appointmentDetail.cancelErrorConflict'),
        );
        void refreshAppointmentDetail();
      } else if (axiosError.response?.status === 400) {
        setCancelError(
          backendMessage ?? t('booking.appointmentDetail.cancelErrorRequired'),
        );
      } else {
        setCancelError(
          backendMessage ?? t('booking.appointmentDetail.cancelErrorGeneric'),
        );
      }
    } finally {
      setIsCancelling(false);
    }
  }, [appointmentId, cancelReason, refreshAppointmentDetail, t]);

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
  const statusMessage = isAwaitingApproval
    ? t('booking.appointmentDetail.awaitingBannerBody')
    : isCancelledStatus
      ? t('booking.appointmentDetail.cancelledBannerTitle')
      : remainingText === 'không xác định'
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

          {status ? (
            <View style={waitingExtraStyles.badgeRow}>
              <AppointmentStatusBadge status={status} />
            </View>
          ) : null}

          <View style={styles.timeDateRow}>
            <AppText style={styles.timeText}>{displayTime}</AppText>
            <AppText style={styles.dateText}>{displayDate}</AppText>
          </View>
          {displayEndTime ? (
            <AppText style={styles.helperText}>
              {t('booking.appointmentDetail.endTimeLabel')}: {displayEndTime}
            </AppText>
          ) : null}

          {isAwaitingApproval ? (
            <View style={waitingExtraStyles.awaitingBanner}>
              <Ionicons name="hourglass-outline" size={16} color="#856404" />
              <View style={waitingExtraStyles.bannerTextBlock}>
                <AppText style={waitingExtraStyles.awaitingBannerTitle}>
                  {t('booking.appointmentDetail.awaitingBannerTitle')}
                </AppText>
                <AppText style={waitingExtraStyles.awaitingBannerBody}>
                  {t('booking.appointmentDetail.awaitingBannerBody')}
                </AppText>
              </View>
            </View>
          ) : isCancelledStatus ? (
            <View style={waitingExtraStyles.cancelledBanner}>
              <Ionicons name="close-circle-outline" size={16} color="#721C24" />
              <View style={waitingExtraStyles.bannerTextBlock}>
                <AppText style={waitingExtraStyles.cancelledBannerTitle}>
                  {t('booking.appointmentDetail.cancelledBannerTitle')}
                </AppText>
                {appointmentDetail?.cancellationReason ? (
                  <AppText style={waitingExtraStyles.cancelledBannerBody}>
                    {t('booking.appointmentDetail.cancelledReasonLabel')}: {appointmentDetail.cancellationReason}
                  </AppText>
                ) : null}
                {cancelledAtLabel ? (
                  <AppText style={waitingExtraStyles.cancelledBannerBody}>
                    {t('booking.appointmentDetail.cancelledAtLabel')}: {cancelledAtLabel}
                  </AppText>
                ) : null}
              </View>
            </View>
          ) : (
            <View style={styles.statusBadge}>
              <Ionicons name="time-outline" size={14} color={COLORS.consultationFeedbackPrimary} />
              <AppText style={styles.statusText}>{statusMessage}</AppText>
            </View>
          )}

          {!isCancelledStatus && !isCompletedStatus ? (
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
          ) : null}

          {!isBooked ? (
            <AppText style={styles.reminderText}>
              * Bạn cần nhấn nút trên để xác nhận đặt lịch với chuyên gia.
            </AppText>
          ) : null}

          {isBooked && statusAllowsJoin && shouldDisableJoinButton ? (
            <AppText style={styles.helperText}>Bạn chỉ có thể tham gia trong vòng 10 phút trước giờ hẹn.</AppText>
          ) : null}

          {bookingError ? <AppText style={styles.errorText}>{bookingError}</AppText> : null}

          {isBooked && statusAllowsCancel ? (
            <TouchableOpacity
              activeOpacity={0.85}
              style={waitingExtraStyles.cancelButton}
              onPress={openCancelDialog}
            >
              <Ionicons name="close-circle-outline" size={16} color={COLORS.errorText} />
              <AppText style={waitingExtraStyles.cancelButtonText}>
                {t('booking.appointmentDetail.cancelButton')}
              </AppText>
            </TouchableOpacity>
          ) : null}
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

      <Modal
        visible={isCancelDialogOpen}
        transparent
        animationType="fade"
        onRequestClose={closeCancelDialog}
        statusBarTranslucent
      >
        <View style={waitingExtraStyles.modalBackdrop}>
          <View style={waitingExtraStyles.modalCard}>
            <AppText style={waitingExtraStyles.modalTitle}>
              {t('booking.appointmentDetail.cancelDialogTitle')}
            </AppText>
            <AppText style={waitingExtraStyles.modalBody}>
              {t('booking.appointmentDetail.cancelDialogBody')}
            </AppText>
            <TextInput
              style={[waitingExtraStyles.modalInput, { fontFamily: FONTS.regular }]}
              placeholder={t('booking.appointmentDetail.cancelDialogPlaceholder')}
              placeholderTextColor={COLORS.placeholder}
              multiline
              value={cancelReason}
              onChangeText={text => {
                setCancelReason(text);
                if (cancelError) {
                  setCancelError('');
                }
              }}
              maxLength={CANCEL_REASON_MAX_LENGTH}
              editable={!isCancelling}
            />
            <AppText style={waitingExtraStyles.modalCounter}>
              {cancelReason.length}/{CANCEL_REASON_MAX_LENGTH}
            </AppText>
            {cancelError ? (
              <AppText style={waitingExtraStyles.modalErrorText}>{cancelError}</AppText>
            ) : null}
            <View style={waitingExtraStyles.modalActions}>
              <TouchableOpacity
                style={[waitingExtraStyles.modalButton, waitingExtraStyles.modalButtonGhost]}
                onPress={closeCancelDialog}
                disabled={isCancelling}
                activeOpacity={0.85}
              >
                <AppText style={waitingExtraStyles.modalButtonGhostText}>
                  {t('booking.appointmentDetail.cancelDialogDismiss')}
                </AppText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  waitingExtraStyles.modalButton,
                  waitingExtraStyles.modalButtonDanger,
                  isCancelling ? waitingExtraStyles.modalButtonDisabled : null,
                ]}
                onPress={submitCancellation}
                disabled={isCancelling}
                activeOpacity={0.85}
              >
                {isCancelling ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <AppText style={waitingExtraStyles.modalButtonDangerText}>
                    {t('booking.appointmentDetail.cancelDialogSubmit')}
                  </AppText>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const waitingExtraStyles = StyleSheet.create({
  badgeRow: {
    marginTop: 12,
    flexDirection: 'row',
  },
  awaitingBanner: {
    marginTop: 14,
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  cancelledBanner: {
    marginTop: 14,
    backgroundColor: '#FDECEA',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#E53935',
  },
  bannerTextBlock: {
    flex: 1,
  },
  awaitingBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#856404',
  },
  awaitingBannerBody: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    color: '#856404',
  },
  cancelledBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#721C24',
  },
  cancelledBannerBody: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    color: '#721C24',
  },
  cancelButton: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.errorBorder,
    borderRadius: 12,
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: COLORS.errorText,
    fontSize: 14,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: COLORS.overlayDark45,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  modalBody: {
    marginTop: 6,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  modalInput: {
    marginTop: 14,
    minHeight: 90,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
    color: COLORS.text,
    backgroundColor: COLORS.inputBackground,
  },
  modalCounter: {
    marginTop: 4,
    alignSelf: 'flex-end',
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  modalErrorText: {
    marginTop: 6,
    color: COLORS.errorText,
    fontSize: 13,
  },
  modalActions: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonGhost: {
    backgroundColor: COLORS.inputBackground,
  },
  modalButtonGhostText: {
    color: COLORS.text,
    fontWeight: '700',
    fontSize: 14,
  },
  modalButtonDanger: {
    backgroundColor: COLORS.errorText,
  },
  modalButtonDangerText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 14,
  },
  modalButtonDisabled: {
    opacity: 0.6,
  },
});

export default WaitingRoomScreen;
