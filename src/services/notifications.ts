import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationAxiosClient } from '@/api';

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
  };
  AuthorizationStatus: {
    AUTHORIZED: number;
    PROVISIONAL: number;
    DENIED: number;
    NOT_DETERMINED: number;
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

  // Android < 13 grants automatically; Android 13+ permission is requested by
  // the OS as soon as we register for messages. iOS always needs an explicit
  // prompt.
  if (Platform.OS !== 'ios') {
    return true;
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

// POST /api/v1/devices — register/refresh the FCM token for this user/device.
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
    await notificationAxiosClient.post('/api/v1/devices', {
      profileId,
      deviceToken: token,
      platform,
    });
    await AsyncStorage.setItem(DEVICE_TOKEN_STORAGE_KEY, token);
  } catch (err) {
    console.log('[FCM] Failed to register device token:', err);
  }
};

// DELETE /api/v1/devices/{deviceToken} — call on logout so the user stops
// receiving pushes on this device.
export const deregisterDeviceTokenWithNotificationService = async (): Promise<void> => {
  const token = await AsyncStorage.getItem(DEVICE_TOKEN_STORAGE_KEY);
  if (!token) {
    return;
  }

  try {
    await notificationAxiosClient.delete(
      `/api/v1/devices/${encodeURIComponent(token)}`,
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
