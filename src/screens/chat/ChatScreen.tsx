// src/screens/chat/ChatScreen.tsx

import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  FlatList,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ActionSheetIOS,
  Alert,
  Animated,
  Clipboard,
} from 'react-native';
import { AppText } from '@/components';
import {
  NavigationProp,
  useNavigation,
  useRoute,
  RouteProp,
  CommonActions,
} from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { aiApi } from '@/api';
import {
  CHAT_SENDER,
  ERROR_MESSAGE_TEXT,
  INITIAL_CHAT_MESSAGE,
} from '@/constants';
import { COLORS } from '@/theme';
import { Message, BackendChatMessage } from '@/types';
import { RootStackParamList } from '@/navigation';
import { styles } from './ChatScreen.styles';

type NavigationPropType = NavigationProp<RootStackParamList>;

const makeInitialMessage = (): Message => ({
  id: '1',
  text: INITIAL_CHAT_MESSAGE,
  isUser: false,
  timestamp: new Date(),
});

// ─── Animated blinking dot ───────────────────────────────────────────────────
const BlinkingDot: React.FC = () => {
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.2, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    ).start();
  }, [opacity]);
  return <Animated.View style={[styles.onlineDot, { opacity }]} />;
};

// ─── Animated typing dots ────────────────────────────────────────────────────
const TypingDots: React.FC = () => {
  const dot0 = useRef(new Animated.Value(0)).current;
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dots = [dot0, dot1, dot2];

  useEffect(() => {
    const animations = dots.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(anim, { toValue: -6, duration: 300, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay(450),
        ]),
      ),
    );
    animations.forEach(a => a.start());
    return () => animations.forEach(a => a.stop());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.typingIndicator}>
      {dots.map((anim, i) => (
        <Animated.View
          key={i}
          style={[styles.typingDot, { transform: [{ translateY: anim }] }]}
        />
      ))}
    </View>
  );
};

