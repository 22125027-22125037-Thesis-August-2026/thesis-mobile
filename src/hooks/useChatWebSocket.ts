import { useCallback, useEffect, useRef, useState } from 'react';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { TextDecoder, TextEncoder } from 'text-encoding';

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

  useEffect(() => {
    if (!token) {
      setIsConnected(false);
      return;
    }

    const client = new Client({
      brokerURL: brokerUrl,
      reconnectDelay: 5000,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      forceBinaryWSFrames: true,
      appendMissingNULLonIncoming: true,
      debug: (str) => {
        console.log('[STOMP DEBUG]:', str); // <--- ADD THIS LINE
      },
      onConnect: () => {
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
        setIsConnected(false);
      },
      onStompError: frame => {
        console.error('STOMP broker error:', frame.headers['message'], frame.body);
      },
      onWebSocketClose: () => {
        setIsConnected(false);
      },
      onWebSocketError: error => {
        console.error('WebSocket error:', error);
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
  }, [brokerUrl, subscriptionDestination, token]);

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
