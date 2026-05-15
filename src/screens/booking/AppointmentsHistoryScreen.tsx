// src/screens/booking/AppointmentsHistoryScreen.tsx
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
// import { RouteProp, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { therapistApi } from '@/api';
import { AuthContext } from '@/context/AuthContext';
import { RootStackParamList } from '@/navigation';
import { COLORS } from '@/theme';
import styles from '@/screens/booking/AppointmentsHistoryScreen.styles';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AppointmentsHistory'>;
// type AppointmentsHistoryRouteProp = RouteProp<RootStackParamList, 'AppointmentsHistory'>;

type AppointmentStatus = therapistApi.AppointmentHistoryStatus;

const formatAppointmentTime = (startDatetime: string): string => {
  const date = new Date(startDatetime);
  if (Number.isNaN(date.getTime())) {
    return '--:--';
  }

  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const formatAppointmentDate = (startDatetime: string): string => {
  const date = new Date(startDatetime);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `Ngày ${day} Tháng ${month}, ${year}`;
};

const AppointmentsHistoryScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  // const route = useRoute<AppointmentsHistoryRouteProp>();
  // const currentTherapistId = route.params?.currentTherapistId;
  const auth = useContext(AuthContext);
  const profileId = auth?.userInfo?.profileId;

  const [activeStatus, setActiveStatus] = useState<AppointmentStatus>('COMPLETED');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [appointments, setAppointments] = useState<therapistApi.AppointmentHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  const fetchHistory = useCallback(async (): Promise<void> => {
    if (!profileId) {
      setAppointments([]);
      setIsLoading(false);
      setHasError(false);
      return;
    }

    setIsLoading(true);
    setHasError(false);

    try {
      const result = await therapistApi.getAppointmentHistory(profileId);
      setAppointments(result);
    } catch (error) {
      console.error('[AppointmentsHistory] Failed to load appointment history:', error);
      setAppointments([]);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter(appointment => appointment.status === activeStatus);
  }, [appointments, activeStatus]);

  const toggleExpanded = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const renderAppointmentCard = ({ item }: { item: therapistApi.AppointmentHistoryEntry }) => {
    const isExpanded = expandedIds.has(item.appointmentId);
    // const isCurrentTherapist =
    //   !!currentTherapistId && item.therapistId === currentTherapistId;
    const isCancelled = item.status === 'CANCELLED';

    return (
      <View style={styles.card}>
        <View style={styles.therapistRow}>
          <Image
            source={require('../../assets/booking/doctor.png')}
            style={styles.avatar}
            resizeMode="cover"
          />

          <View style={styles.therapistInfo}>
            <Text style={styles.therapistName}>{item.therapistName}</Text>
            <Text style={styles.therapistSpecialty}>{item.therapistSpecialization}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={13} color={COLORS.placeholder} />
              <Text style={styles.locationText}>{item.location}</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.timeDateRow}>
          <Text style={styles.timeText}>{formatAppointmentTime(item.startDatetime)}</Text>
          <Text style={styles.dateText}>{formatAppointmentDate(item.startDatetime)}</Text>
        </View>

        {isCancelled ? null : isExpanded ? (
          <View style={styles.expandedActions}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.actionButton}
              onPress={() => {
                navigation.navigate('ConsultationFeedback', {
                  appointmentId: item.appointmentId,
                  therapistId: item.therapistId,
                  slotId: item.slotId,
                  slotStartDatetime: item.startDatetime,
                  method: item.mode === 'CHAT' ? 'Chat' : 'Video',
                  therapistName: item.therapistName,
                  therapistSpecialty: item.therapistSpecialization,
                  therapistAvatarUrl: null,
                  isReadOnly: true,
                });
              }}>
              <Text style={styles.actionButtonText}>Chi tiết</Text>
            </TouchableOpacity>

            {/*
            {isCurrentTherapist ? null : (
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.actionButton}
                onPress={() => {
                  console.log('[AppointmentsHistory] Reassign old therapist for:', item.appointmentId);
                }}>
                <Text style={styles.actionButtonText}>Thay đổi về chuyên gia cũ</Text>
              </TouchableOpacity>
            )}
            */}

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.seeMoreButton}
              onPress={() => toggleExpanded(item.appointmentId)}>
              <Ionicons name="chevron-up" size={16} color={COLORS.textSecondary} />
              <Text style={styles.seeMoreText}>Thu gọn</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.seeMoreButton}
            onPress={() => toggleExpanded(item.appointmentId)}>
            <Ionicons name="chevron-down" size={16} color={COLORS.textSecondary} />
            <Text style={styles.seeMoreText}>Xem thêm</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderListEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.emptyStateText}>Đang tải lịch sử...</Text>
        </View>
      );
    }

    if (hasError) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            Không thể tải lịch sử ngay bây giờ. Hãy thử lại sau.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateText}>Không có lịch hẹn trong trạng thái này.</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backButton}
              activeOpacity={0.8}
              onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={20} color={COLORS.textDark} />
            </TouchableOpacity>
            <View style={styles.rightSpacer} />
          </View>

          <View style={styles.titleWrapper}>
            <Text style={styles.title}>Lịch sử tham vấn tâm lý</Text>
          </View>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeStatus === 'COMPLETED' ? styles.tabButtonActive : null]}
            activeOpacity={0.85}
            onPress={() => setActiveStatus('COMPLETED')}>
            <Text style={[styles.tabText, activeStatus === 'COMPLETED' ? styles.tabTextActive : null]}>
              Đã hoàn thành
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeStatus === 'CANCELLED' ? styles.tabButtonActive : null]}
            activeOpacity={0.85}
            onPress={() => setActiveStatus('CANCELLED')}>
            <Text style={[styles.tabText, activeStatus === 'CANCELLED' ? styles.tabTextActive : null]}>
              Đã hủy
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredAppointments}
          keyExtractor={item => item.appointmentId}
          renderItem={renderAppointmentCard}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderListEmpty}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={fetchHistory}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default AppointmentsHistoryScreen;
