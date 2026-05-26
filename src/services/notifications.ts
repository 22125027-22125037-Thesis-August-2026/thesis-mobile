import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { axiosClient } from '@/api';

// ============================================================================
// Firebase Cloud Messaging (FCM) integration
// ----------------------------------------------------------------------------
// The Notification Service stores each user's FCM device tokens so producer
// services (Booking, Tracking, Social) can target the right device(s) when
// publishing notification events.
//
// See docs/NOTIFICATION_API_CONTROLLER_REFERENCE.md sections 4.4 and 4.5 for
// the endpoint contract.
//
// REQUIRED NATIVE SETUP (do this before the token will be non-null):
//   1. `npm install @react-native-firebase/app @react-native-firebase/messaging`
//   2. Android: drop `google-services.json` into `android/app/` and apply the
//      Google services Gradle plugin per the @react-native-firebase docs.
//   3. iOS: drop `GoogleService-Info.plist` into the Xcode project, enable the
//      Push Notifications + Background Modes (Remote notifications)
//      capabilities, and run `cd ios && pod install`.
//
// Until step 1 is done this module loads with a graceful fallback: token
// retrieval simply returns null and login still succeeds.
// ============================================================================

const DEVICE_TOKEN_STORAGE_KEY = 'fcmDeviceToken';

type DevicePlatform = 'ANDROID' | 'IOS' | 'WEB';

type FirebaseMessagingModule = {
  (): {
    getToken: () => Promise<string>;
    requestPermission: () => Promise<number>;
    onTokenRefresh: (cb: (token: string) => void) => () => void;
    hasPermission: () => Promise<number>;
    onMessage: (cb: (message: RemoteMessage) => void | Promise<void>) => () => void;
  };
  AuthorizationStatus: {
    AUTHORIZED: number;
    PROVISIONAL: number;
    DENIED: number;
    NOT_DETERMINED: number;
  };
};

type RemoteMessage = {
  messageId?: string;
  notification?: {
    title?: string;
    body?: string;
  };
  data?: Record<string, string>;
};

type NotifeeModule = {
  createChannel: (config: {
    id: string;
    name: string;
    importance?: number;
  }) => Promise<string>;
  displayNotification: (config: {
    title?: string;
    body?: string;
    android?: {
      channelId: string;
      smallIcon?: string;
      pressAction?: {
        id: string;
      };
    };
  }) => Promise<void>;
  requestPermission?: () => Promise<void>;
  AndroidImportance?: {
    HIGH: number;
    DEFAULT: number;
  };
};

let messagingModule: FirebaseMessagingModule | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  messagingModule = require('@react-native-firebase/messaging').default;
} catch {
  console.log(
    '[FCM] @react-native-firebase/messaging is not installed yet — push token retrieval will be skipped. See src/services/notifications.ts for setup steps.',
  );
}

let notifeeModule: NotifeeModule | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  notifeeModule = require('@notifee/react-native').default;
} catch {
  console.log(
    '[FCM] @notifee/react-native is not installed — foreground notifications will be logged only.',
  );
}

let foregroundChannelId: string | null = null;

const isFirebaseAvailable = (): boolean => messagingModule !== null;

const currentPlatform = (): DevicePlatform => {
  if (Platform.OS === 'ios') return 'IOS';
  if (Platform.OS === 'android') return 'ANDROID';
  return 'WEB';
};

const ensureNotificationPermission = async (): Promise<boolean> => {
  if (!messagingModule) {
    return false;
  }

  try {
    const status = await messagingModule().requestPermission();
    const { AUTHORIZED, PROVISIONAL } = messagingModule.AuthorizationStatus;
    return status === AUTHORIZED || status === PROVISIONAL;
  } catch (err) {
    console.log('[FCM] iOS permission request failed:', err);
    return false;
  }
};

