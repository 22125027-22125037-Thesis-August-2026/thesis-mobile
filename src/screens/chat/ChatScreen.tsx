// src/screens/chat/ChatScreen.tsx

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View, FlatList, TextInput, Pressable, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { AppText } from '@/components';
import { NavigationProp, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import { aiApi } from '@/api';
import {
  BOT_NAME,
  BOT_STATUS,
  CHAT_SENDER,
  ERROR_MESSAGE_TEXT,
  INITIAL_CHAT_MESSAGE,
  LOADING_HISTORY_TEXT,
} from '@/constants';
import { COLORS, SPACING, BORDER_RADIUS, FONTS } from '@/theme';
import { Message, BackendChatMessage } from '@/types';
import { TrackingStackParamList } from '@/navigation';

type NavigationPropType = NavigationProp<TrackingStackParamList>;

const INITIAL_MESSAGE: Message = {
  id: '1',
  text: INITIAL_CHAT_MESSAGE,
  isUser: false,
  timestamp: new Date(),
};

const ChatScreen: React.FC = () => {
  const navigation = useNavigation<NavigationPropType>();
  const route = useRoute<RouteProp<TrackingStackParamList, 'Chat'>>();
  const incomingSessionId = route.params?.sessionId || null;
  
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(incomingSessionId);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const flatListRef = useRef<FlatList>(null);

  // Fetch chat history when component mounts or sessionId changes
  useEffect(() => {
    const fetchHistory = async () => {
      if (incomingSessionId) {
        setIsLoadingHistory(true);
        try {
          const backendMessages: BackendChatMessage[] = await aiApi.getChatHistory(
            incomingSessionId,
          );

          // Map BackendChatMessage to Message format
          // Backend returns in ASCENDING order (oldest first), so we reverse for inverted FlatList
          const mappedMessages: Message[] = backendMessages
            .map((msg) => ({
              id: msg.messageId,
              text: msg.content,
              isUser: msg.sender === CHAT_SENDER.USER,
              timestamp: new Date(msg.sentAt),
            }))
            .reverse(); // Reverse because FlatList is inverted and backend sends oldest first

          setMessages(mappedMessages);
          setCurrentSessionId(incomingSessionId);
        } catch (error) {
          console.error('Error loading chat history:', error);
          // Fallback to initial message on error
          setMessages([INITIAL_MESSAGE]);
        } finally {
          setIsLoadingHistory(false);
        }
      } else {
        // New chat session
        setMessages([INITIAL_MESSAGE]);
        setCurrentSessionId(null);
      }
    };

    fetchHistory();
  }, [incomingSessionId]);

  // Scroll to bottom on new messages
  const scrollToBottom = useCallback(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToIndex({
        index: 0,
        animated: true,
      });
    }
  }, [messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = useCallback(async (): Promise<void> => {
    if (!inputText.trim()) return;

    // Create user message
    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    // Add user message to UI immediately
    setMessages(prev => [userMessage, ...prev]);
    setInputText('');
    setIsTyping(true);

    try {
      // Call backend API with session_id (ping-pong logic)
      const response = await aiApi.sendMessage({
        sessionId: currentSessionId,
        content: userMessage.text,
      });

      // If this is the first message (no session established), capture session_id
      if (currentSessionId === null && response.sessionId) {
        setCurrentSessionId(response.sessionId);
      }

      // Create AI message
      const aiMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        text: response.content,
        isUser: false,
        timestamp: new Date(),
      };

      // Add AI message to UI
      setMessages(prev => [aiMessage, ...prev]);

      // Handle crisis detection if needed (you can add notifications here)
      if (response.crisisDetected) {
        console.warn('⚠️ Crisis detected:', response.sentimentDetected);
        // TODO: Show crisis alert or notification
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // TODO: Show error toast/alert to user
      const errorMessage: Message = {
        id: `msg_${Date.now() + 2}`,
        text: ERROR_MESSAGE_TEXT,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [errorMessage, ...prev]);
    } finally {
      setIsTyping(false);
    }
  }, [inputText, currentSessionId]);

  const renderMessage = useCallback(({ item }: { item: Message }) => {
    const isUser = item.isUser;

    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.aiMessageContainer,
        ]}>
        {!isUser && (
          <View style={styles.avatarContainer}>
            <MaterialCommunityIcons
              name="robot"
              size={24}
              color={COLORS.textPrimary}
            />
          </View>
        )}

        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.aiBubble,
          ]}>
          <AppText
            style={[
              styles.messageText,
              isUser ? styles.userMessageText : styles.aiMessageText,
            ]}>
            {item.text}
          </AppText>
          <AppText
            style={[
              styles.timestamp,
              isUser ? styles.userTimestamp : styles.aiTimestamp,
            ]}>
            {item.timestamp.toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </AppText>
        </View>

        {isUser && <View style={styles.userAvatarPlaceholder} />}
      </View>
    );
  }, []);

  const renderTypingIndicator = (): React.ReactElement => {
    return (
      <View style={styles.messageContainer}>
        <View style={styles.avatarContainer}>
          <MaterialCommunityIcons
            name="robot"
            size={24}
            color={COLORS.textPrimary}
          />
        </View>
        <View style={[styles.messageBubble, styles.aiBubble]}>
          <View style={styles.typingIndicator}>
            <View style={styles.typingDot} />
            <View style={styles.typingDot} />
            <View style={styles.typingDot} />
          </View>
        </View>
      </View>
    );
  };

  const handleGoBack = (): void => {
    navigation.goBack();
  };

  const handleMenuPress = (): void => {
    // TODO: Implement menu action
    console.log('Menu pressed');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        {/* ===== HEADER ===== */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={handleGoBack}>
            <Feather name="chevron-left" size={24} color={COLORS.textPrimary} />
          </Pressable>

          <View style={styles.headerCenter}>
            <View style={styles.botAvatarSmall}>
              <MaterialCommunityIcons
                name="robot"
                size={20}
                color={COLORS.primary}
              />
            </View>
            <View style={styles.headerTextContainer}>
              <AppText style={styles.botName}>{BOT_NAME}</AppText>
              <View style={styles.onlineIndicator}>
                <View style={styles.onlineDot} />
                <AppText style={styles.onlineText}>{BOT_STATUS}</AppText>
              </View>
            </View>
          </View>

          <Pressable style={styles.menuButton} onPress={handleMenuPress}>
            <MaterialCommunityIcons
              name="dots-vertical"
              size={24}
              color={COLORS.textPrimary}
            />
          </Pressable>
        </View>

        {/* ===== CHAT AREA ===== */}
        <View style={styles.chatArea}>
          {isLoadingHistory ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <AppText style={styles.loadingText}>{LOADING_HISTORY_TEXT}</AppText>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={isTyping ? [{ id: 'typing' }, ...messages] : messages}
              renderItem={(props) => {
                if (props.item.id === 'typing') {
                  return renderTypingIndicator();
                }
                return renderMessage(props);
              }}
              keyExtractor={(item) => item.id}
              inverted
              scrollEventThrottle={16}
              contentContainerStyle={styles.flatListContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        {/* ===== INPUT TOOLBAR ===== */}
        <View style={styles.inputToolbar}>
          <Pressable style={styles.iconButton}>
            <MaterialCommunityIcons
              name="microphone"
              size={24}
              color={COLORS.textSecondary}
            />
          </Pressable>

          <TextInput
            style={[styles.textInput, { fontFamily: FONTS.regular }]}
            placeholder="Aa"
            placeholderTextColor={COLORS.placeholder}
            value={inputText}
            onChangeText={setInputText}
            multiline={true}
            maxLength={500}
            editable={!isTyping}
          />

          <Pressable style={styles.iconButton}>
            <MaterialCommunityIcons
              name="paperclip"
              size={24}
              color={COLORS.textSecondary}
            />
          </Pressable>

          <Pressable
            style={[
              styles.sendButton,
              (!inputText.trim() || isTyping) && styles.sendButtonDisabled,
            ]}
            onPress={handleSendMessage}
            disabled={!inputText.trim() || isTyping}>
            <MaterialCommunityIcons
              name="send"
              size={20}
              color={
                !inputText.trim() || isTyping
                  ? COLORS.placeholder
                  : COLORS.primary
              }
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  // ===== HEADER STYLES =====
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
  },
  backButton: {
    padding: SPACING.xs,
    marginRight: SPACING.md,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  botAvatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.therapyHeroBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  headerTextContainer: {
    flex: 1,
  },
  botName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  onlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginRight: 4,
  },
  onlineText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  menuButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.md,
  },
  // ===== CHAT AREA STYLES =====
  chatArea: {
    flex: 1,
    backgroundColor: COLORS.therapyBackground,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  flatListContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  aiMessageContainer: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.therapyHeroBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    flexShrink: 0,
  },
  userAvatarPlaceholder: {
    width: 32,
    marginLeft: SPACING.sm,
    flexShrink: 0,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
  },
  userBubble: {
    backgroundColor: '#8B6F47',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: 4,
    shadowColor: COLORS.shadowBase,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  userMessageText: {
    color: COLORS.white,
    fontWeight: '500',
  },
  aiMessageText: {
    color: COLORS.textPrimary,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 2,
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  aiTimestamp: {
    color: COLORS.textSecondary,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 24,
    justifyContent: 'center',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.textSecondary,
    marginHorizontal: 3,
    opacity: 0.6,
  },
  // ===== INPUT TOOLBAR STYLES =====
  inputToolbar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSubtle,
    gap: SPACING.sm,
  },
  iconButton: {
    padding: SPACING.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 24,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: 14,
    color: COLORS.textPrimary,
    maxHeight: 100,
  },
  sendButton: {
    padding: SPACING.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default ChatScreen;
