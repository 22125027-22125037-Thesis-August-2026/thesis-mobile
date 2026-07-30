import { useCallback, useEffect, useRef, useState } from 'react';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TextDecoder, TextEncoder } from 'text-encoding';

import { refreshAccessToken } from '@/api/axiosClient';

// Same key axiosClient persists the rotated access token under.
const ACCESS_TOKEN_KEY = 'userToken';

// React Native runtime may miss these globals; STOMP relies on them.
const globalScope = globalThis as unknown as {
  TextEncoder?: typeof TextEncoder;
  TextDecoder?: typeof TextDecoder;
};

if (!globalScope.TextEncoder) {
  globalScope.TextEncoder = TextEncoder;
}

if (!globalScope.TextDecoder) {
  globalScope.TextDecoder = TextDecoder;
}

export interface ChatSocketMessage {
  id: string;
  channelId: string;
  content: string;
  sender?: string;
  sentAt: string;
}

type IncomingChatPayload = {
  id?: string | number;
  messageId?: string | number;
  channelId?: string | number;
  content?: string;
  sender?: string;
  sentAt?: string;
};

interface UseChatWebSocketParams {
  token: string | null;
  brokerUrl: string;
  subscriptionDestination?: string;
  publishDestination?: string;
}

interface UseChatWebSocketResult {
  messages: ChatSocketMessage[];
  isConnected: boolean;
  sendMessage: (channelId: string, content: string) => boolean;
  clearMessages: () => void;
}

const normalizeIncomingMessage = (message: IMessage): ChatSocketMessage | null => {
  try {
    const parsed = JSON.parse(message.body) as IncomingChatPayload;

    if (typeof parsed.content !== 'string' || !parsed.content.trim()) {
      return null;
    }

    return {
      id: String(parsed.messageId ?? parsed.id ?? Date.now()),
      channelId: String(parsed.channelId ?? ''),
      content: parsed.content,
      sender: parsed.sender,
      sentAt: parsed.sentAt ?? new Date().toISOString(),
    };
  } catch (error) {
    console.warn('Failed to parse STOMP message body:', error);
    return null;
  }
};

export const useChatWebSocket = ({
  token,
  brokerUrl,
  subscriptionDestination = '/user/queue/messages',
  publishDestination = '/app/chat.send',
}: UseChatWebSocketParams): UseChatWebSocketResult => {
  const [messages, setMessages] = useState<ChatSocketMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const subscriptionRef = useRef<StompSubscription | null>(null);
  const tokenRef = useRef<string | null>(token);
  const didForceRefreshRef = useRef(false);

  // Kept in a ref so a token rotation refreshes the CONNECT header without
  // tearing down a healthy socket (the effect only re-runs on login/logout).
  tokenRef.current = token;
  const hasToken = !!token;

  useEffect(() => {
    if (!hasToken) {
      console.warn('WebSocket: No token available, skipping connection');
      setIsConnected(false);
      return;
    }

    console.log('WebSocket: Attempting connection', {
      brokerURL: brokerUrl,
      hasToken,
    });

    const client = new Client({
      brokerURL: brokerUrl,
      reconnectDelay: 5000,
      connectHeaders: {
        Authorization: `Bearer ${tokenRef.current ?? ''}`,
      },
      forceBinaryWSFrames: true,
      appendMissingNULLonIncoming: true,
      debug: (str) => {
        console.log('[STOMP DEBUG]:', str); // <--- ADD THIS LINE
      },
      // Re-read the token on *every* attempt, including reconnects. Access
      // tokens last 15 min and axiosClient rotates them into AsyncStorage
      // without going through React state, so a client that captured its
      // header once would replay an expired JWT forever — the broker rejects
      // each CONNECT and the UI sits on "Connecting…".
      beforeConnect: async () => {
        const storedToken = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
        client.connectHeaders = {
          Authorization: `Bearer ${storedToken ?? tokenRef.current ?? ''}`,
        };
      },
      onConnect: () => {
        console.log('STOMP connected successfully', { brokerURL: brokerUrl });
        didForceRefreshRef.current = false;
        setIsConnected(true);

        subscriptionRef.current?.unsubscribe();
        subscriptionRef.current = client.subscribe(
          subscriptionDestination,
          (frame: IMessage) => {
            const incomingMessage = normalizeIncomingMessage(frame);
            if (incomingMessage) {
              setMessages(prevMessages => [...prevMessages, incomingMessage]);
            }
          },
        );
      },
      onDisconnect: () => {
        console.log('STOMP disconnected', { brokerURL: brokerUrl });
        setIsConnected(false);
      },
      onStompError: frame => {
        console.error('STOMP broker error:', {
          message: frame.headers['message'],
          body: frame.body,
          headers: frame.headers,
          brokerURL: brokerUrl,
        });

        // The stored token can be stale too (e.g. a session restored at cold
        // start before any REST call has rotated it). Force one rotation and
        // let stompjs's own reconnect pick it up via beforeConnect.
        //
        // We rotate on *any* ERROR frame rather than sniffing it for auth
        // wording: social-api declares a SocialStompErrorHandler but never
        // registers it, so a rejected CONNECT arrives as the generic
        // "Failed to send message to ExecutorSubscribableChannel[...]" with an
        // empty body — there is no 401 to match on. Strictly once per
        // connected-streak: refresh tokens rotate on use, so a retry storm
        // would trip the backend's reuse-detection and revoke the session.
        if (!didForceRefreshRef.current) {
          didForceRefreshRef.current = true;
          void refreshAccessToken();
        }
      },
      onWebSocketClose: () => {
        console.log('WebSocket closed - will attempt reconnection', {
          brokerURL: brokerUrl,
          reconnectDelay: 5000,
        });
        setIsConnected(false);
      },
      onWebSocketError: error => {
        const errorDetails = {
          brokerURL: brokerUrl,
          type: typeof error,
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          errorString: JSON.stringify(error),
        };
        console.error('WebSocket connection error:', errorDetails);
      },
    });

    clientRef.current = client;
    client.activate();

    return () => {
      subscriptionRef.current?.unsubscribe();
      subscriptionRef.current = null;
      clientRef.current = null;
      setIsConnected(false);
      void client.deactivate();
    };
  }, [brokerUrl, hasToken, subscriptionDestination]);

  const sendMessage = useCallback(
    (channelId: string, content: string): boolean => {
      const client = clientRef.current;
      if (!client || !client.connected) {
        return false;
      }

      client.publish({
        destination: publishDestination,
        body: JSON.stringify({ channelId, content }),
      });

      return true;
    },
    [publishDestination],
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isConnected,
    sendMessage,
    clearMessages,
  };
};
