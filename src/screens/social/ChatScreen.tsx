import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  View,
} from 'react-native';
import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';

import { socialApi } from '@/api';
import { AppText } from '@/components';
import { AuthContext } from '@/context/AuthContext';
import { useChatWebSocket, ChatSocketMessage } from '@/hooks';
import { RootStackParamList } from '@/navigation';
import { COLORS } from '@/theme';
import { styles } from './ChatScreen.style';

type SocialChatRoute = RouteProp<RootStackParamList, 'SocialChat'>;
type RootNavigation = NavigationProp<RootStackParamList>;

interface MessageBubbleProps {
  message: ChatSocketMessage;
  isMine: boolean;
}

const CHAT_BROKER_URL = 'ws://localhost:8083/ws';

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isMine }) => {
  const formattedTime = new Date(message.sentAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={[styles.bubbleRow, isMine ? styles.myBubbleRow : styles.otherBubbleRow]}>
      <View style={[styles.bubble, isMine ? styles.myBubble : styles.otherBubble]}>
        <AppText style={[styles.bubbleText, isMine ? styles.myBubbleText : styles.otherBubbleText]}>
          {message.content}
        </AppText>
        <AppText style={[styles.bubbleTime, isMine ? styles.myBubbleTime : styles.otherBubbleTime]}>
          {formattedTime}
        </AppText>
      </View>
    </View>
  );
};

const ChatScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigation>();
  const route = useRoute<SocialChatRoute>();
  const auth = useContext(AuthContext);
  const { t } = useTranslation();

  const { channelId, recipientName, recipientProfileId, channelType } = route.params;
  const currentUserId = auth?.userInfo?.profileId ?? '';
  const token = auth?.userToken ?? null;

  const { messages, sendMessage, isConnected } = useChatWebSocket({
    token,
    brokerUrl: CHAT_BROKER_URL,
  });

  const [inputText, setInputText] = useState<string>('');
  const [historyMessages, setHistoryMessages] = useState<ChatSocketMessage[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState<boolean>(true);
  const [localMessages, setLocalMessages] = useState<ChatSocketMessage[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadHistory = async () => {
      setIsHistoryLoading(true);

      try {
        const serverMessages = await socialApi.getChannelMessages(channelId, {
          page: 0,
          size: 50,
        });

        if (!isMounted) {
          return;
        }

        const normalized = serverMessages
          .map<ChatSocketMessage>(message => ({
            id: message.messageId,
            channelId: message.channelId,
            content: message.content,
            sender: message.senderProfileId ?? undefined,
            sentAt: message.createdAt,
          }))
          .sort((left, right) => {
            const leftTs = new Date(left.sentAt).getTime();
            const rightTs = new Date(right.sentAt).getTime();
            return leftTs - rightTs;
          });

        setHistoryMessages(normalized);
      } catch (error) {
        console.error('Failed to load channel messages:', error);
        if (isMounted) {
          setHistoryMessages([]);
        }
      } finally {
        if (isMounted) {
          setIsHistoryLoading(false);
        }
      }
    };

    void loadHistory();

    return () => {
      isMounted = false;
    };
  }, [channelId]);

  const channelMessages = useMemo(() => {
    const rawLiveMessages = messages.filter(message => message.channelId === channelId);

    const deduplicated = new Map<string, ChatSocketMessage>();

    historyMessages.forEach(message => {
      deduplicated.set(message.id, message);
    });

    const allLiveMessages = [...rawLiveMessages, ...localMessages];

    allLiveMessages.forEach((rawMsg: any) => {
      const normalizedId = rawMsg.id || rawMsg.messageId;

      const normalizedMsg: ChatSocketMessage = {
        id: normalizedId,
        channelId: rawMsg.channelId,
        content: rawMsg.content,
        sender: rawMsg.sender || rawMsg.senderId || rawMsg.senderProfileId,
        sentAt: rawMsg.sentAt || rawMsg.createdAt,
      };

      if (normalizedId) {
        deduplicated.set(normalizedId, normalizedMsg);
      }
    });

    return Array.from(deduplicated.values()).sort((left, right) => {
      const leftTs = new Date(left.sentAt).getTime();
      const rightTs = new Date(right.sentAt).getTime();
      return leftTs - rightTs;
    });
  }, [channelId, historyMessages, messages, localMessages]);

  const invertedMessages = useMemo(
    () => [...channelMessages].reverse(),
    [channelMessages],
  );

  const trimmedInput = inputText.trim();
  const isSendDisabled = trimmedInput.length === 0 || !isConnected;

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('Home');
  }, [navigation]);

  const handleOpenFriendProfile = useCallback(() => {
    navigation.navigate('FriendProfile', {
      friendProfileId: recipientProfileId,
      friendName: recipientName,
    });
  }, [navigation, recipientProfileId, recipientName]);

  const handleSend = useCallback(() => {
    const messageToSend = inputText.trim();
    if (!messageToSend || !isConnected) {
      return;
    }

    sendMessage(channelId, messageToSend);

    const optimisticMsg: ChatSocketMessage = {
      id: `temp-${Date.now()}`,
      channelId: channelId,
      content: messageToSend,
      sender: currentUserId,
      sentAt: new Date().toISOString(),
    };

    setLocalMessages(prev => [...prev, optimisticMsg]);
    setInputText('');
  }, [channelId, inputText, isConnected, sendMessage, currentUserId]);

  const renderMessageItem = useCallback(
    ({ item }: { item: ChatSocketMessage }) => {
      const senderId = item.sender ?? '';
      const isMine = senderId.length > 0 && senderId === currentUserId;
      return <MessageBubble message={item} isMine={isMine} />;
    },
    [currentUserId],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={handleBack} style={styles.backButton}>
              <MaterialCommunityIcons
                name="chevron-left"
                size={24}
                color={COLORS.textPrimary}
              />
            </Pressable>
            <View style={styles.headerTextWrap}>
              <AppText style={styles.headerTitle}>{recipientName}</AppText>
              <AppText style={styles.headerSubtitle}>{channelType}</AppText>
            </View>
            <Pressable onPress={handleOpenFriendProfile} style={styles.backButton} hitSlop={8}>
              <MaterialCommunityIcons
                name="dots-vertical"
                size={22}
                color={COLORS.textPrimary}
              />
            </Pressable>
          </View>

          {/* Message list */}
          <View style={styles.listContainer}>
            <FlatList
              data={invertedMessages}
              keyExtractor={item => item.id}
              renderItem={renderMessageItem}
              inverted
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.messageListContent}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <AppText style={styles.emptyStateText}>No messages yet.</AppText>
                </View>
              }
            />
            {isHistoryLoading && (
              <View style={styles.historyLoadingWrap}>
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>
            )}
          </View>

          {/* Input bar */}
          <View style={styles.inputBar}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type a message..."
              placeholderTextColor={COLORS.placeholder}
              multiline
              maxLength={1000}
              editable={isConnected}
              textAlignVertical="top"
            />
            <Pressable
              style={[styles.sendButton, isSendDisabled && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={isSendDisabled}>
              <AppText style={styles.sendButtonText}>Send</AppText>
            </Pressable>
          </View>

          {!isConnected && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <AppText style={styles.loadingText}>
                {t('social.chat.connecting', { defaultValue: 'Connecting to chat...' })}
              </AppText>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;
