import React, { useCallback, useContext, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  TextInput,
  View,
  Platform,
  Modal,
} from 'react-native';
import DatePicker from '@react-native-community/datetimepicker';
import {
  useFocusEffect,
  NavigationContext,
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { diaryApi } from '@/api';
import { getMoodCardUi } from '@/constants';
import { AppText } from '@/components';
import { AuthContext } from '@/context/AuthContext';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONTS } from '@/theme';
import { RootStackParamList, TrackingStackParamList } from '@/navigation';
import { DiaryEntryResponse } from '@/types';
import { styles } from './DiaryOverviewScreen.styles';

// ===== UTILITY FUNCTIONS =====

const formatDate = (dateString: string): string => {
  console.log('Formatting date:', dateString);
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '--/--/----';

  const day = `${date.getDate()}`.padStart(2, '0');
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

const isDateInRange = (
  entryDateStr: string,
  fromDate: Date | null,
  toDate: Date | null,
): boolean => {
  const entryDate = new Date(entryDateStr);
  entryDate.setHours(0, 0, 0, 0);

  if (fromDate) {
    const from = new Date(fromDate);
    from.setHours(0, 0, 0, 0);
    if (entryDate < from) return false;
  }

  if (toDate) {
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);
    if (entryDate > to) return false;
  }

  return true;
};

const calculateStreak = (entries: DiaryEntryResponse[]): number => {
  if (entries.length === 0) return 0;

  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const entry of sortedEntries) {
    const entryDate = new Date(entry.createdAt);
    entryDate.setHours(0, 0, 0, 0);

    const diffTime = currentDate.getTime() - entryDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays === streak) {
      streak++;
      currentDate = new Date(entryDate);
    } else if (diffDays > streak) {
      break;
    }
  }

  return streak;
};

// ===== MAIN COMPONENT =====

