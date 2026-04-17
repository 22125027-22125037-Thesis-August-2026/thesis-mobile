// src/screens/booking/AppointmentsHistoryScreen.tsx
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { RootStackParamList } from '@/navigation';
import { COLORS } from '@/theme';
import styles from '@/screens/booking/AppointmentsHistoryScreen.styles';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AppointmentsHistory'>;

type AppointmentStatus = 'COMPLETED' | 'CANCELLED';

type AppointmentHistoryItem = {
  id: string;
  therapistName: string;
  therapistSpecialization: string;
  location: string;
  avatarUrl?: string;
  timeLabel: string;
  dateLabel: string;
  status: AppointmentStatus;
};

const APPOINTMENT_PROFILES: Pick<
  AppointmentHistoryItem,
  'therapistName' | 'therapistSpecialization' | 'location'
>[] = [
  {
    therapistName: 'Dr. David Patel',
    therapistSpecialization: 'Chuyên gia tâm lý trẻ em',
    location: 'Bệnh viện tư nhân HCM',
  },
  {
    therapistName: 'Dr. Mia Nguyen',
    therapistSpecialization: 'Chuyên gia trị liệu hành vi',
    location: 'Trung tâm tâm lý Quận 3',
  },
  {
    therapistName: 'Dr. An Tran',
    therapistSpecialization: 'Chuyên gia lo âu và trầm cảm',
    location: 'Phòng khám sức khỏe tinh thần',
  },
];

const COMPLETED_TIMES: string[] = [
  '12:33 PM',
  '09:00 AM',
  '10:15 AM',
  '11:40 AM',
  '01:05 PM',
  '02:20 PM',
  '03:45 PM',
  '04:10 PM',
  '05:30 PM',
  '06:55 PM',
  '07:25 AM',
  '08:50 AM',
  '09:35 PM',
  '10:05 PM',
  '11:15 AM',
  '12:10 PM',
  '01:45 PM',
  '02:55 PM',
  '04:40 PM',
  '08:05 PM',
];

const COMPLETED_DATES: string[] = [
  'Ngày 14 Tháng 2, 2025',
  'Ngày 02 Tháng 1, 2025',
  'Ngày 27 Tháng 12, 2024',
  'Ngày 21 Tháng 12, 2024',
  'Ngày 17 Tháng 12, 2024',
  'Ngày 09 Tháng 12, 2024',
  'Ngày 03 Tháng 12, 2024',
  'Ngày 29 Tháng 11, 2024',
  'Ngày 24 Tháng 11, 2024',
  'Ngày 18 Tháng 11, 2024',
  'Ngày 11 Tháng 11, 2024',
  'Ngày 06 Tháng 11, 2024',
  'Ngày 31 Tháng 10, 2024',
  'Ngày 25 Tháng 10, 2024',
  'Ngày 19 Tháng 10, 2024',
  'Ngày 13 Tháng 10, 2024',
  'Ngày 08 Tháng 10, 2024',
  'Ngày 02 Tháng 10, 2024',
  'Ngày 27 Tháng 9, 2024',
  'Ngày 20 Tháng 9, 2024',
];

const CANCELLED_TIMES: string[] = [
  '03:15 PM',
  '07:40 AM',
  '08:20 AM',
  '09:10 AM',
  '10:50 AM',
  '12:00 PM',
  '01:35 PM',
  '02:05 PM',
  '03:55 PM',
  '04:25 PM',
  '05:10 PM',
  '06:00 PM',
  '07:15 PM',
  '08:45 PM',
  '09:30 PM',
  '10:20 PM',
  '11:05 AM',
  '12:45 PM',
  '02:35 PM',
  '05:50 PM',
];

const CANCELLED_DATES: string[] = [
  'Ngày 22 Tháng 12, 2024',
  'Ngày 15 Tháng 12, 2024',
  'Ngày 10 Tháng 12, 2024',
  'Ngày 05 Tháng 12, 2024',
  'Ngày 30 Tháng 11, 2024',
  'Ngày 26 Tháng 11, 2024',
  'Ngày 20 Tháng 11, 2024',
  'Ngày 14 Tháng 11, 2024',
  'Ngày 08 Tháng 11, 2024',
  'Ngày 01 Tháng 11, 2024',
  'Ngày 26 Tháng 10, 2024',
  'Ngày 22 Tháng 10, 2024',
  'Ngày 16 Tháng 10, 2024',
  'Ngày 10 Tháng 10, 2024',
  'Ngày 04 Tháng 10, 2024',
  'Ngày 28 Tháng 9, 2024',
  'Ngày 22 Tháng 9, 2024',
  'Ngày 16 Tháng 9, 2024',
  'Ngày 09 Tháng 9, 2024',
  'Ngày 03 Tháng 9, 2024',
];

const buildMockAppointments = (
  status: AppointmentStatus,
  times: string[],
  dates: string[],
  startId: number,
): AppointmentHistoryItem[] => {
  return times.map((timeLabel, index) => {
    const profile = APPOINTMENT_PROFILES[index % APPOINTMENT_PROFILES.length];

    return {
      id: `appointment-${startId + index}`,
      therapistName: profile.therapistName,
      therapistSpecialization: profile.therapistSpecialization,
      location: profile.location,
      timeLabel,
      dateLabel: dates[index],
      status,
    };
  });
};

const MOCK_APPOINTMENTS: AppointmentHistoryItem[] = [
  ...buildMockAppointments('COMPLETED', COMPLETED_TIMES, COMPLETED_DATES, 1),
  ...buildMockAppointments('CANCELLED', CANCELLED_TIMES, CANCELLED_DATES, 21),
];

const AppointmentsHistoryScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [activeStatus, setActiveStatus] = useState<AppointmentStatus>('COMPLETED');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['appointment-1']));

  const filteredAppointments = useMemo(() => {
    return MOCK_APPOINTMENTS.filter(appointment => appointment.status === activeStatus);
  }, [activeStatus]);

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

  const renderAppointmentCard = ({ item }: { item: AppointmentHistoryItem }) => {
    const isExpanded = expandedIds.has(item.id);

    return (
      <View style={styles.card}>
        <View style={styles.therapistRow}>
          <Image
            source={
              item.avatarUrl
                ? { uri: item.avatarUrl }
                : require('../../assets/booking/doctor.png')
            }
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
          <Text style={styles.timeText}>{item.timeLabel}</Text>
          <Text style={styles.dateText}>{item.dateLabel}</Text>
        </View>

        {isExpanded ? (
          <View style={styles.expandedActions}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.actionButton}
              onPress={() => {
                console.log('[AppointmentsHistory] Open details for:', item.id);
              }}>
              <Text style={styles.actionButtonText}>Chi tiết</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.actionButton}
              onPress={() => {
                console.log('[AppointmentsHistory] Reassign old therapist for:', item.id);
              }}>
              <Text style={styles.actionButtonText}>Thay đổi về chuyên gia cũ</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.seeMoreButton}
              onPress={() => toggleExpanded(item.id)}>
              <Ionicons name="chevron-up" size={16} color={COLORS.textSecondary} />
              <Text style={styles.seeMoreText}>Thu gọn</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.seeMoreButton}
            onPress={() => toggleExpanded(item.id)}>
            <Ionicons name="chevron-down" size={16} color={COLORS.textSecondary} />
            <Text style={styles.seeMoreText}>Xem thêm</Text>
          </TouchableOpacity>
        )}
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
          keyExtractor={item => item.id}
          renderItem={renderAppointmentCard}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Không có lịch hẹn trong trạng thái này.</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default AppointmentsHistoryScreen;
