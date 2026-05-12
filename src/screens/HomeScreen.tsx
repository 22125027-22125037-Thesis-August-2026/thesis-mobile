import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Animated,
  RefreshControl,
  ScrollView,
  View,
  Image,
  Pressable,
  TextInput,
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
import LogoMark from '@/assets/logo/LogoMark';
import { styles } from './HomeScreen.styles';

const MOOD_CONTENT_KEY: Record<MoodTag, string> = {
  TERRIBLE: 'home.overview.moodDefaultTerrible',
  BAD: 'home.overview.moodDefaultBad',
  NEUTRAL: 'home.overview.moodDefaultNeutral',
  GOOD: 'home.overview.moodDefaultGood',
  EXCELLENT: 'home.overview.moodDefaultExcellent',
};

type NavigationPropType = NavigationProp<RootStackParamList>;

// ──────────────────────────────────────────────────────────────────────────────
// AI COMPANION CARD
// ──────────────────────────────────────────────────────────────────────────────

type CompanionCardProps = { onPress: () => void };

const CompanionCard: React.FC<CompanionCardProps> = ({ onPress }) => {
  const breathAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(breathAnim, { toValue: 1.07, duration: 1800, useNativeDriver: true }),
        Animated.timing(breathAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
      ]),
    ).start();
  }, [breathAnim]);
  return (
    <Pressable style={styles.companionCard} onPress={onPress}>
      <View style={styles.companionOrbitContainer}>
        <Animated.View style={[styles.companionRingOuter, { transform: [{ scale: breathAnim }] }]}>
          <View style={styles.companionRingInner}>
            <View style={styles.companionAvatar}>
              <LogoMark size={42} />
            </View>
          </View>
        </Animated.View>
        <View style={[styles.companionOrbitDot, styles.companionOrbitDot1]} />
        <View style={[styles.companionOrbitDot, styles.companionOrbitDot2]} />
        <View style={[styles.companionOrbitDot, styles.companionOrbitDot3]} />
      </View>
      <AppText style={styles.companionTitle}>Bạn Tâm Giao</AppText>
      <View style={styles.companionStatusRow}>
        <View style={styles.companionOnlineDot} />
        <AppText style={styles.companionStatusTxt}>Online · Sẵn sàng lắng nghe</AppText>
      </View>
      <Pressable style={styles.companionCTA} onPress={onPress}>
        <AppText style={styles.companionCTATxt}>Bắt đầu ngay</AppText>
        <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.white} />
      </Pressable>
    </Pressable>
  );
};

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationPropType>();
  const { userInfo } = useContext(AuthContext)!;
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentMood, setCurrentMood] = useState<MoodTag | null>(null);
  const [pendingMood, setPendingMood] = useState<MoodTag | null>(null);
  const [quickContent, setQuickContent] = useState<string>('');
  const [todayDiaryId, setTodayDiaryId] = useState<string | null>(null);

  const fetchSummary = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await trackingApi.getDashboardSummary();
    } catch (error) {
      console.error('[HomeScreen] Failed to load dashboard summary:', error);
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
        setCurrentMood((latest.moodTag as MoodTag) ?? null);
        setTodayDiaryId(latest.id);
      } else {
        setCurrentMood(null);
        setTodayDiaryId(null);
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

  const handleMoodSelect = (mood: MoodTag): void => {
    if (todayDiaryId) return;
    setCurrentMood(mood);
    setPendingMood(mood);
    setQuickContent('');
  };

  const handleQuickSave = async (): Promise<void> => {
    if (!pendingMood) return;
    const content = quickContent.trim() || t(MOOD_CONTENT_KEY[pendingMood]);
    try {
      const todayStr = new Date().toISOString().slice(0, 10);
      const created = await diaryApi.createDiaryEntry({
        content,
        moodTag: pendingMood,
        positivityScore: getMoodScore(pendingMood),
        entryDate: todayStr,
      });
      setTodayDiaryId(created.id);
      setPendingMood(null);
      setQuickContent('');
    } catch {
      setCurrentMood(null);
      setPendingMood(null);
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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
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
                color={COLORS.whiteAlpha70}
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
                const isLocked = todayDiaryId !== null;
                return (
                  <Pressable
                    key={opt.value}
                    style={[
                      styles.moodChip,
                      isActive && { backgroundColor: `${opt.color}40`, borderColor: opt.color },
                      isLocked && !isActive && { opacity: 0.35 },
                    ]}
                    onPress={() => handleMoodSelect(opt.value)}
                    disabled={isLocked}
                  >
                    <MaterialCommunityIcons
                      name={isActive ? opt.activeIcon : opt.icon}
                      size={26}
                      color={isActive ? opt.color : COLORS.whiteAlpha55}
                    />
                  </Pressable>
                );
              })}
            </View>

            {pendingMood && !todayDiaryId && (
              <View style={styles.quickInputRow}>
                <TextInput
                  style={styles.quickInput}
                  placeholder={t(MOOD_CONTENT_KEY[pendingMood])}
                  placeholderTextColor={COLORS.whiteAlpha40}
                  value={quickContent}
                  onChangeText={setQuickContent}
                  onSubmitEditing={handleQuickSave}
                  returnKeyType="send"
                  maxLength={200}
                />
                <Pressable style={styles.quickSendBtn} onPress={handleQuickSave}>
                  <MaterialCommunityIcons name="send" size={18} color={COLORS.white} />
                </Pressable>
              </View>
            )}
          </View>
        </View>

        {/* ===== MAIN CONTENT ===== */}
        <View style={styles.paddedContent}>
          {/* Daily Logs */}
          <DailyLogsSection
            targetProfileId={userInfo?.profileId ?? ''}
            isOwnProfile={true}
          />

          {/* AI COMPANION */}
          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>
              {t('home.overview.aiChatbotTitle')}
            </AppText>
            <CompanionCard onPress={handleNavigateChatbot} />
          </View>

          {/* Group Sessions */}
          {/*
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
          */}

          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
