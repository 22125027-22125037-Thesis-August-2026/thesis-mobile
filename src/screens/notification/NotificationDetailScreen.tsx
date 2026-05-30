import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';

import { AppText } from '@/components';
import { notificationApi } from '@/api';
import {
  NotificationItem,
  NotificationType,
} from '@/api/notificationApi';
import { RootStackParamList } from '@/navigation';
import { COLORS } from '@/theme';

import { NOTIFICATION_TYPE_THEME } from './notificationTheme';
import { styles } from './NotificationDetailScreen.styles';

type DetailRoute = RouteProp<RootStackParamList, 'NotificationDetail'>;
type Nav = NavigationProp<RootStackParamList>;

interface TypeCopy {
  ctaLabel: string;
  ctaIcon: string;
}

// TODO(design): replace each branch's hero illustration + body copy + CTA
// behavior with the per-type designs (Claude Design output will go here).
const TYPE_COPY: Record<NotificationType, TypeCopy> = {
  STREAK: {
    ctaLabel: 'Xem nhật ký',
    ctaIcon: 'book-open-page-variant',
  },
  BOOKING: {
    ctaLabel: 'Xem lịch hẹn',
    ctaIcon: 'calendar-check',
  },
  INSIGHT: {
    ctaLabel: 'Xem chi tiết',
    ctaIcon: 'chart-bar',
  },
  CHAT: {
    ctaLabel: 'Mở tin nhắn',
    ctaIcon: 'message-text',
  },
  REMINDER: {
    ctaLabel: 'Bắt đầu ngay',
    ctaIcon: 'arrow-right',
  },
};

const NotificationDetailScreen: React.FC = () => {
  const route = useRoute<DetailRoute>();
  const navigation = useNavigation<Nav>();
  const { notificationId } = route.params;

  const [notification, setNotification] = useState<NotificationItem | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;

    const load = async (): Promise<void> => {
      // TODO(backend): GET /notifications/:id — should also auto-mark as read.
      const item = await notificationApi.getNotificationById(notificationId);
      if (cancelled) return;
      setNotification(item ?? null);
      setIsLoading(false);

      if (item && !item.read) {
        await notificationApi.markAsRead(item.notificationId);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [notificationId]);

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: COLORS.background }]}
        edges={['top']}
      >
        <View style={styles.centerFiller}>
          <ActivityIndicator color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!notification) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: COLORS.background }]}
        edges={['top']}
      >
        <View style={styles.header}>
          <Pressable
            style={styles.iconButton}
            onPress={() => navigation.goBack()}
          >
            <Feather name="chevron-left" size={22} color={COLORS.text} />
          </Pressable>
          <View />
        </View>
        <View style={styles.centerFiller}>
          <MaterialCommunityIcons
            name="bell-off-outline"
            size={36}
            color={COLORS.textTertiary}
          />
          <AppText style={styles.errorText}>
            Không tìm thấy thông báo này
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  const theme = NOTIFICATION_TYPE_THEME[notification.type];
  const copy = TYPE_COPY[notification.type];

  const handleCta = (): void => {
    if (notification.type === 'BOOKING') {
      navigation.navigate('MainTabs', { screen: 'TherapistTab' });
      return;
    }
    // TODO(design): each type should deep-link to the matching feature.
    //   STREAK   → DiaryOverview / streak screen
    //   INSIGHT  → analytics screen for the topic
    //   CHAT     → Chat (sessionId-aware) / MessageList
    //   REMINDER → the activity being reminded (meditation, mood update, …)
    navigation.goBack();
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.bg }]}
      edges={['top']}
    >
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        <View style={styles.header}>
          <Pressable
            style={styles.iconButton}
            onPress={() => navigation.goBack()}
            hitSlop={8}
          >
            <Feather name="chevron-left" size={22} color={COLORS.text} />
          </Pressable>
          <View />
        </View>

        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            {/* TODO(design): replace with per-type illustration. */}
            <View
              style={[
                styles.heroIllustrationPlaceholder,
                { backgroundColor: theme.surface },
              ]}
            >
              <MaterialCommunityIcons
                name={theme.icon}
                size={96}
                color={COLORS.white}
              />
            </View>
          </View>

          <View style={styles.card}>
            <AppText style={styles.title}>{notification.title}</AppText>
            <AppText style={styles.subtitle}>{theme.label}</AppText>
            <AppText style={styles.body}>{notification.message}</AppText>

            <Pressable
              style={[styles.cta, { backgroundColor: theme.surface }]}
              onPress={handleCta}
            >
              <AppText style={styles.ctaText}>{copy.ctaLabel}</AppText>
              <MaterialCommunityIcons
                name={copy.ctaIcon}
                size={18}
                color={COLORS.white}
              />
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default NotificationDetailScreen;