// ─── Main screen ─────────────────────────────────────────────────────────────
const ChatScreen: React.FC = () => {
  const navigation = useNavigation<NavigationPropType>();
  const route = useRoute<RouteProp<RootStackParamList, 'Chat'>>();
  const { t } = useTranslation();
  const incomingSessionId = route.params?.sessionId || null;

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(incomingSessionId);
  const [messages, setMessages] = useState<Message[]>([makeInitialMessage()]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [crisisDetected, setCrisisDetected] = useState<boolean>(false);
  const [showQuickReplies, setShowQuickReplies] = useState<boolean>(true);
  const flatListRef = useRef<FlatList>(null);

  const quickReplies = [
    t('chat.room.quickReply1'),
    t('chat.room.quickReply2'),
    t('chat.room.quickReply3'),
  ];

  useEffect(() => {
    const fetchHistory = async () => {
      if (incomingSessionId) {
        setIsLoadingHistory(true);
        setShowQuickReplies(false);
        try {
          const backendMessages: BackendChatMessage[] = await aiApi.getChatHistory(
            incomingSessionId,
          );
          const mappedMessages: Message[] = backendMessages
            .map(msg => ({
              id: msg.messageId,
              text: msg.content,
              isUser: msg.sender === CHAT_SENDER.USER,
              timestamp: new Date(msg.sentAt),
            }))
            .reverse();
          setMessages(mappedMessages);
          setCurrentSessionId(incomingSessionId);
        } catch (error) {
          console.error('Error loading chat history:', error);
          setMessages([makeInitialMessage()]);
        } finally {
          setIsLoadingHistory(false);
        }
      } else {
        setMessages([makeInitialMessage()]);
        setCurrentSessionId(null);
        setShowQuickReplies(true);
      }
    };
    fetchHistory();
  }, [incomingSessionId]);

  const scrollToTop = useCallback(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToIndex({ index: 0, animated: true });
    }
  }, [messages.length]);

  useEffect(() => {
    scrollToTop();
  }, [messages, scrollToTop]);

  // Always navigate explicitly to AIChatTab — never relies on back stack
  const handleGoBack = useCallback(() => {
    navigation.dispatch(
      CommonActions.navigate({ name: 'MainTabs', params: { screen: 'AIChatTab' } }),
    );
  }, [navigation]);

  const sendText = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setShowQuickReplies(false);
    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      text: trimmed,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages(prev => [userMessage, ...prev]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await aiApi.sendMessage({
        sessionId: currentSessionId ?? undefined,
        content: trimmed,
      });

      if (currentSessionId === null && response.sessionId) {
        setCurrentSessionId(response.sessionId);
      }

      const aiMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        text: response.content,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [aiMessage, ...prev]);

      if (response.crisisDetected) {
        setCrisisDetected(true);
      }
    } catch (error) {
      console.error('Error sending message:', error);
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
  }, [currentSessionId]);

  const handleSendMessage = useCallback(() => {
    sendText(inputText);
  }, [inputText, sendText]);

  const handleQuickReply = (reply: string) => sendText(reply);

  const handleLongPress = (item: Message) => {
    const options = [
      t('chat.room.actionCopy'),
      t('chat.room.actionReport'),
      t('chat.room.actionCancel'),
    ];
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex: 2, destructiveButtonIndex: 1 },
        buttonIndex => {
          if (buttonIndex === 0) Clipboard.setString(item.text);
        },
      );
    } else {
      Alert.alert(t('chat.room.actionTitle'), undefined, [
        { text: options[0], onPress: () => Clipboard.setString(item.text) },
        { text: options[1], style: 'destructive' },
        { text: options[2], style: 'cancel' },
      ]);
    }
  };

  const renderMessage = useCallback(
    ({ item, index }: { item: Message; index: number }) => {
      const isUser = item.isUser;
      const prevItem = index < messages.length - 1 ? messages[index + 1] : null;
      const showAvatar = !isUser && (prevItem === null || prevItem.isUser);

      return (
        <>
          <Pressable
            onLongPress={() => handleLongPress(item)}
            style={[
              styles.messageContainer,
              isUser ? styles.userMessageContainer : styles.aiMessageContainer,
            ]}>
            {!isUser && (
              <View style={[styles.avatarSlot, showAvatar && {}]}>
                {showAvatar && (
                  <View style={styles.avatarContainer}>
                    <MaterialCommunityIcons
                      name="robot-happy-outline"
                      size={16}
                      color={COLORS.white}
                    />
                  </View>
                )}
              </View>
            )}

            <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
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
          </Pressable>

          {!isUser && index === 0 && showQuickReplies && (
            <View style={styles.quickRepliesRow}>
              {quickReplies.map(reply => (
                <Pressable
                  key={reply}
                  style={({ pressed }) => [
                    styles.quickReplyChip,
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={() => handleQuickReply(reply)}>
                  <AppText style={styles.quickReplyText}>{reply}</AppText>
                </Pressable>
              ))}
            </View>
          )}
        </>
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [messages, showQuickReplies, t],
  );

  const renderTypingIndicator = (): React.ReactElement => (
    <View style={[styles.messageContainer, styles.aiMessageContainer]}>
      <View style={styles.avatarSlot}>
        <View style={styles.avatarContainer}>
          <MaterialCommunityIcons name="robot-happy-outline" size={16} color={COLORS.white} />
        </View>
      </View>
      <View style={[styles.messageBubble, styles.aiBubble, styles.typingBubble]}>
        <TypingDots />
      </View>
    </View>
  );

  const typingRow: Message = { id: 'typing', text: '', isUser: false, timestamp: new Date() };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}>

        {/* ===== HEADER ===== */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={handleGoBack}>
            <Feather name="chevron-left" size={22} color={COLORS.white} />
          </Pressable>

          <View style={styles.headerCenter}>
            <View style={styles.botAvatarSmall}>
              <MaterialCommunityIcons name="robot-happy-outline" size={20} color={COLORS.white} />
            </View>
            <View style={styles.headerTextContainer}>
              <AppText style={styles.botName}>{t('chat.room.botName')}</AppText>
              <View style={styles.onlineIndicator}>
                <BlinkingDot />
                <AppText style={styles.onlineText}>{t('chat.room.botStatus')}</AppText>
              </View>
            </View>
          </View>
        </View>

        {/* ===== CHAT AREA ===== */}
        <View style={styles.chatArea}>
          {isLoadingHistory ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <AppText style={styles.loadingText}>{t('chat.room.loadingHistory')}</AppText>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={isTyping ? [typingRow, ...messages] : messages}
              renderItem={props => {
                if (props.item.id === 'typing') return renderTypingIndicator();
                return renderMessage(props);
              }}
              keyExtractor={item => item.id}
              inverted
              scrollEventThrottle={16}
              contentContainerStyle={styles.flatListContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        {/* ===== CRISIS BANNER ===== */}
        {crisisDetected && (
          <View style={styles.crisisBanner}>
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={18}
              color={COLORS.white}
              style={{ marginRight: 8 }}
            />
            <AppText style={styles.crisisText}>
              {t('chat.room.crisisMessage')}{' '}
              <AppText style={styles.crisisLink}>{t('chat.room.crisisPhone')}</AppText>
            </AppText>
            <Pressable onPress={() => setCrisisDetected(false)} style={styles.crisisDismiss}>
              <Feather name="x" size={16} color={COLORS.white} />
            </Pressable>
          </View>
        )}

        {/* ===== INPUT BAR ===== */}
        <SafeAreaView edges={['bottom']} style={styles.inputSafeArea}>
          <View style={styles.inputToolbar}>
            <TextInput
              style={styles.textInput}
              placeholder={t('chat.room.inputPlaceholder')}
              placeholderTextColor={COLORS.textTertiary}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              editable={!isTyping}
            />

            <Pressable
              style={[
                styles.sendButton,
                (!inputText.trim() || isTyping) && styles.sendButtonDisabled,
              ]}
              onPress={handleSendMessage}
              disabled={!inputText.trim() || isTyping}>
              <MaterialCommunityIcons name="arrow-up" size={22} color={COLORS.white} />
            </Pressable>
          </View>
        </SafeAreaView>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;
