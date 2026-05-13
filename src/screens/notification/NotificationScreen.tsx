import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  FlatList,
  ListRenderItem,
  Modal,
  Pressable,
  RefreshControl,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
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
import { styles } from './NotificationScreen.styles';

type NotificationSectionKey = 'today' | 'earlier';

type DisplayItem =
  | {
      kind: 'section';
      key: NotificationSectionKey;
      label: string;
      count: number;
    }
  | { kind: 'item'; data: NotificationItem };

const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const formatRelativeTime = (createdAt: string): string => {
  const created = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'Vừa xong';
  if (diffMin < 60) return `${diffMin} phút trước`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24 && isSameDay(created, now)) {
    return `${diffHour} giờ trước`;
  }

  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay} ngày trước`;

  return created.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
  });
};

const parseProgressBadge = (message: string): string | null => {
  const match = message.match(/^(\d+\/\d+)/);
  return match ? match[1] : null;
};

const NotificationIcon: React.FC<{ type: NotificationType }> = ({ type }) => {
  const theme = NOTIFICATION_TYPE_THEME[type];
  return (
    <View style={[styles.iconWrap, { backgroundColor: theme.bg }]}>
      <MaterialCommunityIcons name={theme.icon} size={22} color={theme.fg} />
    </View>
  );
};

const NotificationScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [menuTargetId, setMenuTargetId] = useState<string | null>(null);

  // TODO(backend): swap fetch + subscribe for whatever pattern the real API
  // exposes (websocket push, polling, etc.). For now we read from the in-memory
  // mock store and subscribe to its change events.
  const loadNotifications = useCallback(async (): Promise<void> => {
    const data = await notificationApi.getNotifications();
    setNotifications(data);
  }, []);

  useEffect(() => {
    void loadNotifications();
    const unsubscribe = notificationApi.subscribe(() => {
      void loadNotifications();
    });
    return unsubscribe;
  }, [loadNotifications]);

  useFocusEffect(
    useCallback(() => {
      void loadNotifications();
    }, [loadNotifications]),
  );

  const handleRefresh = useCallback(async (): Promise<void> => {
    setIsRefreshing(true);
    try {
      await loadNotifications();
    } finally {
      setIsRefreshing(false);
    }
  }, [loadNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter(n => !n.read).length,
    [notifications],
  );

  const displayItems = useMemo<DisplayItem[]>(() => {
    const today = new Date();
    const todayItems: NotificationItem[] = [];
    const earlierItems: NotificationItem[] = [];

    notifications.forEach(item => {
      if (isSameDay(new Date(item.createdAt), today)) {
        todayItems.push(item);
      } else {
        earlierItems.push(item);
      }
    });

    const list: DisplayItem[] = [];
    if (todayItems.length > 0) {
      list.push({
        kind: 'section',
        key: 'today',
        label: 'Hôm nay',
        count: todayItems.length,
      });
      todayItems.forEach(data => list.push({ kind: 'item', data }));
    }
    if (earlierItems.length > 0) {
      list.push({
        kind: 'section',
        key: 'earlier',
        label: 'Tuần trước',
        count: earlierItems.length,
      });
      earlierItems.forEach(data => list.push({ kind: 'item', data }));
    }
    return list;
  }, [notifications]);

  const handleOpenNotification = useCallback(
    async (item: NotificationItem): Promise<void> => {
      // Tap → mark read (if needed) then navigate to detail.
      // TODO(backend): the real API may want a single "open" call that does both.
      if (!item.read) {
        await notificationApi.markAsRead(item.notificationId);
      }
      navigation.navigate('NotificationDetail', {
        notificationId: item.notificationId,
      });
    },
    [navigation],
  );

  const menuTarget = useMemo(
    () => notifications.find(n => n.notificationId === menuTargetId) ?? null,
    [menuTargetId, notifications],
  );

  const closeMenu = (): void => setMenuTargetId(null);

  const handleMarkUnread = async (): Promise<void> => {
    if (!menuTarget) return;
    const id = menuTarget.notificationId;
    closeMenu();
    await notificationApi.markAsUnread(id);
  };

  const handleDelete = async (): Promise<void> => {
    if (!menuTarget) return;
    const id = menuTarget.notificationId;
    closeMenu();
    await notificationApi.deleteNotification(id);
  };

  const renderCard = (item: NotificationItem) => {
    const progress = parseProgressBadge(item.message);
    const cleanMessage = progress
      ? item.message.replace(progress, '').trim()
      : item.message;

    return (
      <Pressable
        style={[styles.card, !item.read && styles.cardUnread]}
        android_ripple={{ color: COLORS.rippleDarkSoft }}
        onPress={() => void handleOpenNotification(item)}
      >
        <NotificationIcon type={item.type} />
        <View style={styles.cardBody}>
          <AppText style={styles.cardTitle} numberOfLines={1}>
            {item.title}
          </AppText>
          <AppText style={styles.cardMessage} numberOfLines={2}>
            {cleanMessage}
          </AppText>
        </View>
        <View style={styles.cardRight}>
          {progress ? (
            <View style={styles.badgeProgress}>
              <AppText style={styles.badgeProgressText}>{progress}</AppText>
            </View>
          ) : !item.read ? (
            <View style={styles.unreadDot} />
          ) : (
            <Pressable
              style={styles.menuButton}
              hitSlop={8}
              onPress={() => setMenuTargetId(item.notificationId)}
            >
              <MaterialCommunityIcons
                name="dots-vertical"
                size={18}
                color={COLORS.textTertiary}
              />
            </Pressable>
          )}
          <AppText style={styles.cardTime}>
            {formatRelativeTime(item.createdAt)}
          </AppText>
        </View>
      </Pressable>
    );
  };

  const renderItem: ListRenderItem<DisplayItem> = ({ item }) => {
    if (item.kind === 'section') {
      return (
        <View style={styles.sectionHeader}>
          <AppText style={styles.sectionTitle}>{item.label}</AppText>
        </View>
      );
    }
    return renderCard(item.data);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            hitSlop={8}
          >
            <Feather name="chevron-left" size={22} color={COLORS.text} />
          </Pressable>

          <View style={styles.titleWrap}>
            <AppText style={styles.title}>Thông báo</AppText>
            {unreadCount > 0 && (
              <View style={styles.countPill}>
                <AppText style={styles.countPillText}>+{unreadCount}</AppText>
              </View>
            )}
          </View>
        </View>

        <FlatList
          data={displayItems}
          keyExtractor={item =>
            item.kind === 'section'
              ? `section-${item.key}`
              : item.data.notificationId
          }
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <MaterialCommunityIcons
                name="bell-off-outline"
                size={36}
                color={COLORS.textTertiary}
              />
              <AppText style={styles.emptyText}>Chưa có thông báo nào</AppText>
            </View>
          }
        />

        <Modal
          visible={menuTarget !== null}
          transparent
          animationType="fade"
          onRequestClose={closeMenu}
        >
          <Pressable style={styles.sheetBackdrop} onPress={closeMenu}>
            <Pressable
              style={styles.sheetContainer}
              onPress={e => e.stopPropagation()}
            >
              <View style={styles.sheetHandle} />

              <TouchableOpacity
                style={styles.sheetItem}
                onPress={() => void handleMarkUnread()}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name="email-mark-as-unread"
                  size={22}
                  color={COLORS.text}
                />
                <AppText style={styles.sheetItemText}>
                  Đánh dấu chưa đọc
                </AppText>
              </TouchableOpacity>

              <View style={styles.sheetDivider} />

              <TouchableOpacity
                style={styles.sheetItem}
                onPress={() => void handleDelete()}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name="trash-can-outline"
                  size={22}
                  color={COLORS.errorText}
                />
                <AppText
                  style={[styles.sheetItemText, styles.sheetItemDestructive]}
                >
                  Xóa thông báo
                </AppText>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default NotificationScreen;
