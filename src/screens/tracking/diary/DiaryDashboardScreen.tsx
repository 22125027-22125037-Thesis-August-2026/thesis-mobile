import React, { useContext, useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { AppText } from '@/components';
import { NavigationContext, NavigationProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { diaryApi } from '@/api';
import { getMoodCardUi } from '@/constants';
import { COLORS } from '@/theme';
import { TrackingStackParamList } from '@/navigation';
import { DiaryEntryResponse } from '@/types';
import { styles } from '@/screens/tracking/diary/DiaryDashboardScreen.styles';

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

const getEntryTitle = (
  entry: DiaryEntryResponse,
  t: (key: string) => string,
): string => {
  const content = entry.content.trim();

  if (!content) {
    return t('dashboard.entryFallbackTitle');
  }

  return content.length > 24 ? `${content.slice(0, 24)}...` : content;
};

const DiaryDashboardScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useContext(NavigationContext) as
    | NavigationProp<TrackingStackParamList>
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
          <AppText style={styles.loadingText}>{t('dashboard.loading')}</AppText>
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
              onPress={() => navigation?.navigate('DiaryOverview')}>
              <Feather name="arrow-left" size={22} color={COLORS.textPrimary} />
            </Pressable>

            <AppText style={styles.headerTitle}>{t('dashboard.headerTitle')}</AppText>
            <AppText style={styles.headerSubtitle}>{t('dashboard.headerSubtitle')}</AppText>
          </View>

          <Pressable style={styles.settingsButton} onPress={() => {}}>
            <Feather name="settings" size={22} color={COLORS.white} />
          </Pressable>
        </View>

        <View style={styles.chartSection}>
          <AppText style={styles.chartPlaceholderText}>{t('dashboard.chartPlaceholder')}</AppText>
        </View>

        <View>
          <View style={styles.sectionHeaderRow}>
            <AppText style={styles.sectionTitle}>{t('dashboard.sectionAll')}</AppText>
            <Pressable style={styles.sortButton} onPress={() => {}}>
              <AppText style={styles.sortText}>{t('dashboard.sortNewest')}</AppText>
              <Feather name="chevron-down" size={16} color={COLORS.textPrimary} />
            </Pressable>
          </View>

          {entries.length === 0 ? (
            <View style={styles.emptyStateWrap}>
              <AppText style={styles.emptyStateText}>{t('dashboard.emptyState')}</AppText>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.entriesRow}>
              {entries.map(entry => {
                const moodUi = getMoodCardUi(entry.moodTag);

                return (
                  <Pressable
                    style={styles.entryCard}
                    key={entry.id}
                    onPress={() => navigation?.navigate('DiaryEntry', { entryId: entry.id })}>
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
                            color={moodUi.tagBackgroundColor}
                          />
                        </View>
                        <AppText style={styles.entryDateText}>{formatDate(entry.createdAt)}</AppText>
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
                      <AppText style={[styles.moodTagText, { color: moodUi.tagTextColor }]}>
                        {t(moodUi.labelKey)}
                      </AppText>
                    </View>

                    <AppText numberOfLines={1} style={styles.entryTitle}>
                      {getEntryTitle(entry, t)}
                    </AppText>

                    <AppText numberOfLines={2} style={styles.entrySnippet}>
                      {entry.content}
                    </AppText>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </View>

        <View style={styles.statsSection}>
          <View style={styles.sectionHeaderRow}>
            <AppText style={styles.sectionTitle}>{t('dashboard.statsTitle')}</AppText>
            <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.placeholder} />
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={styles.statIconWrap}>
                <Feather name="file-text" size={20} color={COLORS.accentPositive} />
              </View>
              <View>
                <AppText style={styles.statValue}>{t('dashboard.completedCount', { count: completedCount })}</AppText>
                <AppText style={styles.statLabel}>{t('dashboard.statsCompleted')}</AppText>
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconWrap}>
                <Ionicons name="bar-chart-outline" size={22} color={COLORS.accentNeutral} />
              </View>
              <View>
                <AppText style={styles.statValueCompact}>{t('dashboard.statsNeutral')}</AppText>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DiaryDashboardScreen;