const DiaryOverviewScreen: React.FC = () => {
  const { t } = useTranslation();
  const { userInfo } = useContext(AuthContext)!;
  const navigation = useNavigation<NavigationProp<TrackingStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'DiaryOverview'>>();
  const viewProfileId = route.params?.viewProfileId;
  const [entries, setEntries] = useState<DiaryEntryResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [showFromDatePicker, setShowFromDatePicker] = useState<boolean>(false);
  const [showToDatePicker, setShowToDatePicker] = useState<boolean>(false);

  const fetchEntries = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const data = await diaryApi.getDiaryEntries(viewProfileId ?? userInfo?.profileId ?? '');
      setEntries(data);
    } catch (error) {
      console.error('[DiaryOverview] Failed to fetch entries:', error);
      setEntries([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchEntries();
    }, [fetchEntries]),
  );

  const streak = useMemo(() => calculateStreak(entries), [entries]);

  const filteredEntries = useMemo(() => {
    let filtered = entries;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        entry =>
          entry.title?.toLowerCase().includes(query) ||
          entry.content?.toLowerCase().includes(query),
      );
    }

    // Date range filter
    filtered = filtered.filter(entry =>
      isDateInRange(entry.entryDate, fromDate, toDate),
    );

    // Sort by entryDate descending
    return filtered.sort((a, b) => {
      const dateA = new Date(a.entryDate ?? a.createdAt).getTime();
      const dateB = new Date(b.entryDate ?? b.createdAt).getTime();
      return dateB - dateA;
    });
  }, [entries, searchQuery, fromDate, toDate]);

  const handleEntryPress = (entryId: string) => {
    if (viewProfileId) {
      return;
    }
    navigation.navigate('DiaryEntry', { entryId });
  };

  const handleNewEntry = () => {
    navigation.navigate('DiaryEntry');
  };

  const handleFromDateChange = (event: any, selectedDate?: Date): void => {
    if (Platform.OS === 'android') {
      setShowFromDatePicker(false);
    }
    if (selectedDate) {
      setFromDate(selectedDate);
    }
  };

  const handleToDateChange = (event: any, selectedDate?: Date): void => {
    if (Platform.OS === 'android') {
      setShowToDatePicker(false);
    }
    if (selectedDate) {
      setToDate(selectedDate);
    }
  };

  const formatDateDisplay = (date: Date | null): string => {
    if (!date) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const renderDiaryCard = ({
    item,
    index,
  }: {
    item: DiaryEntryResponse;
    index: number;
  }) => {
    const moodUi = getMoodCardUi(item.moodTag);
    const isLastItem = index === filteredEntries.length - 1;

    return (
      <View style={styles.timelineItem}>
        {/* Timeline Line */}
        <View
          style={[styles.timelineLine, isLastItem && styles.timelineLineHidden]}
        />

        {/* Timeline Dot with Mood Icon */}
        <View
          style={[
            styles.timelineDot,
            { borderColor: moodUi.iconBackgroundColor },
          ]}
        >
          <MaterialCommunityIcons
            name={moodUi.moodIcon}
            size={28}
            color={moodUi.iconBackgroundColor}
          />
        </View>

        {/* Card Content - Full Width */}
        <Pressable
          style={styles.entryCard}
          onPress={() => handleEntryPress(item.id)}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <View style={styles.cardMeta}>
                <AppText style={styles.entryDate}>
                  {formatDate(item.entryDate)}
                </AppText>
              </View>
              {item.title?.trim() && (
                <AppText style={styles.entryTitle}>{item.title}</AppText>
              )}
            </View>
          </View>

          <AppText style={styles.entryContent}>{item.content}</AppText>
        </Pressable>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyStateWrap}>
      <MaterialCommunityIcons
        name="notebook-outline"
        size={64}
        color={COLORS.textSecondary}
      />
      <AppText style={styles.emptyStateTitle}>
        {t('overview.emptyState')}
      </AppText>
      <AppText style={styles.emptyStateSubtitle}>
        {searchQuery
          ? t('overview.emptyStateSearchResult')
          : t('overview.emptyStateNoEntries')}
      </AppText>
      {!viewProfileId && (
        <Pressable style={styles.emptyStateButton} onPress={handleNewEntry}>
          <Feather
            name="plus"
            size={18}
            color={COLORS.white}
            style={{ marginRight: SPACING.xs }}
          />
          <AppText style={styles.emptyStateButtonText}>
            {t('overview.newEntryButton')}
          </AppText>
        </Pressable>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <AppText style={styles.loadingText}>{t('overview.loading')}</AppText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerCard}>
          <View style={styles.headerTopRow}>
            <Pressable
              style={styles.headerBackButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Feather name="chevron-left" size={22} color={COLORS.white} />
            </Pressable>
            <View style={styles.headerTitleBlock}>
              <AppText style={styles.headerTitle}>
                {t('overview.headerTitle')}
              </AppText>
              <AppText style={styles.headerSubtitle}>
                {t('overview.subtitleLine1')} {t('overview.subtitleLine2')}
              </AppText>
            </View>
          </View>
        </View>

        {/* Search Bar & Streak Widget */}
        <View style={styles.searchStreakSection}>
          <View style={styles.searchInputWrap}>
            <Feather name="search" size={18} color={COLORS.placeholder} />
            <TextInput
              style={styles.searchInput}
              placeholder={t('overview.searchPlaceholder')}
              placeholderTextColor={COLORS.placeholder}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')}>
                <Feather name="x" size={18} color={COLORS.placeholder} />
              </Pressable>
            )}
          </View>

          {/* Streak Widget */}
          <View style={styles.streakWidget}>
            <AppText style={styles.streakFire}>🔥</AppText>
            <View style={styles.streakContent}>
              <AppText style={styles.streakNumber}>{streak}</AppText>
              <AppText style={styles.streakLabel}>
                {t('overview.streakLabel')}
              </AppText>
            </View>
          </View>
        </View>

        {/* Date Range Filter Row */}
        <View style={styles.dateRangeFilterRow}>
          <Pressable
            style={styles.dateRangeButton}
            onPress={() => setShowFromDatePicker(true)}
          >
            <Feather name="calendar" size={16} color={COLORS.primary} />
            <AppText style={styles.dateRangeButtonText}>
              {fromDate
                ? formatDateDisplay(fromDate)
                : t('overview.dateRangeFromLabel')}
            </AppText>
          </Pressable>

          <Pressable
            style={styles.dateRangeButton}
            onPress={() => setShowToDatePicker(true)}
          >
            <Feather name="calendar" size={16} color={COLORS.primary} />
            <AppText style={styles.dateRangeButtonText}>
              {toDate
                ? formatDateDisplay(toDate)
                : t('overview.dateRangeToLabel')}
            </AppText>
          </Pressable>

          {(fromDate || toDate) && (
            <Pressable
              style={styles.dateRangeClearButton}
              onPress={() => {
                setFromDate(null);
                setToDate(null);
              }}
            >
              <AppText style={styles.dateRangeClearText}>
                {t('overview.dateRangeClearButton')}
              </AppText>
            </Pressable>
          )}
        </View>

        {/* From Date Picker */}
        {showFromDatePicker &&
          (Platform.OS === 'ios' ? (
            <Modal
              transparent
              animationType="slide"
              visible={showFromDatePicker}
              onRequestClose={() => setShowFromDatePicker(false)}
            >
              <View style={styles.datePickerModal}>
                <View style={styles.datePickerContainer}>
                  <View style={styles.datePickerHeader}>
                    <Pressable onPress={() => setShowFromDatePicker(false)}>
                      <AppText style={styles.datePickerHeaderText}>
                        Done
                      </AppText>
                    </Pressable>
                  </View>
                  <DatePicker
                    value={fromDate ?? new Date()}
                    mode="date"
                    display="spinner"
                    onChange={handleFromDateChange}
                  />
                </View>
              </View>
            </Modal>
          ) : (
            <DatePicker
              value={fromDate ?? new Date()}
              mode="date"
              display="default"
              onChange={handleFromDateChange}
            />
          ))}

        {/* To Date Picker */}
        {showToDatePicker &&
          (Platform.OS === 'ios' ? (
            <Modal
              transparent
              animationType="slide"
              visible={showToDatePicker}
              onRequestClose={() => setShowToDatePicker(false)}
            >
              <View style={styles.datePickerModal}>
                <View style={styles.datePickerContainer}>
                  <View style={styles.datePickerHeader}>
                    <Pressable onPress={() => setShowToDatePicker(false)}>
                      <AppText style={styles.datePickerHeaderText}>
                        Done
                      </AppText>
                    </Pressable>
                  </View>
                  <DatePicker
                    value={toDate ?? new Date()}
                    mode="date"
                    display="spinner"
                    onChange={handleToDateChange}
                  />
                </View>
              </View>
            </Modal>
          ) : (
            <DatePicker
              value={toDate ?? new Date()}
              mode="date"
              display="default"
              onChange={handleToDateChange}
            />
          ))}

        {/* Timeline Feed */}
        {filteredEntries.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={filteredEntries}
            renderItem={renderDiaryCard}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.timelineContent}
            showsVerticalScrollIndicator={false}
            scrollEnabled={true}
          />
        )}

        {/* FAB - Create New Entry */}
        {!viewProfileId && (
          <Pressable style={styles.fab} onPress={handleNewEntry}>
            <Feather name="plus" size={28} color={COLORS.white} />
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
};

export default DiaryOverviewScreen;
