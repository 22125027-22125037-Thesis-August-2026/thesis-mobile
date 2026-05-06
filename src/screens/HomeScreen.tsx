import React, { useCallback, useContext, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  RefreshControl,
  ScrollView,
  View,
  Image,
  Pressable,
} from 'react-native';
import { AppText } from '@/components';
import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';

import { trackingApi, diaryApi } from '@/api';
import { DailyLogsSection } from '@/components/tracking';
import { AuthContext } from '@/context/AuthContext';
import { COLORS } from '@/theme';
import { RootStackParamList } from '@/navigation';
import { MOOD_SELECTOR_OPTIONS, MoodTag, getMoodScore } from '@/constants/moods';
import { styles } from './HomeScreen.styles';

type NavigationPropType = NavigationProp<RootStackParamList>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationPropType>();
  const { userInfo } = useContext(AuthContext)!;
  const { t } = useTranslation();
  const [summary, setSummary] = useState<trackingApi.DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentMood, setCurrentMood] = useState<MoodTag>('NEUTRAL');
  const [todayDiaryId, setTodayDiaryId] = useState<string | null>(null);
  const [todayDiaryContent, setTodayDiaryContent] = useState<string>('');

  const fetchSummary = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const data = await trackingApi.getDashboardSummary();
      setSummary(data);
    } catch (error) {
      console.error('[HomeScreen] Failed to load dashboard summary:', error);
      setSummary(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTodayMood = useCallback(async (): Promise<void> => {
    if (!userInfo?.profileId) return;
    try {
      const entries = await diaryApi.getDiaryEntries(userInfo.profileId);
      const todayStr = new Date().toISOString().slice(0, 10);
      const todayEntries = entries.filter(e => e.entryDate === todayStr);
      if (todayEntries.length > 0) {
        const latest = todayEntries.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )[0];
        setCurrentMood((latest.moodTag as MoodTag) ?? 'NEUTRAL');
        setTodayDiaryId(latest.id);
        setTodayDiaryContent(latest.content ?? '');
      } else {
        setCurrentMood('NEUTRAL');
        setTodayDiaryId(null);
        setTodayDiaryContent('');
      }
    } catch {
      // silently keep current mood on error
    }
  }, [userInfo?.profileId]);

  useFocusEffect(
    useCallback(() => {
      fetchSummary();
      fetchTodayMood();
    }, [fetchSummary, fetchTodayMood]),
  );

  const handleMoodSelect = async (mood: MoodTag): Promise<void> => {
    const prevMood = currentMood;
    setCurrentMood(mood);
    try {
      const todayStr = new Date().toISOString().slice(0, 10);
      if (todayDiaryId) {
        await diaryApi.updateDiaryEntry(todayDiaryId, {
          content: todayDiaryContent,
          moodTag: mood,
          positivityScore: getMoodScore(mood),
          entryDate: todayStr,
        });
      } else {
        const created = await diaryApi.createDiaryEntry({
          content: '',
          moodTag: mood,
          positivityScore: getMoodScore(mood),
          entryDate: todayStr,
        });
        setTodayDiaryId(created.id);
      }
    } catch {
      setCurrentMood(prevMood);
    }
  };

  const handleNavigateChatbot = (): void => {
    navigation.navigate('Chat');
  };

  const handleNavigateTherapistFilter = (): void => {
    navigation.navigate('TherapistBookingLanding');
  };

  const today = new Date();
  const dateString = today.toLocaleDateString('vi-VN', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  });

  const avatarUrl = userInfo?.avatarUrl ?? 'https://via.placeholder.com/80';
  const userName = userInfo?.fullName || 'Bạn';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchSummary} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* ===== HERO HEADER ===== */}
        <View style={styles.heroHeader}>
          <View style={styles.heroCircleLarge} />
          <View style={styles.heroCircleSmall} />

          {/* Top Bar: Date & Notification */}
          <View style={styles.topBar}>
            <View style={styles.dateSection}>
              <MaterialCommunityIcons
                name="calendar-outline"
                size={16}
                color="rgba(255,255,255,0.7)"
              />
              <AppText style={styles.dateText}>{dateString}</AppText>
            </View>
            <Pressable style={styles.notificationButton}>
              <Feather name="bell" size={20} color={COLORS.white} />
              <View style={styles.notificationBadge} />
            </Pressable>
          </View>

          {/* Greeting + avatar */}
          <View style={styles.profileSection}>
            <Image
              source={{ uri: avatarUrl }}
              style={styles.profileAvatar}
              defaultSource={require('../assets/booking/placeholder.png')}
            />
            <View style={styles.profileInfo}>
              <AppText style={styles.greetingText}>
                Chào, {userName.split(' ').pop()}! 👋
              </AppText>
              <AppText style={styles.greetingSubtext}>
                {t('home.overview.greetingSubtext')}
              </AppText>
            </View>
          </View>

          {/* Quick mood check-in */}
          <View style={styles.moodSection}>
            <AppText style={styles.moodLabel}>{t('home.overview.moodPrompt')}</AppText>
            <View style={styles.moodChips}>
              {MOOD_SELECTOR_OPTIONS.map(opt => {
                const isActive = currentMood === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    style={[
                      styles.moodChip,
                      isActive && { backgroundColor: `${opt.color}40`, borderColor: opt.color },
                    ]}
                    onPress={() => handleMoodSelect(opt.value)}
                  >
                    <MaterialCommunityIcons
                      name={isActive ? opt.activeIcon : opt.icon}
                      size={26}
                      color={isActive ? opt.color : 'rgba(255,255,255,0.55)'}
                    />
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        {/* ===== MAIN CONTENT ===== */}
        <View style={styles.paddedContent}>
          {/* Daily Logs */}
          <DailyLogsSection
            targetProfileId={userInfo?.profileId ?? ''}
            isOwnProfile={true}
          />

          {/* AI Chatbot */}
          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>
              {t('home.overview.aiChatbotTitle')}
            </AppText>

            <Pressable style={styles.chatbotCard} onPress={handleNavigateChatbot}>
              <View style={styles.chatbotDecorCircle} />

              <View style={styles.chatbotTop}>
                <View style={styles.robotIllustration}>
                  <MaterialCommunityIcons
                    name="robot-outline"
                    size={28}
                    color={COLORS.primary}
                  />
                </View>
                <View style={styles.chatbotText}>
                  <AppText style={styles.chatbotTitle}>Bạn Tâm Giao</AppText>
                  <AppText style={styles.chatbotSubtitle}>
                    Mình luôn ở đây để lắng nghe bạn
                  </AppText>
                </View>
              </View>

              <View style={styles.chatbotInvite}>
                <View style={styles.chatbotInviteText}>
                  <AppText style={styles.chatbotInviteMain}>
                    Bắt đầu trò chuyện mới
                  </AppText>
                  <AppText style={styles.chatbotMeta}>
                    {summary?.totalAiSessions ?? 0} buổi · {summary?.monthlyAiSessions ?? 0} buổi tháng này
                  </AppText>
                </View>
                <Pressable style={styles.chatbotPlusBtn} onPress={handleNavigateChatbot}>
                  <MaterialCommunityIcons name="plus" size={22} color={COLORS.white} />
                </Pressable>
              </View>
            </Pressable>
          </View>

          {/* Group Sessions */}
          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>
              {t('home.overview.groupSessionsTitle')}
            </AppText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={16}
              contentContainerStyle={styles.sessionsCarousel}
            >
              <Pressable
                style={styles.sessionCard}
                onPress={handleNavigateTherapistFilter}
              >
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=200&fit=crop' }}
                  style={styles.sessionImage}
                />
                <View style={styles.sessionOverlay} />
                <View style={styles.sessionContent}>
                  <AppText style={styles.sessionTitle}>Anxiety & Stress</AppText>
                  <AppText style={styles.sessionSubtitle}>Management</AppText>
                </View>
              </Pressable>

              <Pressable
                style={styles.sessionCard}
                onPress={handleNavigateTherapistFilter}
              >
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=200&fit=crop' }}
                  style={styles.sessionImage}
                />
                <View style={styles.sessionOverlay} />
                <View style={styles.sessionContent}>
                  <AppText style={styles.sessionTitle}>Trauma & PTSD</AppText>
                  <AppText style={styles.sessionSubtitle}>Recovery</AppText>
                </View>
              </Pressable>

              <Pressable style={styles.sessionCard}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=300&h=200&fit=crop' }}
                  style={styles.sessionImage}
                />
                <View style={styles.sessionOverlay} />
                <View style={styles.sessionContent}>
                  <AppText style={styles.sessionTitle}>Family Dynamics &</AppText>
                  <AppText style={styles.sessionSubtitle}>Healing</AppText>
                </View>
              </Pressable>

              <Pressable style={styles.sessionCard}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=300&h=200&fit=crop' }}
                  style={styles.sessionImage}
                />
                <View style={styles.sessionOverlay} />
                <View style={styles.sessionContent}>
                  <AppText style={styles.sessionTitle}>Social Anxiety &</AppText>
                  <AppText style={styles.sessionSubtitle}>Building Confidence</AppText>
                </View>
              </Pressable>
            </ScrollView>
          </View>

          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
