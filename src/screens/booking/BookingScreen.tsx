import React, { useContext, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, TouchableOpacity, View } from 'react-native';
import { AppText } from '@/components';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Calendar, DateData } from 'react-native-calendars';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { COLORS } from '@/theme';
import { RootStackParamList } from '@/navigation';
import styles from '@/screens/booking/BookingScreen.styles';
import { getActiveAssignedTherapist, getTherapistAvailableSlots, TherapistAvailableSlot } from '@/api';
import { AuthContext } from '@/context/AuthContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Booking'>;
type BookingRouteProp = RouteProp<RootStackParamList, 'Booking'>;

type TimeSlotItem = {
  id: string;
  label: string;
  startDatetime: string;
  endDatetime: string;
};

const pad2 = (value: number): string => String(value).padStart(2, '0');

const formatDateToYmd = (date: Date): string =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

const toMonthStart = (dateString: string): string => `${dateString.slice(0, 7)}-01`;

const toCalendarMonth = (year: number, month: number): string => `${year}-${pad2(month)}-01`;

const addDays = (dateString: string, days: number): string => {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + days);
  return formatDateToYmd(date);
};

const formatTimeLabel = (isoDatetime: string): string =>
  new Date(isoDatetime).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

const groupSlotsByDate = (slots: TherapistAvailableSlot[]): Record<string, TimeSlotItem[]> => {
  const grouped: Record<string, TimeSlotItem[]> = {};

  for (const slot of slots) {
    const dateKey = slot.startDatetime.slice(0, 10);

    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }

    grouped[dateKey].push({
      id: slot.slotId,
      label: `${formatTimeLabel(slot.startDatetime)} - ${formatTimeLabel(slot.endDatetime)}`,
      startDatetime: slot.startDatetime,
      endDatetime: slot.endDatetime,
    });
  }

  for (const dateKey of Object.keys(grouped)) {
    grouped[dateKey].sort((a, b) => a.startDatetime.localeCompare(b.startDatetime));
  }

  return grouped;
};

const BookingScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<BookingRouteProp>();
  const auth = useContext(AuthContext);
  const profileId = auth?.userInfo?.profileId;
  const therapistIdFromRoute = route.params?.therapistId;

  const today = useMemo(() => formatDateToYmd(new Date()), []);
  const todayMonth = useMemo(() => toMonthStart(today), [today]);

  const [resolvedTherapistId, setResolvedTherapistId] = useState<string | null>(
    therapistIdFromRoute,
  );
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [visibleMonth, setVisibleMonth] = useState<string>(todayMonth);
  const [slotsByDate, setSlotsByDate] = useState<Record<string, TimeSlotItem[]>>({});
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);
  const [slotError, setSlotError] = useState<string | null>(null);

  const dateSlots = selectedDate ? slotsByDate[selectedDate] ?? [] : [];
  const selectedSlot = dateSlots.find(slot => slot.id === selectedSlotId);
  const canConfirm = selectedDate !== '' && selectedSlotId !== '';
  const slotDates = useMemo(() => Object.keys(slotsByDate).sort(), [slotsByDate]);
  const latestSlotDate = slotDates.length > 0 ? slotDates[slotDates.length - 1] : null;
  const maxNavigableMonth = latestSlotDate ? toMonthStart(latestSlotDate) : todayMonth;

  useEffect(() => {
    let isMounted = true;

    const resolveTherapist = async () => {
      if (therapistIdFromRoute) {
        if (isMounted) {
          setResolvedTherapistId(therapistIdFromRoute);
          setSlotError(null);
        }
        return;
      }

      if (!profileId) {
        if (isMounted) {
          setResolvedTherapistId(null);
          setSlotError(t('booking.bookingScreen.errorProfileMissing'));
        }
        return;
      }

      try {
        const assignedTherapist = await getActiveAssignedTherapist(profileId);

        if (!isMounted) {
          return;
        }

        if (!assignedTherapist) {
          setResolvedTherapistId(null);
          setSlotError(t('booking.bookingScreen.errorNoActiveTherapist'));
          return;
        }

        setResolvedTherapistId(assignedTherapist.id);
        setSlotError(null);
      } catch (error) {
        console.error('[BookingScreen] Failed to resolve assigned therapist:', error);
        if (isMounted) {
          setResolvedTherapistId(null);
          setSlotError(t('booking.bookingScreen.errorTherapistResolveFailed'));
        }
      }
    };

    resolveTherapist();

    return () => {
      isMounted = false;
    };
  }, [profileId, therapistIdFromRoute, t]);

  useEffect(() => {
    let isMounted = true;

    const loadSlots = async () => {
      if (!resolvedTherapistId) {
        if (isMounted) {
          setSlotsByDate({});
          setIsLoadingSlots(false);
        }
        return;
      }

      setIsLoadingSlots(true);
      setSlotError(null);

      try {
        const slots = await getTherapistAvailableSlots(resolvedTherapistId);

        if (!isMounted) {
          return;
        }

        setSlotsByDate(groupSlotsByDate(slots));
        setSlotError(null);
      } catch (error) {
        console.error('[BookingScreen] Failed to load therapist slots:', error);
        if (isMounted) {
          setSlotsByDate({});
          setSlotError(t('booking.bookingScreen.errorSlotsLoadFailed'));
        }
      } finally {
        if (isMounted) {
          setIsLoadingSlots(false);
        }
      }
    };

    loadSlots();

    return () => {
      isMounted = false;
    };
  }, [resolvedTherapistId, t]);

  useEffect(() => {
    if (!selectedDate) {
      setSelectedSlotId('');
      return;
    }

    const slotExists = (slotsByDate[selectedDate] ?? []).some(slot => slot.id === selectedSlotId);
    if (!slotExists) {
      setSelectedSlotId('');
    }
  }, [selectedDate, selectedSlotId, slotsByDate]);

  useEffect(() => {
    if (!latestSlotDate) {
      if (selectedDate !== '') {
        setSelectedDate('');
      }
      return;
    }

    if (selectedDate && !slotsByDate[selectedDate]) {
      setSelectedDate('');
      setSelectedSlotId('');
    }

    if (visibleMonth > maxNavigableMonth) {
      setVisibleMonth(maxNavigableMonth);
    }
  }, [latestSlotDate, maxNavigableMonth, selectedDate, slotsByDate, visibleMonth]);

  const markedDates = useMemo(() => {
    const marked: Record<string, { disabled?: boolean; disableTouchEvent?: boolean; customStyles?: { container?: { borderWidth?: number; borderColor?: string; borderRadius?: number; backgroundColor?: string }; text?: { color?: string; fontWeight?: '700' } } }> = {};

    if (latestSlotDate) {
      let cursor = today;
      while (cursor <= latestSlotDate) {
        if (!slotsByDate[cursor]) {
          marked[cursor] = {
            disabled: true,
            disableTouchEvent: true,
            customStyles: {
              text: {
                color: COLORS.placeholder,
              },
            },
          };
        }

        cursor = addDays(cursor, 1);
      }
    }

    if (selectedDate !== '') {
      marked[selectedDate] = {
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
      };
    }

    return marked;
  }, [latestSlotDate, selectedDate, slotsByDate, today]);

  const handleDateSelect = (date: DateData) => {
    if (date.dateString < today) {
      return;
    }

    if (!slotsByDate[date.dateString]) {
      return;
    }

    setSelectedDate(date.dateString);
    setVisibleMonth(toMonthStart(date.dateString));
  };

  const handleMonthChange = (date: DateData) => {
    const nextMonth = toCalendarMonth(date.year, date.month);

    if (nextMonth < todayMonth) {
      setVisibleMonth(todayMonth);
      return;
    }

    if (nextMonth > maxNavigableMonth) {
      setVisibleMonth(maxNavigableMonth);
      return;
    }

    setVisibleMonth(nextMonth);
  };

  const handleConfirm = () => {
    if (!canConfirm || !selectedSlot) {
      return;
    }

    navigation.navigate('ConsultationDetail', {
      selectedDate,
      selectedTime: selectedSlot.label,
    });
  };

  const renderTimeSlot = ({ item }: { item: TimeSlotItem }) => {
    const isSelected = selectedSlotId === item.id;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={[
          styles.timeButton,
          isSelected ? styles.timeButtonSelected : styles.timeButtonUnselected,
        ]}
        onPress={() => setSelectedSlotId(item.id)}
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
        <AppText style={styles.headerTitle}>{t('booking.bookingScreen.headerTitle')}</AppText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.calendarCard}>
          <Calendar
            current={visibleMonth}
            onDayPress={handleDateSelect}
            onMonthChange={handleMonthChange}
            markedDates={markedDates}
            markingType="custom"
            minDate={today}
            maxDate={latestSlotDate ?? today}
            hideExtraDays
            disableArrowLeft={visibleMonth <= todayMonth}
            disableArrowRight={visibleMonth >= maxNavigableMonth}
            onPressArrowLeft={subtractMonth => {
              if (visibleMonth > todayMonth) {
                subtractMonth();
              }
            }}
            onPressArrowRight={addMonth => {
              if (visibleMonth < maxNavigableMonth) {
                addMonth();
              }
            }}
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
          <AppText style={styles.sectionTitle}>{t('booking.bookingScreen.timeSectionTitle')}</AppText>
          {isLoadingSlots ? (
            <View style={styles.slotsInfoContainer}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <AppText style={[styles.slotsInfoText, styles.slotsInfoTextInline]}>
                {t('booking.bookingScreen.loadingSlots')}
              </AppText>
            </View>
          ) : null}

          {!isLoadingSlots && slotError ? (
            <AppText style={[styles.slotsInfoText, styles.slotsErrorText]}>{slotError}</AppText>
          ) : null}

          {!isLoadingSlots && !slotError && selectedDate === '' ? (
            <AppText style={styles.slotsInfoText}>{t('booking.bookingScreen.selectDateHint')}</AppText>
          ) : null}

          {!isLoadingSlots && !slotError && dateSlots.length > 0 ? (
            <FlatList
              data={dateSlots}
              numColumns={3}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              renderItem={renderTimeSlot}
              contentContainerStyle={styles.timeGrid}
            />
          ) : null}
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
            {t('booking.bookingScreen.confirmButton')}
          </AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default BookingScreen;
