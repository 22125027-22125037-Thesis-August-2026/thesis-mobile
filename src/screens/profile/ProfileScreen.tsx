import React, { useCallback, useContext, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Alert,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Pressable,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  useNavigation,
  NavigationProp,
  useFocusEffect,
} from '@react-navigation/native';
import {
  AppText,
  DailyTrackingTrophy,
  FocusModeToggle,
  TrophyShowcase,
  UserAvatar,
} from '@/components';
import {
  PRESET_AVATARS,
  resolveAvatar,
  toAvatarValue,
} from '@/constants';
import { AuthContext } from '@/context/AuthContext';
import { useTour } from '@/context/TourContext';
import { useTourTarget } from '@/components/tour';
import { TOUR_TARGETS, TourTargetKey } from '@/constants/tour';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '@/theme';
import { diaryApi, foodApi, sleepApi, stepsApi } from '@/api';
import {
  calculateLongestStreakFromCreatedAt,
  DailyTrackingStatus,
  getTodayTrackingStatus,
  seedCacheFromStatus,  // keeps profile in sync when it fetches fresher data
} from '@/utils';
import { RootStackParamList } from '@/navigation';
import { styles } from './ProfileScreen.styles';

const ProfileScreen: React.FC = () => {
  const authContext = useContext(AuthContext);
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { start: startTour, registerScroller } = useTour();
  const { height: windowHeight } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const scrollYRef = useRef(0);

  // Target cho tour (được giới thiệu sau khi tour chuyển sang tab Hồ sơ).
  const streakTrophyTarget = useTourTarget(TOUR_TARGETS.streakTrophy);
  const dailyTrophyTarget = useTourTarget(TOUR_TARGETS.dailyTrophy);
  const focusModeTarget = useTourTarget(TOUR_TARGETS.focusMode);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>): void => {
    scrollYRef.current = e.nativeEvent.contentOffset.y;
  };

  const [longestStreak, setLongestStreak] = useState<number>(0);
  const [trackingStatus, setTrackingStatus] = useState<DailyTrackingStatus>({
    count: 0,
    diary: false,
    nutrition: false,
    sleep: false,
    steps: false,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);

  const profileId = authContext?.userInfo?.profileId;

  const fetchAchievements = useCallback(async () => {
    if (!profileId) return;

    // No backend streak/achievement service — derive everything on the client
    // from the tracking logs, the same sources the home dashboard uses.
    const [diaryRes, foodRes, sleepRes, stepsRes] = await Promise.allSettled([
      diaryApi.getDiaryEntries(profileId),
      foodApi.getAllFoodLogs(profileId),
      sleepApi.getAllSleepLogs(profileId),
      stepsApi.getAllStepLogs(profileId),
    ]);

    const diaryEntries = diaryRes.status === 'fulfilled' ? diaryRes.value : [];
    const foodLogs = foodRes.status === 'fulfilled' ? foodRes.value : [];
    const sleepLogs = sleepRes.status === 'fulfilled' ? sleepRes.value : [];
    const stepLogs = stepsRes.status === 'fulfilled' ? stepsRes.value : [];

    setLongestStreak(calculateLongestStreakFromCreatedAt(diaryEntries));

    const todayStatus = getTodayTrackingStatus(diaryEntries, foodLogs, sleepLogs, stepLogs);
    setTrackingStatus(todayStatus);
    // Seed the popup cache with accurate server data so the celebration sheet
    // always shows the real trophy tier, not a session-relative count.
    seedCacheFromStatus(todayStatus);
  }, [profileId]);

  // Re-fetch every time the Profile tab comes into focus so trophies reflect
  // data logged in other tabs during the same session.
  useFocusEffect(
    useCallback(() => {
      void fetchAchievements();
    }, [fetchAchievements]),
  );

  // Khi tab Hồ sơ được focus, đăng ký scroller cho tour (màn đang focus sở hữu
  // scroller) để các bước cúp & chế độ tập trung cuộn được vào tầm nhìn.
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

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchAchievements();
    } finally {
      setRefreshing(false);
    }
  }, [fetchAchievements]);

  if (!authContext) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <AppText>{t('profile.errorLoadingProfile')}</AppText>
        </View>
      </SafeAreaView>
    );
  }

  const { userInfo, logout, updateProfile } = authContext;
  const fullName = userInfo?.fullName || 'Bạn';
  const email = userInfo?.email ?? '';
  const role = userInfo?.role ?? '';
  const currentAvatarKey =
    resolveAvatar(userInfo?.avatarUrl).type === 'preset'
      ? userInfo?.avatarUrl?.split(':')[1]
      : undefined;

  const handleSelectAvatar = async (key: string) => {
    setSavingAvatar(true);
    try {
      await updateProfile({ avatarUrl: toAvatarValue(key) });
      setAvatarModalVisible(false);
    } catch {
      Alert.alert(t('profile.errorLoadingProfile'), t('profile.avatarUpdateError'));
    } finally {
      setSavingAvatar(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t('profile.logoutConfirmTitle'),
      t('profile.logoutConfirmMessage'),
      [
        { text: t('profile.logoutConfirmCancel'), style: 'cancel' },
        { text: t('profile.logoutConfirmAction'), onPress: logout, style: 'destructive' },
      ],
    );
  };

  type MenuItem = {
    icon: string;
    title: string;
    subtitle: string;
    onPress?: () => void;
  };

  // Điều hướng về Home rồi chạy lại tour coach-mark từ đầu (force = bỏ qua cờ đã xem).
  const handleReplayTour = () => {
    navigation.navigate('MainTabs', { screen: 'HomeTab' });
    setTimeout(() => {
      void startTour(true);
    }, 450);
  };

  const supportMenuItems: MenuItem[] = [
    {
      icon: 'compass-outline',
      title: t('tour.replayMenuTitle'),
      subtitle: t('tour.replayMenuSub'),
      onPress: handleReplayTour,
    },
    {
      icon: 'lifebuoy',
      title: t('profile.menuHelp'),
      subtitle: t('profile.menuHelpSub'),
      onPress: () => navigation.navigate('FAQ'),
    },
    {
      icon: 'email-outline',
      title: t('profile.menuContact'),
      subtitle: t('profile.menuContactSub'),
      onPress: () => navigation.navigate('Contact'),
    },
    {
      icon: 'information-outline',
      title: t('profile.menuAbout'),
      subtitle: t('profile.menuAboutSub'),
      onPress: () => navigation.navigate('About'),
    },
  ];

  const renderMenuSection = (items: MenuItem[]) => (
    <View style={styles.menuCard}>
      {items.map((item, index) => (
        <Pressable
          key={item.title}
          style={({ pressed }) => [
            styles.menuRow,
            index === items.length - 1 && styles.menuRowLast,
            pressed && { opacity: 0.7 },
          ]}
          onPress={item.onPress}
        >
          <View style={styles.menuIconContainer}>
            <MaterialCommunityIcons name={item.icon} size={22} color={COLORS.primary} />
          </View>
          <View style={styles.menuTextBlock}>
            <AppText style={styles.menuTitle}>{item.title}</AppText>
            <AppText style={styles.menuSubtitle}>{item.subtitle}</AppText>
          </View>
          <MaterialCommunityIcons
            name="chevron-right"
            size={18}
            color={COLORS.textTertiary}
            style={styles.menuChevron}
          />
        </Pressable>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        ref={scrollRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* ===== HERO HEADER ===== */}
        <View style={styles.heroHeader}>
          <View style={styles.heroCircleLarge} />
          <View style={styles.heroCircleSmall} />
          <AppText style={styles.heroGreeting}>{t('profile.greeting')}</AppText>
          <AppText style={styles.heroTitle}>{t('profile.headerTitle')}</AppText>
        </View>

        {/* ===== AVATAR CARD ===== */}
        <View style={styles.avatarCard}>
          <Pressable
            style={({ pressed }) => [styles.avatarWrapper, pressed && { opacity: 0.85 }]}
            onPress={() => setAvatarModalVisible(true)}
          >
            <UserAvatar avatarUrl={userInfo?.avatarUrl} size={96} style={styles.avatar} />
            <View style={styles.avatarEditBadge}>
              <Feather name="edit-2" size={13} color={COLORS.white} />
            </View>
          </Pressable>

          <AppText style={styles.userName}>{fullName}</AppText>
          {!!email && <AppText style={styles.userEmail}>{email}</AppText>}
          {!!role && (
            <View style={styles.roleChip}>
              <AppText style={styles.roleChipText}>🌱 {role}</AppText>
            </View>
          )}
        </View>

        {/* ===== TROPHIES SECTION ===== */}
        <View style={styles.sectionBlock}>
          <AppText style={styles.sectionLabel}>
            {t('profile.sectionAchievements', { defaultValue: 'Achievements' })}
          </AppText>
          <View
            ref={streakTrophyTarget.ref}
            onLayout={streakTrophyTarget.onLayout}
            collapsable={false}
          >
            <TrophyShowcase longestCount={longestStreak} />
          </View>
          <View style={styles.trophySpacer} />
          <View
            ref={dailyTrophyTarget.ref}
            onLayout={dailyTrophyTarget.onLayout}
            collapsable={false}
          >
            <DailyTrackingTrophy status={trackingStatus} />
          </View>
        </View>

        {/* ===== SETTINGS SECTION ===== */}
        <View style={styles.sectionBlock}>
          <AppText style={styles.sectionLabel}>{t('profile.sectionSettings')}</AppText>
          <View
            ref={focusModeTarget.ref}
            onLayout={focusModeTarget.onLayout}
            collapsable={false}
            style={styles.menuCard}
          >
            <FocusModeToggle variant="row" />
          </View>
        </View>

        {/* ===== SUPPORT SECTION ===== */}
        <View style={styles.sectionBlock}>
          <AppText style={styles.sectionLabel}>{t('profile.sectionSupport')}</AppText>
          {renderMenuSection(supportMenuItems)}
        </View>

        {/* ===== LOGOUT ===== */}
        <View style={styles.logoutBlock}>
          <Pressable
            style={({ pressed }) => [styles.logoutRow, pressed && { opacity: 0.7 }]}
            onPress={handleLogout}
          >
            <Feather name="log-out" size={18} color={COLORS.accentNegative} />
            <AppText style={styles.logoutText}>{t('profile.logoutButton')}</AppText>
          </Pressable>
        </View>

        {/* ===== FOOTER ===== */}
        <View style={styles.footer}>
          <AppText style={styles.footerText}>{t('profile.appVersionFooter')}</AppText>
        </View>
      </ScrollView>

      {/* ===== AVATAR PICKER MODAL ===== */}
      <Modal
        visible={avatarModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAvatarModalVisible(false)}
      >
        <Pressable
          style={styles.avatarModalOverlay}
          onPress={() => !savingAvatar && setAvatarModalVisible(false)}
        >
          <Pressable style={styles.avatarModalCard}>
            <AppText style={styles.avatarModalTitle}>
              {t('profile.changeAvatarTitle')}
            </AppText>
            <View style={styles.avatarModalGrid}>
              {PRESET_AVATARS.map(avatar => {
                const isSelected = currentAvatarKey === avatar.key;
                return (
                  <Pressable
                    key={avatar.key}
                    disabled={savingAvatar}
                    onPress={() => handleSelectAvatar(avatar.key)}
                    style={({ pressed }) => [
                      styles.avatarModalOption,
                      isSelected && styles.avatarModalOptionSelected,
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <UserAvatar avatarUrl={toAvatarValue(avatar.key)} size={58} />
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

export default ProfileScreen;
