import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { NavigationContext, NavigationProp, ParamListBase } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import * as diaryApi from '../../api/diaryApi';
import { COLORS } from '../../constants/colors';
import { DiaryEntryResponse } from '../../types/diary';
import { styles } from './DiaryDashboardScreen.styles';

type MoodUiConfig = {
  moodIcon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  iconBackgroundColor: string;
  tagBackgroundColor: string;
  tagTextColor: string;
  label: string;
};

const MOOD_UI_MAP: Record<string, MoodUiConfig> = {
  TERRIBLE: {
    moodIcon: 'emoticon-cry-outline',
    iconBackgroundColor: COLORS.errorBg,
    tagBackgroundColor: COLORS.errorBg,
    tagTextColor: COLORS.errorText,
    label: 'TỆ HẠI',
  },
  BAD: {
    moodIcon: 'emoticon-sad-outline',
    iconBackgroundColor: COLORS.errorBg,
    tagBackgroundColor: COLORS.errorBg,
    tagTextColor: COLORS.errorText,
    label: 'TỨC GIẬN',
  },
  NEUTRAL: {
    moodIcon: 'emoticon-neutral-outline',
    iconBackgroundColor: COLORS.socialBg,
    tagBackgroundColor: COLORS.socialBg,
    tagTextColor: COLORS.textSecondary,
    label: 'TRUNG TÍNH',
  },
  GOOD: {
    moodIcon: 'emoticon-happy-outline',
    iconBackgroundColor: COLORS.accentPositive,
    tagBackgroundColor: COLORS.socialBg,
    tagTextColor: COLORS.accentPositive,
    label: 'VUI VẺ',
  },
  EXCELLENT: {
    moodIcon: 'emoticon-excited-outline',
    iconBackgroundColor: COLORS.accentPositive,
    tagBackgroundColor: COLORS.socialBg,
    tagTextColor: COLORS.accentPositive,
    label: 'TUYỆT VỜI',
  },
};

const FALLBACK_MOOD: MoodUiConfig = {
  moodIcon: 'emoticon-neutral-outline',
  iconBackgroundColor: COLORS.socialBg,
  tagBackgroundColor: COLORS.socialBg,
  tagTextColor: COLORS.textSecondary,
  label: 'TRUNG TÍNH',
};

const getMoodUi = (moodTag: string | null): MoodUiConfig => {
  if (!moodTag) {
    return FALLBACK_MOOD;
  }

  return MOOD_UI_MAP[moodTag] ?? FALLBACK_MOOD;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return '--/--/----';
  }

  const day = `${date.getDate()}`.padStart(2, '0');
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

const getEntryTitle = (entry: DiaryEntryResponse): string => {
  const content = entry.content.trim();

  if (!content) {
    return 'Nhật ký cảm xúc';
  }

  return content.length > 24 ? `${content.slice(0, 24)}...` : content;
};

const DiaryDashboardScreen: React.FC = () => {
  const navigation = useContext(NavigationContext) as
    | NavigationProp<ParamListBase>
    | undefined;
  const [entries, setEntries] = useState<DiaryEntryResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const fetchEntries = async (): Promise<void> => {
      setIsLoading(true);

      try {
        const data = await diaryApi.getDiaryEntries();

        if (isMounted) {
          setEntries(data);
        }
      } catch (error) {
        console.error('[DiaryDashboard] Failed to fetch diary entries:', error);
        if (isMounted) {
          setEntries([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchEntries();

    return () => {
      isMounted = false;
    };
  }, []);

  const completedCount = useMemo(() => entries.length, [entries]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={COLORS.buttonPrimary} size="large" />
          <Text style={styles.loadingText}>Đang tải nhật ký cảm xúc...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Pressable
              style={styles.iconCircleButton}
              onPress={() => navigation?.goBack()}
              disabled={!navigation?.canGoBack?.()}>
              <Feather name="arrow-left" size={22} color={COLORS.textPrimary} />
            </Pressable>

            <Text style={styles.headerTitle}>Chuyện của mình</Text>
            <Text style={styles.headerSubtitle}>Nhật ký cảm xúc</Text>
          </View>

          <Pressable style={styles.settingsButton} onPress={() => {}}>
            <Feather name="settings" size={22} color={COLORS.white} />
          </Pressable>
        </View>

        <View style={styles.chartSection}>
          <Text style={styles.chartPlaceholderText}>Chart Component Placeholder</Text>
        </View>

        <View>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Tất cả</Text>
            <Pressable style={styles.sortButton} onPress={() => {}}>
              <Text style={styles.sortText}>Mới nhất</Text>
              <Feather name="chevron-down" size={16} color={COLORS.textPrimary} />
            </Pressable>
          </View>

          {entries.length === 0 ? (
            <View style={styles.emptyStateWrap}>
              <Text style={styles.emptyStateText}>Chưa có nhật ký nào. Hãy tạo một nhật ký mới.</Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.entriesRow}>
              {entries.map(entry => {
                const moodUi = getMoodUi(entry.moodTag);

                return (
                  <View style={styles.entryCard} key={entry.id}>
                    <View style={styles.cardTopRow}>
                      <View style={styles.cardTopLeft}>
                        <View
                          style={[
                            styles.moodIconWrap,
                            { backgroundColor: moodUi.iconBackgroundColor },
                          ]}>
                          <MaterialCommunityIcons
                            name={moodUi.moodIcon}
                            size={24}
                            color={moodUi.tagTextColor}
                          />
                        </View>
                        <Text style={styles.entryDateText}>{formatDate(entry.createdAt)}</Text>
                      </View>

                      <Ionicons
                        name="ellipsis-horizontal"
                        size={18}
                        color={COLORS.placeholder}
                      />
                    </View>

                    <View
                      style={[
                        styles.moodTagPill,
                        { backgroundColor: moodUi.tagBackgroundColor },
                      ]}>
                      <Text style={[styles.moodTagText, { color: moodUi.tagTextColor }]}>
                        {moodUi.label}
                      </Text>
                    </View>

                    <Text numberOfLines={1} style={styles.entryTitle}>
                      {getEntryTitle(entry)}
                    </Text>

                    <Text numberOfLines={2} style={styles.entrySnippet}>
                      {entry.content}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          )}
        </View>

        <View style={styles.statsSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Thống kê cảm xúc</Text>
            <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.placeholder} />
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={styles.statIconWrap}>
                <Feather name="file-text" size={20} color={COLORS.accentPositive} />
              </View>
              <View>
                <Text style={styles.statValue}>{`${completedCount}/365`}</Text>
                <Text style={styles.statLabel}>Hoàn thành</Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconWrap}>
                <Ionicons name="bar-chart-outline" size={22} color={COLORS.accentNeutral} />
              </View>
              <View>
                <Text style={styles.statValueCompact}>Trung tính</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DiaryDashboardScreen;
