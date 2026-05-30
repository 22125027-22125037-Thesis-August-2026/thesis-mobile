import React, { useContext, useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Image,
  Alert,
  ScrollView,
  Pressable,
  RefreshControl,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { AppText, TrophyShowcase } from '@/components';
import { AuthContext } from '@/context/AuthContext';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '@/theme';
import { trackingApi } from '@/api';
import { RootStackParamList } from '@/navigation';
import { styles } from './ProfileScreen.styles';

const PLACEHOLDER = require('../../assets/booking/placeholder.png');

const ProfileScreen: React.FC = () => {
  const authContext = useContext(AuthContext);
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [longestStreak, setLongestStreak] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;

    trackingApi
      .getStreak()
      .then(streak => {
        if (isMounted) {
          setLongestStreak(streak.longestCount ?? 0);
        }
      })
      .catch(error => {
        console.warn('[ProfileScreen] Failed to load streak:', error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!authContext) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <AppText>{t('profile.errorLoadingProfile')}</AppText>
        </View>
      </SafeAreaView>
    );
  }

  const { userInfo, logout } = authContext;
  const fullName = userInfo?.fullName || 'Bạn';
  const email = userInfo?.email ?? '';
  const role = userInfo?.role ?? '';
  const avatarSource = userInfo?.avatarUrl
    ? { uri: userInfo.avatarUrl }
    : PLACEHOLDER;

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

  const wip = () =>
    Alert.alert('Sắp ra mắt', 'Tính năng này đang được phát triển 💚');

  const accountMenuItems: MenuItem[] = [
    {
      icon: 'bell-outline',
      title: t('profile.menuNotifications'),
      subtitle: t('profile.menuNotificationsSub'),
      onPress: wip,
    },
    {
      icon: 'shield-check-outline',
      title: t('profile.menuPrivacy'),
      subtitle: t('profile.menuPrivacySub'),
      onPress: wip,
    },
    {
      icon: 'translate',
      title: t('profile.menuLanguage'),
      subtitle: 'Tiếng Việt',
      onPress: wip,
    },
    {
      icon: 'theme-light-dark',
      title: t('profile.menuTheme'),
      subtitle: t('profile.menuThemeSub'),
      onPress: wip,
    },
  ];

  const supportMenuItems: MenuItem[] = [
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
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => { /* TODO: wire refreshUser */ }}
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
          <View style={styles.avatarWrapper}>
            <Image
              source={avatarSource}
              style={styles.avatar}
              defaultSource={PLACEHOLDER}
            />
          </View>

          <AppText style={styles.userName}>{fullName}</AppText>
          {!!email && <AppText style={styles.userEmail}>{email}</AppText>}
          {!!role && (
            <View style={styles.roleChip}>
              <AppText style={styles.roleChipText}>🌱 {role}</AppText>
            </View>
          )}

          {/* CTA */}
          <View style={styles.ctaWrapper}>
            <Pressable
              style={({ pressed }) => [styles.ctaPill, pressed && { opacity: 0.85 }]}
              onPress={() => navigation.navigate('ProfileEdit')}
            >
              <Feather name="edit-2" size={14} color={COLORS.white} />
              <AppText style={styles.ctaPillText}>{t('profile.menuPersonalInfo')}</AppText>
            </Pressable>
          </View>
        </View>

        {/* ===== TROPHIES SECTION ===== */}
        <View style={styles.sectionBlock}>
          <AppText style={styles.sectionLabel}>
            {t('profile.sectionAchievements', { defaultValue: 'Achievements' })}
          </AppText>
          <TrophyShowcase longestCount={longestStreak} />
        </View>

        {/* ===== SETTINGS SECTION ===== */}
        <View style={styles.sectionBlock}>
          <AppText style={styles.sectionLabel}>{t('profile.sectionSettings')}</AppText>
          {renderMenuSection(accountMenuItems)}
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
    </SafeAreaView>
  );
};

export default ProfileScreen;
