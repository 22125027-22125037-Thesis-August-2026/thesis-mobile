// src/screens/booking/TherapistBookingLanding.tsx
import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import { CommonActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { AppText } from '@/components';
import { AuthContext } from '@/context/AuthContext';
import {
  ActiveAssignedTherapist,
  getActiveAssignedTherapist,
  getUpcomingAppointment,
  UpcomingAppointment,
} from '@/api';
import { RootStackParamList } from '@/navigation';
import { COLORS } from '@/theme';
import styles from '@/screens/booking/TherapistBookingLanding.styles';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'TherapistBookingLanding'>;

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

const formatAppointmentTime = (startDatetime: string): string => {
  const date = new Date(startDatetime);
  if (Number.isNaN(date.getTime())) {
    return '--:--';
  }

  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

const formatAppointmentDate = (startDatetime: string): string => {
  const date = new Date(startDatetime);
  if (Number.isNaN(date.getTime())) {
    return '--/--/----';
  }

  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const TherapistBookingLanding: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const auth = useContext(AuthContext);
  const profileId = auth?.userInfo?.profileId;

  const [activeTherapist, setActiveTherapist] = useState<ActiveAssignedTherapist | null>(null);
  const [upcomingAppointment, setUpcomingAppointment] = useState<UpcomingAppointment | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchLandingData = async () => {
      if (!profileId) {
        if (isMounted) {
          setActiveTherapist(null);
          setUpcomingAppointment(null);
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);

      const [therapistResult, upcomingResult] = await Promise.allSettled([
        getActiveAssignedTherapist(profileId),
        getUpcomingAppointment(profileId),
      ]);

      if (!isMounted) {
        return;
      }

      if (therapistResult.status === 'fulfilled') {
        setActiveTherapist(therapistResult.value);
      } else {
        console.error('[TherapistBookingLanding] Failed to load active therapist:', therapistResult.reason);
        setActiveTherapist(null);
      }

      if (upcomingResult.status === 'fulfilled') {
        setUpcomingAppointment(upcomingResult.value);
      } else {
        console.error('[TherapistBookingLanding] Failed to load upcoming appointment:', upcomingResult.reason);
        setUpcomingAppointment(null);
      }

      setIsLoading(false);
    };

    fetchLandingData();

    return () => {
      isMounted = false;
    };
  }, [profileId]);

  const handleNavigateHome = React.useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: 'MainTabs',
            state: {
              index: 0,
              routes: [{ name: 'HomeTab' }],
            },
          },
        ],
      }),
    );
  }, [navigation]);

  useFocusEffect(
    React.useCallback(() => {
      const onHardwareBack = () => {
        handleNavigateHome();
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onHardwareBack);
      return () => subscription.remove();
    }, [handleNavigateHome]),
  );

  const handleNavigateMatchingForm = () => {
    navigation.navigate('MatchingForm');
  };

  const handleNavigateAppointmentsHistory = () => {
    navigation.navigate('AppointmentsHistory');
  };

  const handleChatAction = () => {
    if (upcomingAppointment) {
      navigation.navigate('WaitingRoom', {
        appointmentId: upcomingAppointment.appointmentId,
        therapistId: upcomingAppointment.therapistId,
        slotId: upcomingAppointment.slotId,
        slotStartDatetime: upcomingAppointment.startDatetime,
        method: upcomingAppointment.mode === 'CHAT' ? 'Chat' : 'Video',
        isBooked: true,
      });
      return;
    }

    if (!activeTherapist) {
      navigation.navigate('MatchingForm');
      return;
    }

    navigation.navigate('TherapistDetails', { id: activeTherapist.id });
  };

  const handleOpenWaitingRoom = () => {
    if (!upcomingAppointment) {
      return;
    }

    navigation.navigate('WaitingRoom', {
      appointmentId: upcomingAppointment.appointmentId,
      therapistId: upcomingAppointment.therapistId,
      slotId: upcomingAppointment.slotId,
      slotStartDatetime: upcomingAppointment.startDatetime,
      method: upcomingAppointment.mode === 'CHAT' ? 'Chat' : 'Video',
      isBooked: true,
    });
  };

  const upcomingAppointmentMethod = upcomingAppointment?.mode === 'CHAT' ? 'Chat' : 'Video';
  const upcomingAppointmentTime = upcomingAppointment
    ? formatAppointmentTime(upcomingAppointment.startDatetime)
    : '--:--';
  const upcomingAppointmentDate = upcomingAppointment
    ? formatAppointmentDate(upcomingAppointment.startDatetime)
    : '--/--/----';
  const remainingText = upcomingAppointment
    ? formatRelativeRemaining(new Date(upcomingAppointment.startDatetime).getTime() - now.getTime())
    : 'không xác định';
  const upcomingStatusMessage =
    remainingText === 'không xác định'
      ? 'Không thể xác định thời gian bắt đầu buổi tham vấn'
      : remainingText === 'đã bắt đầu'
        ? 'Buổi tham vấn đã bắt đầu'
        : `Buổi tham vấn sẽ diễn ra ${remainingText}`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity style={styles.backButton} onPress={handleNavigateHome}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
        <AppText style={styles.brandText}>uMatter</AppText>
        <AppText style={styles.subHeader}>
          Kết nối và trò chuyện cùng chuyên gia trị liệu phù hợp với bạn
        </AppText>
        <Image
          source={require('../../assets/booking/doctor.png')}
          style={styles.headerImage}
          resizeMode="contain"
        />
      </View>

      <ImageBackground
        source={require('../../assets/booking/leaf_bg.png')}
        style={styles.leafBackground}
        resizeMode="cover"
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <AppText style={styles.loadingText}>Đang tải dữ liệu của bạn...</AppText>
            </View>
          ) : null}

          {activeTherapist ? (
            <View style={styles.therapistCard}>
              <Image
                source={
                  activeTherapist.avatarUrl
                    ? { uri: activeTherapist.avatarUrl }
                    : require('../../assets/booking/doctor.png')
                }
                style={styles.therapistAvatar}
                resizeMode="cover"
              />
              <View style={styles.therapistInfo}>
                <AppText style={styles.therapistLabel}>Chuyên gia đang đồng hành</AppText>
                <AppText style={styles.therapistName} numberOfLines={2}>
                  {activeTherapist.fullName}
                </AppText>
                <AppText style={styles.therapistSpecialization}>
                  {activeTherapist.specialization || 'Chưa cập nhật chuyên môn'}
                </AppText>
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
                  <AppText style={styles.locationText} numberOfLines={1}>
                    {activeTherapist.location || 'Chưa cập nhật địa điểm'}
                  </AppText>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <AppText style={styles.emptyCardTitle}>Bạn chưa có chuyên gia đang hoạt động</AppText>
              <AppText style={styles.emptyCardText}>
                Hoàn tất bảng ghép nối để hệ thống đề xuất chuyên gia phù hợp cho bạn.
              </AppText>
            </View>
          )}

          {upcomingAppointment ? (
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.upcomingCard}
              onPress={handleOpenWaitingRoom}
            >
              <AppText style={styles.upcomingCardTitle}>Tham vấn chuyên gia</AppText>
              <AppText style={styles.upcomingCardSubtitle}>{upcomingAppointmentMethod}</AppText>

              <View style={styles.upcomingTimeDateRow}>
                <AppText style={styles.upcomingTimeText}>{upcomingAppointmentTime}</AppText>
                <AppText style={styles.upcomingDateText}>{upcomingAppointmentDate}</AppText>
              </View>

              <View style={styles.upcomingStatusBadge}>
                <Ionicons name="time-outline" size={14} color={COLORS.consultationFeedbackPrimary} />
                <AppText style={styles.upcomingStatusText}>{upcomingStatusMessage}</AppText>
              </View>

              <View style={styles.upcomingCardActionRow}>
                <AppText style={styles.upcomingCardActionText}>Vào phòng chờ</AppText>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={COLORS.text}
                  style={styles.upcomingCardActionIcon}
                />
              </View>
            </TouchableOpacity>
          ) : null}

          <View style={styles.footerSpacer} />

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonHistory]}
              onPress={handleNavigateAppointmentsHistory}
              activeOpacity={0.85}
            >
              <AppText style={styles.actionButtonText}>Lịch sử tham vấn chuyên gia</AppText>
            </TouchableOpacity>

            {activeTherapist ? (
              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonSecondary]}
                onPress={handleNavigateMatchingForm}
                activeOpacity={0.85}
              >
                <AppText style={styles.actionButtonText}>Tôi muốn đổi chuyên gia</AppText>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonPrimary]}
              onPress={handleChatAction}
              activeOpacity={0.85}
            >
              <AppText style={styles.actionButtonText}>Trò chuyện với chuyên gia</AppText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
};

export default TherapistBookingLanding;
