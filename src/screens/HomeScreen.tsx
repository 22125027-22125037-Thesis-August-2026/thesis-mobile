import React, { useCallback, useContext, useEffect, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Animated,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
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

import { AppText } from '@/components';
import {
  FindTherapistCta,
  MeditationCarousel,
  MiniDashboardsSection,
  MoodCheckInCard,
} from '@/components/home';
import { AuthContext } from '@/context/AuthContext';
import { useHomeDashboardData } from '@/hooks/useHomeDashboardData';
import { COLORS } from '@/theme';
import { RootStackParamList } from '@/navigation';
import LogoMark from '@/assets/logo/LogoMark';
import { styles } from './HomeScreen.styles';

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
  const dashboard = useHomeDashboardData(userInfo?.profileId);

  useFocusEffect(
    useCallback(() => {
      void dashboard.refetch();
    }, [dashboard.refetch]),
  );

  const handleNavigateChatbot = (): void => {
    navigation.navigate('Chat');
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
        </View>

        {/* ===== MOOD CHECK-IN — overlaps hero ===== */}
        <View style={styles.moodOverlap}>
          <MoodCheckInCard onMoodSaved={() => void dashboard.refetch()} />
        </View>

        {/* ===== MAIN CONTENT ===== */}
        <View style={styles.paddedContent}>
          <MiniDashboardsSection data={dashboard} />
        </View>

        <MeditationCarousel />

        <View style={styles.paddedContent}>
          {/* AI COMPANION */}
          <View style={styles.companionSection}>
            <AppText style={styles.sectionTitle}>
              {t('home.overview.aiChatbotTitle')}
            </AppText>
            <CompanionCard onPress={handleNavigateChatbot} />
          </View>

          <FindTherapistCta />

          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
