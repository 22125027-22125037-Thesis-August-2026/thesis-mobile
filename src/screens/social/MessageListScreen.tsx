import React, { useCallback, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

import { socialApi } from '@/api';
import { AppText } from '@/components';
import { RootStackParamList } from '@/navigation';
import { COLORS } from '@/theme';
import { SocialChannelSummary, SocialFriendRequestSummary } from '@/types';
import { styles } from './MessageListScreen.style';

type RootNavigation = NavigationProp<RootStackParamList>;
type TabType = 'friends' | 'requests';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  const [pendingRequestId, setPendingRequestId] = useState<string | null>(null);
  const [isAddFriendVisible, setIsAddFriendVisible] = useState<boolean>(false);
  const [receiverEmailInput, setReceiverEmailInput] = useState<string>('');
  const [addFriendError, setAddFriendError] = useState<string | null>(null);
  const [isSendingRequest, setIsSendingRequest] = useState<boolean>(false);

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
          t('social.messageList.loadError'),
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [t],
  );

  useFocusEffect(
    useCallback(() => {
      void loadSocialData();
    }, [loadSocialData]),
  );

  const conversations = useMemo<ConversationListItem[]>(() => {
    if (activeTab === 'requests') {
      return incomingRequests.map(request => {
        const displayName =
          request.senderDisplayName ??
          request.senderProfileName ??
          t('social.messageList.unknownUser');

        return {
          id: request.requestId,
          recipientName: displayName,
          preview: t('social.messageList.friendRequestPreview'),
          avatarUrl: request.senderAvatarUrl,
          kind: 'request',
        };
      });
    }

    return channels.map(channel => {
      const recipientName =
        channel.counterpartDisplayName ??
        channel.counterpartUsername ??
        t('social.messageList.unknownUser');

      const previewText =
        channel.lastMessagePreview ??
        channel.checkInPrompt ??
        channel.moodAlert ??
        t('social.messageList.noMessagePreview');

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

  const handleOpenAddFriend = useCallback(() => {
    setReceiverEmailInput('');
    setAddFriendError(null);
    setIsAddFriendVisible(true);
  }, []);

  const handleCloseAddFriend = useCallback(() => {
    if (isSendingRequest) {
      return;
    }
    setIsAddFriendVisible(false);
    setReceiverEmailInput('');
    setAddFriendError(null);
  }, [isSendingRequest]);

  const handleSubmitAddFriend = useCallback(async () => {
    const trimmed = receiverEmailInput.trim();
    if (!trimmed) {
      setAddFriendError(t('social.messageList.addFriendEmptyError'));
      return;
    }
    if (!EMAIL_PATTERN.test(trimmed)) {
      setAddFriendError(t('social.messageList.addFriendInvalidEmail'));
      return;
    }

    setAddFriendError(null);
    setIsSendingRequest(true);
    try {
      await socialApi.sendFriendRequest(trimmed);
      setIsAddFriendVisible(false);
      setReceiverEmailInput('');
      Alert.alert(t('social.messageList.addFriendSuccess'));
    } catch (error) {
      console.error('Failed to send friend request:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          setAddFriendError(t('social.messageList.addFriendNotFound'));
          return;
        }
        if (error.response?.status === 409) {
          setAddFriendError(t('social.messageList.addFriendConflict'));
          return;
        }
      }
      setAddFriendError(t('social.messageList.addFriendSendError'));
    } finally {
      setIsSendingRequest(false);
    }
  }, [receiverEmailInput, t]);

  const handleRespondToRequest = useCallback(
    async (requestId: string, action: 'accept' | 'reject') => {
      setPendingRequestId(requestId);
      try {
        if (action === 'accept') {
          await socialApi.acceptFriendRequest(requestId);
        } else {
          await socialApi.rejectFriendRequest(requestId);
        }
        setIncomingRequests(prev => prev.filter(request => request.requestId !== requestId));
        if (action === 'accept') {
          navigation.reset({
            index: 0,
            routes: [{ name: 'MainTabs', params: { screen: 'ChatRoomTab' } }],
          });
          setActiveTab('friends');
          await loadSocialData();
        }
      } catch (error) {
        console.error(`Failed to ${action} friend request:`, error);
        Alert.alert(
          t(
            action === 'accept'
              ? 'social.messageList.acceptError'
              : 'social.messageList.rejectError',
          ),
        );
      } finally {
        setPendingRequestId(null);
      }
    },
    [loadSocialData, navigation, t],
  );

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
    ({ item }: { item: ConversationListItem }) => {
      const avatarBlock = (
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
      );

      const contentBlock = (
        <View style={styles.messageContent}>
          <AppText style={styles.nameText} numberOfLines={1}>
            {item.recipientName}
          </AppText>
          <AppText style={styles.previewText} numberOfLines={2}>
            {item.preview}
          </AppText>
        </View>
      );

      if (item.kind === 'request') {
        return (
          <View style={styles.requestCard}>
            <View style={styles.requestTopRow}>
              {avatarBlock}
              {contentBlock}
            </View>
            <View style={styles.requestActions}>
              <TouchableOpacity
                style={[styles.rejectButton, pendingRequestId === item.id && styles.actionButtonDisabled]}
                activeOpacity={0.85}
                disabled={pendingRequestId === item.id}
                onPress={() => {
                  void handleRespondToRequest(item.id, 'reject');
                }}>
                <AppText style={styles.rejectButtonText}>
                  {t('social.messageList.rejectRequest')}
                </AppText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.acceptButton, pendingRequestId === item.id && styles.actionButtonDisabled]}
                activeOpacity={0.85}
                disabled={pendingRequestId === item.id}
                onPress={() => {
                  void handleRespondToRequest(item.id, 'accept');
                }}>
                <AppText style={styles.acceptButtonText}>
                  {t('social.messageList.acceptRequest')}
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        );
      }

      return (
        <TouchableOpacity
          style={styles.card}
          onPress={() => handleOpenConversation(item)}
          activeOpacity={0.85}>
          {avatarBlock}
          {contentBlock}
        </TouchableOpacity>
      );
    },
    [handleOpenConversation, handleRespondToRequest, pendingRequestId, t],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.headerShell}>
          <AppText style={styles.headerTitle}>
            {t('social.messageList.title')}
          </AppText>

          <View style={styles.segmentedControl}>
            <TouchableOpacity
              style={[styles.segmentItem, activeTab === 'friends' && styles.segmentItemActive]}
              onPress={() => setActiveTab('friends')}
              activeOpacity={0.85}>
              <AppText style={[styles.segmentText, activeTab === 'friends' && styles.segmentTextActive]}>
                {t('social.messageList.friendsTab', { count: channels.length })}
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.segmentItem, activeTab === 'requests' && styles.segmentItemActive]}
              onPress={() => setActiveTab('requests')}
              activeOpacity={0.85}>
              <AppText style={[styles.segmentText, activeTab === 'requests' && styles.segmentTextActive]}>
                {t('social.messageList.requestsTab', { count: incomingRequests.length })}
              </AppText>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.addFriendsButton}
            activeOpacity={0.85}
            onPress={handleOpenAddFriend}>
            <AppText style={styles.addFriendsText}>
              {t('social.messageList.addFriends')}
            </AppText>
            <View style={styles.addIconWrap}>
              <MaterialCommunityIcons name="plus" size={16} color={COLORS.primaryDark} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.listShell}>
          {isLoading ? (
            <View style={styles.centerContent}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <AppText style={styles.statusText}>
                {t('social.messageList.loading')}
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
                  {t('social.messageList.retry')}
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
                    {t('social.messageList.empty')}
                  </AppText>
                </View>
              }
            />
          )}
        </View>
      </View>

      <Modal
        visible={isAddFriendVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseAddFriend}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconWrap}>
              <MaterialCommunityIcons
                name="account-plus-outline"
                size={28}
                color={COLORS.primaryDark}
              />
            </View>
            <AppText style={styles.modalTitle}>
              {t('social.messageList.addFriendModalTitle')}
            </AppText>
            <AppText style={styles.modalDescription}>
              {t('social.messageList.addFriendModalDescription')}
            </AppText>

            <AppText style={styles.modalInputLabel}>
              {t('social.messageList.addFriendInputLabel')}
            </AppText>
            <TextInput
              style={styles.modalInput}
              value={receiverEmailInput}
              onChangeText={text => {
                setReceiverEmailInput(text);
                if (addFriendError) {
                  setAddFriendError(null);
                }
              }}
              placeholder={t('social.messageList.addFriendInputPlaceholder')}
              placeholderTextColor={COLORS.placeholder}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              editable={!isSendingRequest}
            />
            {addFriendError ? (
              <AppText style={styles.modalErrorText}>{addFriendError}</AppText>
            ) : null}

            <View style={styles.modalButtonRow}>
              <Pressable
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={handleCloseAddFriend}
                disabled={isSendingRequest}>
                <AppText style={styles.modalCancelText}>
                  {t('social.messageList.addFriendCancel')}
                </AppText>
              </Pressable>
              <Pressable
                style={[
                  styles.modalButton,
                  styles.modalSubmitButton,
                  isSendingRequest && styles.modalButtonDisabled,
                ]}
                onPress={() => {
                  void handleSubmitAddFriend();
                }}
                disabled={isSendingRequest}>
                {isSendingRequest ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <AppText style={styles.modalSubmitText}>
                    {t('social.messageList.addFriendSubmit')}
                  </AppText>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default MessageListScreen;
