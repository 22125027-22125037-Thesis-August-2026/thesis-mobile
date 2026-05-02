import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';

import { socialApi } from '@/api';
import { AppText } from '@/components';
import { RootStackParamList } from '@/navigation';
import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from '@/theme';
import { SocialChannelSummary, SocialFriendRequestSummary } from '@/types';
import { styles } from './MessageListScreen.style';

type RootNavigation = NavigationProp<RootStackParamList>;
type TabType = 'friends' | 'requests';

type ConversationListItem = {
  id: string;
  recipientName: string;
  recipientProfileId?: string | null;
  preview: string;
  avatarUrl?: string | null;
  kind: 'channel' | 'request';
  unreadCount?: number;
  channelId?: string;
  channelType?: 'DIRECT_FRIEND' | 'THERAPIST_CONSULT';
};

const MessageListScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigation>();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<TabType>('friends');
  const [channels, setChannels] = useState<SocialChannelSummary[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<SocialFriendRequestSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadSocialData = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setErrorMessage(null);

      try {
        const [channelResult, requestResult] = await Promise.all([
          socialApi.getChatChannels(),
          socialApi.getFriendRequests('INCOMING'),
        ]);

        setChannels(channelResult);
        setIncomingRequests(requestResult);
      } catch (error) {
        console.error('Failed to load social conversations:', error);
        setErrorMessage(
          t('social.messageList.loadError', {
            defaultValue: 'Unable to load social conversations. Please try again.',
          }),
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [t],
  );

  useEffect(() => {
    void loadSocialData();
  }, [loadSocialData]);

  const conversations = useMemo<ConversationListItem[]>(() => {
    if (activeTab === 'requests') {
      return incomingRequests.map(request => {
        const displayName =
          request.senderDisplayName ??
          request.senderProfileName ??
          t('social.messageList.unknownUser', { defaultValue: 'Unknown user' });

        return {
          id: request.requestId,
          recipientName: displayName,
          preview: t('social.messageList.friendRequestPreview', {
            defaultValue: 'Sent you a friend request.',
          }),
          avatarUrl: request.senderAvatarUrl,
          kind: 'request',
        };
      });
    }

    return channels.map(channel => {
      const recipientName =
        channel.counterpartDisplayName ??
        channel.counterpartUsername ??
        t('social.messageList.unknownUser', { defaultValue: 'Unknown user' });

      const previewText =
        channel.lastMessagePreview ??
        channel.checkInPrompt ??
        channel.moodAlert ??
        t('social.messageList.noMessagePreview', {
          defaultValue: 'No messages yet.',
        });

      return {
        id: channel.channelId,
        channelId: channel.channelId,
        channelType: channel.type,
        recipientName,
        recipientProfileId: channel.counterpartProfileId,
        preview: previewText,
        avatarUrl: channel.counterpartAvatarUrl,
        kind: 'channel',
        unreadCount: channel.unreadCount,
      };
    });
  }, [activeTab, channels, incomingRequests, t]);

  const handleGoBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('Home');
  }, [navigation]);

  const handleOpenConversation = useCallback(
    (item: ConversationListItem) => {
      if (item.kind !== 'channel' || !item.channelId || !item.channelType) {
        return;
      }

      navigation.navigate('SocialChat', {
        channelId: item.channelId,
        recipientName: item.recipientName,
        recipientProfileId: item.recipientProfileId ?? '',
        channelType: item.channelType,
      });
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: ConversationListItem }) => (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleOpenConversation(item)}
        activeOpacity={0.85}
        disabled={item.kind === 'request'}>
        <View style={styles.avatarWrap}>
          {item.avatarUrl ? (
            <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <MaterialCommunityIcons
                name="account"
                size={24}
                color={COLORS.textSecondary}
              />
            </View>
          )}

          <View style={styles.alertBadge}>
            <MaterialCommunityIcons
              name={item.kind === 'request' ? 'account-clock-outline' : 'message-processing-outline'}
              size={14}
              color={COLORS.white}
            />
          </View>
        </View>

        <View style={styles.messageContent}>
          <AppText style={styles.nameText} numberOfLines={1}>
            {item.recipientName}
          </AppText>
          <AppText style={styles.previewText} numberOfLines={2}>
            {item.preview}
          </AppText>
        </View>

        {item.kind === 'channel' && (item.unreadCount ?? 0) > 0 ? (
          <View style={styles.unreadBadge}>
            <AppText style={styles.unreadText}>{item.unreadCount}</AppText>
          </View>
        ) : (
          <TouchableOpacity style={styles.menuButton} activeOpacity={0.7}>
            <MaterialCommunityIcons name="dots-horizontal" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}
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

          <AppText style={styles.headerTitle}>
            {t('social.messageList.title', { defaultValue: 'Messages' })}
          </AppText>

          <View style={styles.segmentedControl}>
            <TouchableOpacity
              style={[styles.segmentItem, activeTab === 'friends' && styles.segmentItemActive]}
              onPress={() => setActiveTab('friends')}
              activeOpacity={0.85}>
              <AppText style={[styles.segmentText, activeTab === 'friends' && styles.segmentTextActive]}>
                {t('social.messageList.friendsTab', {
                  count: channels.length,
                  defaultValue: `Friends (${channels.length})`,
                })}
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.segmentItem, activeTab === 'requests' && styles.segmentItemActive]}
              onPress={() => setActiveTab('requests')}
              activeOpacity={0.85}>
              <AppText style={[styles.segmentText, activeTab === 'requests' && styles.segmentTextActive]}>
                {t('social.messageList.requestsTab', {
                  count: incomingRequests.length,
                  defaultValue: `Friend requests (${incomingRequests.length})`,
                })}
              </AppText>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.addFriendsButton} activeOpacity={0.85}>
            <AppText style={styles.addFriendsText}>
              {t('social.messageList.addFriends', { defaultValue: 'Add Friends' })}
            </AppText>
            <View style={styles.addIconWrap}>
              <MaterialCommunityIcons name="plus" size={16} color={COLORS.accentPositive} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.listShell}>
          {isLoading ? (
            <View style={styles.centerContent}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <AppText style={styles.statusText}>
                {t('social.messageList.loading', { defaultValue: 'Loading conversations...' })}
              </AppText>
            </View>
          ) : errorMessage ? (
            <View style={styles.centerContent}>
              <AppText style={styles.errorText}>{errorMessage}</AppText>
              <TouchableOpacity
                style={styles.retryButton}
                activeOpacity={0.85}
                onPress={() => {
                  void loadSocialData();
                }}>
                <AppText style={styles.retryButtonText}>
                  {t('social.messageList.retry', { defaultValue: 'Retry' })}
                </AppText>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={conversations}
              keyExtractor={item => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={() => {
                    void loadSocialData(true);
                  }}
                  tintColor={COLORS.primary}
                />
              }
              ListEmptyComponent={
                <View style={styles.centerContent}>
                  <AppText style={styles.statusText}>
                    {t('social.messageList.empty', {
                      defaultValue: 'No conversations to display.',
                    })}
                  </AppText>
                </View>
              }
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default MessageListScreen;
