import React, { useMemo, useState } from 'react';
import { FlatList, ScrollView, TouchableOpacity, View } from 'react-native';
import { AppText } from '@/components';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Calendar, DateData } from 'react-native-calendars';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '@/theme';
import { RootStackParamList } from '@/navigation';
import styles from '@/screens/booking/BookingScreen.styles';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Booking'>;

type TimeSlotItem = {
  id: string;
  label: string;
};

const TIME_SLOTS: TimeSlotItem[] = [
  { id: '09:00', label: '09:00 AM' },
  { id: '09:30', label: '09:30 AM' },
  { id: '10:00', label: '10:00 AM' },
  { id: '10:30', label: '10:30 AM' },
  { id: '11:00', label: '11:00 AM' },
  { id: '11:30', label: '11:30 AM' },
  { id: '02:00', label: '02:00 PM' },
  { id: '02:30', label: '02:30 PM' },
  { id: '03:00', label: '03:00 PM' },
  { id: '03:30', label: '03:30 PM' },
  { id: '04:00', label: '04:00 PM' },
  { id: '04:30', label: '04:30 PM' },
];

const BookingScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const today = new Date().toISOString().split('T')[0] ?? '';

  const canConfirm = selectedDate !== '' && selectedTime !== '';

  const markedDates = useMemo(() => {
    if (selectedDate === '') {
      return {};
    }

    return {
      [selectedDate]: {
        customStyles: {
          container: {
            borderWidth: 1.5,
            borderColor: COLORS.buttonPrimary,
            borderRadius: 18,
          },
          text: {
            color: COLORS.text,
            fontWeight: '700' as const,
          },
        },
      },
    };
  }, [selectedDate]);

  const handleDateSelect = (date: DateData) => {
    setSelectedDate(date.dateString);
  };

  const handleConfirm = () => {
    if (!canConfirm) {
      return;
    }

    navigation.navigate('ConsultationDetail', {
      selectedDate,
      selectedTime,
    });
  };

  const renderTimeSlot = ({ item }: { item: TimeSlotItem }) => {
    const isSelected = selectedTime === item.label;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={[
          styles.timeButton,
          isSelected ? styles.timeButtonSelected : styles.timeButtonUnselected,
        ]}
        onPress={() => setSelectedTime(item.label)}
      >
        <AppText
          style={[
            styles.timeButtonText,
            isSelected ? styles.timeButtonTextSelected : styles.timeButtonTextUnselected,
          ]}
        >
          {item.label}
        </AppText>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.white} />
        </TouchableOpacity>
        <AppText style={styles.headerTitle}>Đặt lịch hẹn</AppText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.calendarCard}>
          <Calendar
            current={selectedDate || undefined}
            onDayPress={handleDateSelect}
            markedDates={markedDates}
            markingType="custom"
            minDate={today}
            hideExtraDays
            enableSwipeMonths
            theme={{
              backgroundColor: COLORS.white,
              calendarBackground: COLORS.white,
              textSectionTitleColor: COLORS.textSecondary,
              monthTextColor: COLORS.text,
              dayTextColor: COLORS.text,
              todayTextColor: COLORS.primary,
              arrowColor: COLORS.text,
              textDisabledColor: COLORS.placeholder,
              selectedDayBackgroundColor: COLORS.white,
              selectedDayTextColor: COLORS.text,
            }}
          />
        </View>

        <View style={styles.timeCard}>
          <AppText style={styles.sectionTitle}>Chọn giờ</AppText>
          <FlatList
            data={TIME_SLOTS}
            numColumns={3}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={renderTimeSlot}
            contentContainerStyle={styles.timeGrid}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            canConfirm ? styles.confirmButtonActive : styles.confirmButtonDisabled,
          ]}
          disabled={!canConfirm}
          onPress={handleConfirm}
          activeOpacity={0.8}
        >
          <AppText
            style={[
              styles.confirmButtonText,
              canConfirm ? styles.confirmButtonTextActive : styles.confirmButtonTextDisabled,
            ]}
          >
            Xác nhận
          </AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default BookingScreen;
