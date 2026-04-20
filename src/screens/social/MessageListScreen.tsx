import React, { useCallback, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { RootStackParamList } from '@/navigation';
import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from '@/theme';

type RootNavigation = NavigationProp<RootStackParamList>;
type TabType = 'friends' | 'requests';

type MessageListItem = {
  id: string;
  channelId: string;
  recipientName: string;
  channelType: 'DIRECT_FRIEND' | 'THERAPIST_CONSULT';
  preview: string;
  avatarUrl: string;
};

const MOCK_CONVERSATIONS: MessageListItem[] = [
  {
    id: 'friend-1',
    channelId: '6b57b349-9394-4868-b01f-f4e2dbd0f50e',
    recipientName: 'Ojogbon',
    channelType: 'DIRECT_FRIEND',
    preview: 'Ban cua ban dang tuot mood duoc 1 tuan roi, ban co muon hoi tham khong...',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
  },
  {
    id: 'friend-2',
    channelId: '1db24de3-9cc7-4b40-ab72-6eff97baecb3',
    recipientName: 'Sister lee',
    channelType: 'THERAPIST_CONSULT',
    preview: 'Hom nay la ngay thu 7 ban ay it online, hay gui mot loi nhan nhe nhang nhe.',
    avatarUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop',
  },
  {
    id: 'friend-3',
    channelId: '1f4bbfac-cb15-4cc0-b539-9f7352394472',
    recipientName: 'Abdul q',
    channelType: 'DIRECT_FRIEND',
    preview: 'Mood check-in cho thay ban cua ban dang xuong tam trang nhe. Thu hoi tham xem sao?',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop',
  },
  {
    id: 'friend-4',
    channelId: '0eeac4dd-f86b-41d2-a8c1-bc5eca0ecf8b',
    recipientName: 'Lan Anh',
    channelType: 'DIRECT_FRIEND',
    preview: 'Ban ay vua cap nhat trang thai buon, co the can mot cuoc tro chuyen ngan.',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
  },
];

const MessageListScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigation>();
  const [activeTab, setActiveTab] = useState<TabType>('friends');

  const conversations = useMemo(() => {
    if (activeTab === 'requests') {
      return MOCK_CONVERSATIONS.slice(0, 2);
    }

    return MOCK_CONVERSATIONS;
  }, [activeTab]);

  const handleGoBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('Home');
  }, [navigation]);

  const handleOpenConversation = useCallback(
    (item: MessageListItem) => {
      navigation.navigate('SocialChat', {
        channelId: item.channelId,
        recipientName: item.recipientName,
        channelType: item.channelType,
      });
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: MessageListItem }) => (
      <TouchableOpacity style={styles.card} onPress={() => handleOpenConversation(item)} activeOpacity={0.85}>
        <View style={styles.avatarWrap}>
          <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
          <View style={styles.alertBadge}>
            <MaterialCommunityIcons
              name="emoticon-sad-outline"
              size={14}
              color={COLORS.white}
            />
          </View>
        </View>

        <View style={styles.messageContent}>
          <Text style={styles.nameText} numberOfLines={1}>
            {item.recipientName}
          </Text>
          <Text style={styles.previewText} numberOfLines={2}>
            {item.preview}
          </Text>
        </View>

        <TouchableOpacity style={styles.menuButton} activeOpacity={0.7}>
          <MaterialCommunityIcons name="dots-horizontal" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </TouchableOpacity>
    ),
    [handleOpenConversation],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.headerShell}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack} activeOpacity={0.85}>
            <MaterialCommunityIcons name="chevron-left" size={22} color={COLORS.white} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Nhan tin</Text>

          <View style={styles.segmentedControl}>
            <TouchableOpacity
              style={[styles.segmentItem, activeTab === 'friends' && styles.segmentItemActive]}
              onPress={() => setActiveTab('friends')}
              activeOpacity={0.85}>
              <Text style={[styles.segmentText, activeTab === 'friends' && styles.segmentTextActive]}>
                Ban be (7)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.segmentItem, activeTab === 'requests' && styles.segmentItemActive]}
              onPress={() => setActiveTab('requests')}
              activeOpacity={0.85}>
              <Text style={[styles.segmentText, activeTab === 'requests' && styles.segmentTextActive]}>
                Loi moi ket ban
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.addFriendsButton} activeOpacity={0.85}>
            <Text style={styles.addFriendsText}>Add Friends</Text>
            <View style={styles.addIconWrap}>
              <MaterialCommunityIcons name="plus" size={16} color={COLORS.accentPositive} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.listShell}>
          <TouchableOpacity style={styles.filterButton} activeOpacity={0.85}>
            <MaterialCommunityIcons
              name="calendar-month-outline"
              size={14}
              color={COLORS.textPrimary}
            />
            <Text style={styles.filterText}>Moi nhat</Text>
            <MaterialCommunityIcons name="chevron-down" size={14} color={COLORS.textPrimary} />
          </TouchableOpacity>

          <FlatList
            data={conversations}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.accentNegative,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerShell: {
    backgroundColor: COLORS.accentNegative,
    paddingTop: SPACING.sm,
    paddingHorizontal: SPACING.screenHorizontal,
    paddingBottom: SPACING.lg,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.white,
  },
  segmentedControl: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.pill,
    padding: SPACING.xs,
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  segmentItem: {
    flex: 1,
    borderRadius: BORDER_RADIUS.pill,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentItemActive: {
    backgroundColor: COLORS.accentPositive,
  },
  segmentText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  segmentTextActive: {
    color: COLORS.white,
  },
  addFriendsButton: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.accentPositive,
    borderRadius: BORDER_RADIUS.pill,
    minHeight: 50,
    paddingHorizontal: SPACING.md,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  addFriendsText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  addIconWrap: {
    width: 30,
    height: 30,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listShell: {
    flex: 1,
    paddingTop: SPACING.md,
    paddingHorizontal: SPACING.screenHorizontal,
    backgroundColor: COLORS.background,
  },
  filterButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.surface,
  },
  filterText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  listContent: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xxl,
    gap: SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: COLORS.shadowBase,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarWrap: {
    position: 'relative',
    marginRight: SPACING.sm,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.border,
  },
  alertBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 22,
    height: 22,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.accentNegative,
    borderWidth: 2,
    borderColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageContent: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  nameText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  previewText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 19,
  },
  menuButton: {
    padding: SPACING.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MessageListScreen;
