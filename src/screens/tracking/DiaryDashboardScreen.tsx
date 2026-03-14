import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { NavigationContext, NavigationProp } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import * as diaryApi from '../../api/diaryApi';
import { COLORS } from '../../constants/colors';
import { getMoodCardUi } from '../../constants/moods';
import { TrackingStackParamList } from '../../navigation/types';
import { t } from '../../constants/i18n';
import { DiaryEntryResponse } from '../../types/diary';
import { styles } from './DiaryDashboardScreen.styles';

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
    return t('dashboard.entryFallbackTitle');
  }

  return content.length > 24 ? `${content.slice(0, 24)}...` : content;
};

const DiaryDashboardScreen: React.FC = () => {
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
          <Text style={styles.loadingText}>{t('dashboard.loading')}</Text>
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

            <Text style={styles.headerTitle}>{t('dashboard.headerTitle')}</Text>
            <Text style={styles.headerSubtitle}>{t('dashboard.headerSubtitle')}</Text>
          </View>

          <Pressable style={styles.settingsButton} onPress={() => {}}>
            <Feather name="settings" size={22} color={COLORS.white} />
          </Pressable>
        </View>

        <View style={styles.chartSection}>
          <Text style={styles.chartPlaceholderText}>{t('dashboard.chartPlaceholder')}</Text>
        </View>

        <View>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>{t('dashboard.sectionAll')}</Text>
            <Pressable style={styles.sortButton} onPress={() => {}}>
              <Text style={styles.sortText}>{t('dashboard.sortNewest')}</Text>
              <Feather name="chevron-down" size={16} color={COLORS.textPrimary} />
            </Pressable>
          </View>

          {entries.length === 0 ? (
            <View style={styles.emptyStateWrap}>
              <Text style={styles.emptyStateText}>{t('dashboard.emptyState')}</Text>
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
                        {t(moodUi.labelKey)}
                      </Text>
                    </View>

                    <Text numberOfLines={1} style={styles.entryTitle}>
                      {getEntryTitle(entry)}
                    </Text>

                    <Text numberOfLines={2} style={styles.entrySnippet}>
                      {entry.content}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </View>

        <View style={styles.statsSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>{t('dashboard.statsTitle')}</Text>
            <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.placeholder} />
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={styles.statIconWrap}>
                <Feather name="file-text" size={20} color={COLORS.accentPositive} />
              </View>
              <View>
                <Text style={styles.statValue}>{t('dashboard.completedCount', { count: completedCount })}</Text>
                <Text style={styles.statLabel}>{t('dashboard.statsCompleted')}</Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconWrap}>
                <Ionicons name="bar-chart-outline" size={22} color={COLORS.accentNeutral} />
              </View>
              <View>
                <Text style={styles.statValueCompact}>{t('dashboard.statsNeutral')}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DiaryDashboardScreen;
