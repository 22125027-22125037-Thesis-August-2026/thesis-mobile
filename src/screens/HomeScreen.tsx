import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  RefreshControl,
  ScrollView,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';

import { AppText, UserAvatar } from '@/components';
import { useTourTarget } from '@/components/tour';
import {
  FindTherapistCta,
  LowMoodPromptSheet,
  MeditationCarousel,
  MiniDashboardsSection,
  MoodCheckInCard,
} from '@/components/home';
import { MoodTag } from '@/constants';
import { TOUR_TARGETS, TourTargetKey } from '@/constants/tour';
import { AuthContext } from '@/context/AuthContext';
import { useTour } from '@/context/TourContext';
import { useHomeDashboardData } from '@/hooks/useHomeDashboardData';
import { COLORS } from '@/theme';
import { RootStackParamList } from '@/navigation';
import LogoMark from '@/assets/logo/LogoMark';
import { styles } from './HomeScreen.styles';

type NavigationPropType = NavigationProp<RootStackParamList>;

// Anti-nag rate-limit: surface the low-mood safety net at most once per 6h.
const LOW_MOOD_PROMPT_KEY = '@low_mood_prompt_last_shown';
const LOW_MOOD_COOLDOWN_MS = 6 * 60 * 60 * 1000;

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
  const dashboard = useHomeDashboardData(userInfo?.profileId);
  const [lowMoodVisible, setLowMoodVisible] = useState(false);

  // ─── Tour coach-mark ────────────────────────────────────────────────────────
  const { height: windowHeight } = useWindowDimensions();
  const { start: startTour, registerScroller } = useTour();
  const scrollRef = useRef<ScrollView>(null);
  const scrollYRef = useRef(0);
  const hasAutoStartedRef = useRef(false);

  const moodTarget = useTourTarget(TOUR_TARGETS.mood);
  const dashboardsTarget = useTourTarget(TOUR_TARGETS.dashboards);
  const meditationTarget = useTourTarget(TOUR_TARGETS.meditation);
  const companionTarget = useTourTarget(TOUR_TARGETS.companion);
  const findTherapistTarget = useTourTarget(TOUR_TARGETS.findTherapist);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>): void => {
    scrollYRef.current = e.nativeEvent.contentOffset.y;
  };

  // Cuộn một target bất kỳ (kể cả thẻ con trong khu theo dõi) vào tầm nhìn
  // trước khi tour đo vị trí. Dùng hàm measure do context cung cấp nên không
  // cần giữ ref của từng target tại đây. Đăng ký theo focus để màn đang hiển
  // thị sở hữu scroller (tránh tranh chấp với màn Hồ sơ khi tour chuyển tab).
  useFocusEffect(
    useCallback(() => {
      const scrollIntoView = async (
        _key: TourTargetKey,
        measure?: () => Promise<{ y: number } | null>,
      ): Promise<void> => {
        if (!measure) {
          return;
        }
        const rect = await measure();
        if (!rect) {
          return;
        }
        const desiredY = windowHeight * 0.26;
        const delta = rect.y - desiredY;
        if (Math.abs(delta) < 8) {
          return;
        }
        const newOffset = Math.max(0, scrollYRef.current + delta);
        // Cuộn tức thì (không animated) để đo vị trí chính xác ngay, tránh
        // trường hợp animation chưa dừng làm spotlight lệch.
        scrollRef.current?.scrollTo({ y: newOffset, animated: false });
        scrollYRef.current = newOffset;
      };

      registerScroller(scrollIntoView);
      return () => registerScroller(null);
    }, [registerScroller, windowHeight]),
  );

  // Tự bật tour 1 lần cho người dùng teen mới (start() tự kiểm tra cờ đã xem).
  useEffect(() => {
    if (hasAutoStartedRef.current) {
      return;
    }
    const role = userInfo?.role;
    if (role && role !== 'TEEN') {
      return;
    }
    hasAutoStartedRef.current = true;
    const timer = setTimeout(() => {
      void startTour();
    }, 700);
    return () => clearTimeout(timer);
  }, [startTour, userInfo?.role]);

  useFocusEffect(
    useCallback(() => {
      void dashboard.refetch();
    }, [dashboard.refetch]),
  );

  const handleMoodSaved = async (saved?: {
    moodTag: MoodTag;
    score: number;
  }): Promise<void> => {
    void dashboard.refetch();
    if (!saved || (saved.moodTag !== 'TERRIBLE' && saved.moodTag !== 'BAD')) {
      return;
    }
    try {
      const lastShownRaw = await AsyncStorage.getItem(LOW_MOOD_PROMPT_KEY);
      const lastShown = lastShownRaw ? Number(lastShownRaw) : 0;
      if (Date.now() - lastShown < LOW_MOOD_COOLDOWN_MS) {
        return;
      }
      await AsyncStorage.setItem(LOW_MOOD_PROMPT_KEY, String(Date.now()));
    } catch {
      // If storage fails, still surface the safety net rather than swallow it.
    }
    setLowMoodVisible(true);
  };

  const handleNavigateChatbot = (): void => {
    navigation.navigate('Chat');
  };

  const today = new Date();
  const dateString = today.toLocaleDateString('vi-VN', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  });

  const userName = userInfo?.fullName || 'Bạn';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        ref={scrollRef}
        onScroll={handleScroll}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={dashboard.isLoading}
            onRefresh={dashboard.refetch}
          />
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
            <Pressable
              style={styles.notificationButton}
              onPress={() => navigation.navigate('Notification')}
            >
              <Feather name="bell" size={20} color={COLORS.white} />
              <View style={styles.notificationBadge} />
            </Pressable>
          </View>

          {/* Greeting + avatar */}
          <View style={styles.profileSection}>
            <UserAvatar
              avatarUrl={userInfo?.avatarUrl}
              size={56}
              style={styles.profileAvatar}
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
        </View>

        {/* ===== MOOD CHECK-IN — overlaps hero ===== */}
        <View
          ref={moodTarget.ref}
          onLayout={moodTarget.onLayout}
          collapsable={false}
          style={styles.moodOverlap}
        >
          <MoodCheckInCard
            onMoodSaved={saved => void handleMoodSaved(saved)}
          />
        </View>

        {/* ===== MAIN CONTENT ===== */}
        <View
          ref={dashboardsTarget.ref}
          onLayout={dashboardsTarget.onLayout}
          collapsable={false}
          style={styles.paddedContent}
        >
          <MiniDashboardsSection data={dashboard} />
        </View>

        <View
          ref={meditationTarget.ref}
          onLayout={meditationTarget.onLayout}
          collapsable={false}
        >
          <MeditationCarousel />
        </View>

        <View style={styles.paddedContent}>
          {/* AI COMPANION */}
          <View
            ref={companionTarget.ref}
            onLayout={companionTarget.onLayout}
            collapsable={false}
            style={styles.companionSection}
          >
            <AppText style={styles.sectionTitle}>
              {t('home.overview.aiChatbotTitle')}
            </AppText>
            <CompanionCard onPress={handleNavigateChatbot} />
          </View>

          <View
            ref={findTherapistTarget.ref}
            onLayout={findTherapistTarget.onLayout}
            collapsable={false}
          >
            <FindTherapistCta />
          </View>

          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>

      <LowMoodPromptSheet
        visible={lowMoodVisible}
        onClose={() => setLowMoodVisible(false)}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;
