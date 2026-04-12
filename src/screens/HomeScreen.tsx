import React, { useCallback, useContext, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  RefreshControl,
  ScrollView,
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
} from 'react-native';
import { NavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';

import { DashboardSummary, getDashboardSummary } from '@/api';
import { AuthContext } from '@/context/AuthContext';
import { BORDER_RADIUS, FONT_SIZES, SPACING } from '@/theme';
import { COLORS } from '@/theme';
import { TrackingStackParamList } from '@/navigation';

type NavigationPropType = NavigationProp<TrackingStackParamList>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationPropType>();
  const { userInfo } = useContext(AuthContext)!;
  const { t } = useTranslation();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const getMoodDisplay = useMemo(() => (dominantMood: string): { emoji: string; text: string } => {
    switch (dominantMood?.toUpperCase()) {
      case 'SAD':
        return { emoji: '😢', text: t('home.moods.sad') };
      case 'HAPPY':
        return { emoji: '😊', text: t('home.moods.happy') };
      case 'ANXIOUS':
        return { emoji: '😟', text: t('home.moods.anxious') };
      case 'ANGRY':
        return { emoji: '😠', text: t('home.moods.angry') };
      default:
        return { emoji: '🙂', text: t('home.moods.neutral') };
    }
  }, [t]);

  const fetchSummary = useCallback(async (): Promise<void> => {
    setIsLoading(true);

    try {
      const data = await getDashboardSummary();
      setSummary(data);
    } catch (error) {
      console.error('[HomeScreen] Failed to load dashboard summary:', error);
      setSummary(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchSummary();
    }, [fetchSummary]),
  );

  const moodDisplay = useMemo(
    () => getMoodDisplay(summary?.dominantMood ?? ''),
    [summary?.dominantMood],
  );

  const handleNavigateSleep = (): void => {
    navigation.navigate('SleepOverview');
  };

  const handleNavigateDiary = (): void => {
    navigation.navigate('DiaryOverview');
  };

  const handleNavigateFood = (): void => {
    navigation.navigate('FoodOverview');
  };

  const handleNavigateChatbot = (): void => {
    navigation.navigate('TherapyOverview');
  };

  const today = new Date();
  const dateString = today.toLocaleDateString('vi-VN', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  });

  // const avatarUrl = userInfo?.avatar || 'https://via.placeholder.com/80';
  const avatarUrl = 'https://via.placeholder.com/80';
  const userName = userInfo?.fullName || 'Shinomiya';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchSummary} />
        }
        contentContainerStyle={styles.scrollContent}>
        {/* ===== HEADER SECTION ===== */}
        <View style={styles.headerContainer}>
          {/* Top Bar: Date & Notification */}
          <View style={styles.topBar}>
            <View style={styles.dateSection}>
              <MaterialCommunityIcons
                name="calendar-outline"
                size={16}
                color={COLORS.textSecondary}
              />
              <Text style={styles.dateText}>{dateString}</Text>
            </View>
            <Pressable style={styles.notificationButton}>
              <Feather name="bell" size={20} color={COLORS.textPrimary} />
              <View style={styles.notificationBadge} />
            </Pressable>
          </View>

          {/* User Profile Section */}
          <View style={styles.profileSection}>
            <Image
              source={{ uri: avatarUrl }}
              style={styles.profileAvatar}
              defaultSource={require('../assets/booking/placeholder.png')}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.greetingText}>Hi, {userName.split(' ').pop()}!</Text>
              <View style={styles.badgeContainer}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Thành viên</Text>
                </View>
                <View style={styles.badge}>
                  <MaterialCommunityIcons
                    name="star"
                    size={12}
                    color={COLORS.accentPositive}
                  />
                  <Text style={styles.badgeText}>Tích cực</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ===== HEALTH STATS CAROUSEL ===== */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Thống kê sức khỏe cảm xúc</Text>
            <Pressable>
              <Feather name="more-vertical" size={20} color={COLORS.textPrimary} />
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            contentContainerStyle={styles.carouselContainer}>
            {/* Emotion Score Card */}
            <View style={[styles.healthCard, styles.healthCardGreen]}>
              <View style={styles.cardLabelRow}>
                <Text style={styles.cardLabel}>Điểm cảm xúc</Text>
                <MaterialCommunityIcons
                  name="heart"
                  size={20}
                  color={COLORS.white}
                />
              </View>
              <View style={styles.scoreDisplay}>
                <Text style={styles.scoreValue}>{summary?.emotionScore ?? '--'}</Text>
                <Text style={styles.scoreLabel}>
                  {summary?.dominantMood ? moodDisplay.text : 'Đang cập nhật'}
                </Text>
              </View>
            </View>

            {/* Mood Card */}
            <View style={[styles.healthCard, styles.healthCardOrange]}>
              <Text style={styles.moodLabel}>Mood</Text>
              <View style={styles.moodFace}>
                <Text style={styles.moodFaceEmoji}>{moodDisplay.emoji}</Text>
              </View>
              <Text style={styles.moodText}>{moodDisplay.text}</Text>
            </View>
          </ScrollView>
        </View>

        {/* ===== DAILY LOGS SECTION (CRITICAL NAVIGATION HUB) ===== */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('home.overview.dailyLogsTitle')}</Text>
            <Pressable>
              <Feather name="more-vertical" size={20} color={COLORS.textPrimary} />
            </Pressable>
          </View>

          {/* Sleep Card */}
          <Pressable
            style={styles.logCard}
            onPress={handleNavigateSleep}
            android_ripple={{ color: 'rgba(0, 0, 0, 0.05)' }}>
            <View style={styles.logCardContent}>
              <View style={[styles.iconContainer, styles.iconPurple]}>
                <MaterialCommunityIcons
                  name="star-outline"
                  size={24}
                  color={COLORS.sleepHeaderPurple}
                />
              </View>
              <View style={styles.logCardText}>
                <Text style={styles.logCardTitle}>Chất lượng giấc mơ</Text>
                <Text style={styles.logCardSubtitle}>
                  {summary?.sleepQuality || t('home.overview.sleepQualityNoData')}
                </Text>
              </View>
            </View>
            <View style={styles.logCardRight}>
              <View style={styles.progressCircle}>
                <Text style={styles.progressValue}>{summary?.sleepScore || '--'}</Text>
              </View>
            </View>
          </Pressable>

          {/* Diary Card */}
          <Pressable
            style={styles.logCard}
            onPress={handleNavigateDiary}
            android_ripple={{ color: 'rgba(0, 0, 0, 0.05)' }}>
            <View style={styles.logCardContent}>
              <View style={[styles.iconContainer, styles.iconOrange]}>
                <Feather name="file-text" size={24} color={COLORS.accentNegative} />
              </View>
              <View style={styles.logCardText}>
                <Text style={styles.logCardTitle}>Góc tâm tư</Text>
                <Text style={styles.logCardSubtitle}>
                  {summary?.diaryStreak ? t('home.overview.diaryStreakFormat', {count: summary.diaryStreak}) : t('home.overview.diaryNoStreak')}
                </Text>
              </View>
            </View>
            <View style={styles.logCardRight}>
              <View style={styles.gridIndicator}>
                <View style={styles.gridRow}>
                  <View style={styles.gridCell} />
                  <View style={styles.gridCell} />
                  <View style={styles.gridCell} />
                </View>
                <View style={styles.gridRow}>
                  <View style={styles.gridCell} />
                  <View style={styles.gridCell} />
                  <View style={styles.gridCell} />
                </View>
                <View style={styles.gridRow}>
                  <View style={styles.gridCell} />
                  <View style={styles.gridCell} />
                  <View style={styles.gridCell} />
                </View>
              </View>
            </View>
          </Pressable>

          {/* Food Card */}
          <Pressable
            style={styles.logCard}
            onPress={handleNavigateFood}
            android_ripple={{ color: 'rgba(0, 0, 0, 0.05)' }}>
            <View style={styles.logCardContent}>
              <View style={[styles.iconContainer, styles.iconYellow]}>
                <MaterialCommunityIcons
                  name="lightbulb-outline"
                  size={24}
                  color="#FFC107"
                />
              </View>
              <View style={styles.logCardText}>
                <Text style={styles.logCardTitle}>Nhật ký dinh dưỡng</Text>
                <Text style={styles.logCardSubtitle}>
                  {summary?.foodStatus || t('home.overview.foodDiaryNoData')}
                </Text>
              </View>
            </View>
            <View style={styles.logCardRight}>
              <View style={styles.segmentedBar}>
                <View style={[styles.segment, styles.segmentFilled]} />
                <View style={[styles.segment, styles.segmentFilled]} />
                <View style={[styles.segment, styles.segmentFilled]} />
                <View style={[styles.segment, styles.segmentEmpty]} />
              </View>
            </View>
          </Pressable>
        </View>

        {/* ===== AI CHATBOT SECTION ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('home.overview.aiChatbotTitle')}</Text>
          
          {/* ĐỔI VIEW THÀNH PRESSABLE VÀ GẮN ONPRESS */}
          <Pressable 
            style={styles.chatbotCard}
            onPress={handleNavigateChatbot} 
          >
            <View style={styles.chatbotContent}>
              <View style={styles.robotIllustration}>
                <MaterialCommunityIcons
                  name="robot-outline"
                  size={80}
                  color={COLORS.white}
                />
              </View>
              <View style={styles.chatbotText}>
                <Text style={styles.chatbotNumber}>{summary?.totalAiSessions ?? 0}</Text>
                <Text style={styles.chatbotLabel}>lần tâm sự</Text>
                <View style={styles.chatbotMetaRow}>
                  <MaterialCommunityIcons
                    name="calendar-outline"
                    size={12}
                    color={COLORS.white}
                  />
                  <Text style={styles.chatbotMeta}>
                    {summary?.monthlyAiSessions ?? 0} cơn tâm tư này tháng
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.chatbotActions}>
              {/* GẮN ONPRESS VÀO NÚT CỘNG LUÔN */}
              <Pressable style={styles.actionButton} onPress={handleNavigateChatbot}>
                <MaterialCommunityIcons
                  name="plus"
                  size={24}
                  color={COLORS.accentPositive}
                />
              </Pressable>
              
              <Pressable style={styles.actionButton}>
                <MaterialCommunityIcons
                  name="cog-outline"
                  size={24}
                  color={COLORS.accentNegative}
                />
              </Pressable>
            </View>
          </Pressable>
        </View>

        {/* ===== GROUP SESSIONS SECTION ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Group Sessions this week</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            contentContainerStyle={styles.sessionsCarousel}>
            {/* Mental Health Session */}
            <Pressable style={styles.sessionCard}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=200&fit=crop',
                }}
                style={styles.sessionImage}
              />
              <View style={styles.sessionOverlay} />
              <View style={styles.sessionContent}>
                <Text style={styles.sessionTitle}>Anxiety & Stress</Text>
                <Text style={styles.sessionSubtitle}>Management</Text>
              </View>
            </Pressable>

            {/* Trauma Session */}
            <Pressable style={styles.sessionCard}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=200&fit=crop',
                }}
                style={styles.sessionImage}
              />
              <View style={styles.sessionOverlay} />
              <View style={styles.sessionContent}>
                <Text style={styles.sessionTitle}>Trauma & PTSD</Text>
                <Text style={styles.sessionSubtitle}>Recovery</Text>
              </View>
            </Pressable>
          </ScrollView>
        </View>

        {/* ===== RELATIONSHIP SESSIONS SECTION ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Relationship & Social Support</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            contentContainerStyle={styles.sessionsCarousel}>
            {/* Family Dynamics */}
            <Pressable style={styles.sessionCard}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=300&h=200&fit=crop',
                }}
                style={styles.sessionImage}
              />
              <View style={styles.sessionOverlay} />
              <View style={styles.sessionContent}>
                <Text style={styles.sessionTitle}>Family Dynamics &</Text>
                <Text style={styles.sessionSubtitle}>Healing</Text>
              </View>
            </Pressable>

            {/* Social Anxiety */}
            <Pressable style={styles.sessionCard}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=300&h=200&fit=crop',
                }}
                style={styles.sessionImage}
              />
              <View style={styles.sessionOverlay} />
              <View style={styles.sessionContent}>
                <Text style={styles.sessionTitle}>Social Anxiety &</Text>
                <Text style={styles.sessionSubtitle}>Building Confidence</Text>
              </View>
            </Pressable>
          </ScrollView>
        </View>

        {/* Bottom padding for tab bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: SPACING.screenHorizontal,
    paddingTop: SPACING.screenTop,
    paddingBottom: SPACING.xxl + 80,
  },

  /* ==== HEADER ==== */
  headerContainer: {
    marginBottom: SPACING.sectionGap,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  dateText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  notificationButton: {
    position: 'relative',
    width: SPACING.iconButtonSize,
    height: SPACING.iconButtonSize,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accentNegative,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  profileAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.border,
  },
  profileInfo: {
    flex: 1,
    paddingTop: SPACING.xs,
  },
  greetingText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.chip,
    gap: SPACING.xs,
  },
  badgeText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },

  /* ==== SECTIONS ==== */
  section: {
    marginBottom: SPACING.sectionGap,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  /* ==== CAROUSEL ==== */
  carouselContainer: {
    gap: SPACING.md,
    paddingRight: SPACING.screenHorizontal,
  },
  healthCard: {
    width: 160,
    borderRadius: BORDER_RADIUS.card,
    padding: SPACING.md,
    justifyContent: 'space-between',
  },
  healthCardGreen: {
    backgroundColor: COLORS.accentPositive,
  },
  healthCardOrange: {
    backgroundColor: COLORS.accentNegative,
  },
  cardLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cardLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.white,
  },
  scoreDisplay: {
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  scoreValue: {
    fontSize: 40,
    fontWeight: '700',
    color: COLORS.white,
  },
  scoreLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.white,
    marginTop: SPACING.xs,
  },
  moodLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: SPACING.sm,
  },
  moodFace: {
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  moodFaceEmoji: {
    fontSize: 50,
  },
  moodText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.white,
    textAlign: 'center',
  },

  /* ==== LOG CARDS ==== */
  logCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  logCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.md,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconPurple: {
    backgroundColor: '#EDD5FF',
  },
  iconOrange: {
    backgroundColor: '#FFE5CC',
  },
  iconYellow: {
    backgroundColor: '#FFF8DC',
  },
  logCardText: {
    flex: 1,
  },
  logCardTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  logCardSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  logCardRight: {
    alignItems: 'center',
  },

  /* Progress Circle */
  progressCircle: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 3,
    borderColor: COLORS.sleepHeaderPurple,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressValue: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.sleepHeaderPurple,
  },

  /* Grid Indicator */
  gridIndicator: {
    gap: 4,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 4,
  },
  gridCell: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: COLORS.accentNegative,
  },

  /* Segmented Bar */
  segmentedBar: {
    flexDirection: 'row',
    gap: 3,
  },
  segment: {
    width: 6,
    height: 20,
    borderRadius: 2,
  },
  segmentFilled: {
    backgroundColor: '#FFC107',
  },
  segmentEmpty: {
    backgroundColor: COLORS.border,
  },

  /* ==== CHATBOT CARD ==== */
  chatbotCard: {
    backgroundColor: '#2E1810',
    borderRadius: BORDER_RADIUS.card,
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatbotContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  robotIllustration: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.card,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatbotText: {
    flex: 1,
  },
  chatbotNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
  },
  chatbotLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.white,
    marginBottom: SPACING.sm,
  },
  chatbotMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  chatbotMeta: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.white,
  },
  chatbotActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* ==== SESSION CARDS ==== */
  sessionsCarousel: {
    gap: SPACING.md,
    paddingRight: SPACING.screenHorizontal,
  },
  sessionCard: {
    width: 180,
    height: 140,
    borderRadius: BORDER_RADIUS.card,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  sessionImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  sessionOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sessionContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.md,
  },
  sessionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.white,
  },
  sessionSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.white,
    marginTop: SPACING.xs,
  },

  /* ==== BOTTOM SPACER ==== */
  bottomSpacer: {
    height: SPACING.lg,
  },
});

export default HomeScreen;