const ensureForegroundChannel = async (): Promise<string | null> => {
  if (!notifeeModule || Platform.OS !== 'android') {
    return null;
  }

  if (foregroundChannelId) {
    return foregroundChannelId;
  }

  const importance = notifeeModule.AndroidImportance?.HIGH ?? 4;
  foregroundChannelId = await notifeeModule.createChannel({
    id: 'fcm-default',
    name: 'Notifications',
    importance,
  });

  return foregroundChannelId;
};

const getMessageTitle = (message: RemoteMessage): string | undefined => {
  return message.notification?.title ?? message.data?.title;
};

const getMessageBody = (message: RemoteMessage): string | undefined => {
  return message.notification?.body ?? message.data?.body;
};

const showForegroundNotification = async (
  message: RemoteMessage,
): Promise<void> => {
  const title = getMessageTitle(message);
  const body = getMessageBody(message);

  if (!title && !body) {
    console.log('[FCM] Foreground message received with no title/body.');
    return;
  }

  if (!notifeeModule) {
    console.log('[FCM] Foreground message:', { title, body, data: message.data });
    return;
  }

  if (notifeeModule.requestPermission) {
    await notifeeModule.requestPermission();
  }

  const channelId = (await ensureForegroundChannel()) ?? 'default';

  await notifeeModule.displayNotification({
    title,
    body,
    android: {
      channelId,
      smallIcon: 'ic_launcher',
      pressAction: { id: 'default' },
    },
  });
};

export const getFcmToken = async (): Promise<string | null> => {
  if (!isFirebaseAvailable()) {
    return null;
  }

  const granted = await ensureNotificationPermission();
  if (!granted) {
    console.log('[FCM] Notification permission not granted — skipping token fetch.');
    return null;
  }

  try {
    const token = await messagingModule!().getToken();
    return token ?? null;
  } catch (err) {
    console.log('[FCM] Failed to obtain device token:', err);
    return null;
  }
};

// POST /api/v1/notification/devices — register/refresh the FCM token for this user/device.
// Idempotent: re-posting the same token just refreshes lastSeenAt.
export const registerDeviceTokenWithNotificationService = async (
  profileId: string,
  token: string,
): Promise<void> => {
  const platform = currentPlatform();

  console.log(
    `[FCM] Registering device token (platform=${platform}, profileId=${profileId}).`,
  );

  try {
    await axiosClient.post('/api/v1/notification/devices', {
      profileId,
      deviceToken: token,
      platform,
    });
    await AsyncStorage.setItem(DEVICE_TOKEN_STORAGE_KEY, token);
  } catch (err) {
    console.log('[FCM] Failed to register device token:', err);
  }
};

// DELETE /api/v1/notification/devices/{deviceToken} — call on logout so the user stops
// receiving pushes on this device.
export const deregisterDeviceTokenWithNotificationService = async (): Promise<void> => {
  const token = await AsyncStorage.getItem(DEVICE_TOKEN_STORAGE_KEY);
  if (!token) {
    return;
  }

  try {
    await axiosClient.delete(
      `/api/v1/notification/devices/${encodeURIComponent(token)}`,
    );
  } catch (err) {
    // 404 = already gone; nothing to clean up.
    console.log('[FCM] Failed to deregister device token:', err);
  } finally {
    await AsyncStorage.removeItem(DEVICE_TOKEN_STORAGE_KEY);
  }
};

export const syncDeviceTokenAfterLogin = async (
  profileId: string,
): Promise<void> => {
  if (!profileId) {
    return;
  }
  const token = await getFcmToken();
  if (!token) {
    return;
  }
  await registerDeviceTokenWithNotificationService(profileId, token);
};

export const syncDeviceTokenOnLogout = async (): Promise<void> => {
  await deregisterDeviceTokenWithNotificationService();
};

export const listenForForegroundNotifications = (): (() => void) | null => {
  if (!messagingModule) {
    return null;
  }

  return messagingModule().onMessage(async message => {
    console.log('[FCM] Foreground message received:', {
      messageId: message.messageId,
      notification: message.notification,
      data: message.data,
    });
    await showForegroundNotification(message);
  });
};
