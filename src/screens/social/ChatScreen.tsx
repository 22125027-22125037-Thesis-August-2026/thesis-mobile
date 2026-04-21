import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
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
import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from '@/theme';

type SocialChatRoute = RouteProp<RootStackParamList, 'SocialChat'>;
type RootNavigation = NavigationProp<RootStackParamList>;

interface MessageBubbleProps {
  message: ChatSocketMessage;
  isMine: boolean;
}

const CHAT_BROKER_URL = 'ws://localhost:8083/ws';

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isMine }) => {
  const formattedTime = useMemo(() => {
    const parsed = new Date(message.sentAt);
    if (Number.isNaN(parsed.getTime())) {
      return '';
    }

    return parsed.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [message.sentAt]);

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

  const { channelId, recipientName, channelType } = route.params;
  const currentUserId = auth?.userInfo?.profileId ?? '';
  const token = auth?.userToken ?? null;

  const { messages, sendMessage, isConnected } = useChatWebSocket({
    token,
    brokerUrl: CHAT_BROKER_URL,
  });

  const [inputText, setInputText] = useState<string>('');
  const [historyMessages, setHistoryMessages] = useState<ChatSocketMessage[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState<boolean>(true);

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
    const liveMessages = messages.filter(message => message.channelId === channelId);
    const deduplicated = new Map<string, ChatSocketMessage>();

    historyMessages.forEach(message => {
      deduplicated.set(message.id, message);
    });

    liveMessages.forEach(message => {
      deduplicated.set(message.id, message);
    });

    return Array.from(deduplicated.values()).sort((left, right) => {
      const leftTs = new Date(left.sentAt).getTime();
      const rightTs = new Date(right.sentAt).getTime();
      return leftTs - rightTs;
    });
  }, [channelId, historyMessages, messages]);

  // For an inverted list, provide newest-first data so latest appears at the visual bottom.
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

  const handleSend = useCallback(() => {
    const messageToSend = inputText.trim();
    if (!messageToSend || !isConnected) {
      return;
    }

    sendMessage(channelId, messageToSend);
    setInputText('');
  }, [channelId, inputText, isConnected, sendMessage]);

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
        keyboardVerticalOffset={Platform.OS === 'ios' ? SPACING.sm : 0}>
        <View style={styles.container}>
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
            <View style={styles.headerPlaceholder} />
          </View>

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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screenHorizontal,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  headerTextWrap: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    marginTop: 2,
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  headerPlaceholder: {
    width: 36,
    height: 36,
  },
  listContainer: {
    flex: 1,
  },
  messageListContent: {
    paddingHorizontal: SPACING.screenHorizontal,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  bubbleRow: {
    flexDirection: 'row',
    width: '100%',
  },
  myBubbleRow: {
    justifyContent: 'flex-end',
  },
  otherBubbleRow: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: BORDER_RADIUS.card,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    shadowColor: COLORS.shadowBase,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  myBubble: {
    backgroundColor: COLORS.accentPositive,
    borderBottomRightRadius: BORDER_RADIUS.sm,
  },
  otherBubble: {
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: BORDER_RADIUS.sm,
  },
  bubbleText: {
    fontSize: FONT_SIZES.sm,
    lineHeight: 20,
  },
  myBubbleText: {
    color: COLORS.white,
  },
  otherBubbleText: {
    color: COLORS.textPrimary,
  },
  bubbleTime: {
    marginTop: SPACING.xs,
    fontSize: FONT_SIZES.xs,
    alignSelf: 'flex-end',
  },
  myBubbleTime: {
    color: COLORS.whiteAlpha30,
  },
  otherBubbleTime: {
    color: COLORS.textSecondary,
  },
  emptyState: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  historyLoadingWrap: {
    paddingBottom: SPACING.sm,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.screenHorizontal,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSubtle,
    backgroundColor: COLORS.surface,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 130,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: BORDER_RADIUS.input,
    backgroundColor: COLORS.inputBackground,
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.sm,
  },
  sendButton: {
    minWidth: 72,
    height: 44,
    borderRadius: BORDER_RADIUS.button,
    backgroundColor: COLORS.accentNeutral,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  sendButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.whiteAlpha30,
  },
  loadingText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
  },
});

export default ChatScreen;
