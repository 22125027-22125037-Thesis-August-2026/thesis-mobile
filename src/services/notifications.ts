import { Platform } from 'react-native';
import { axiosClient } from '@/api';

// ============================================================================
// Firebase Cloud Messaging (FCM) integration
// ----------------------------------------------------------------------------
// Producer services (Booking, Tracking, Social) publish notification events
// that need to be delivered to the user's device. To target a device we need
// its FCM registration token, which the mobile app obtains from the Firebase
// SDK at runtime and forwards to the Auth/User service.
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

// ---------------------------------------------------------------------------
// MOCK: forward the FCM token to the Auth service.
// ---------------------------------------------------------------------------
// The Auth service does not yet have a column to persist the device token,
// so this call is intentionally stubbed. The token is logged so it can be
// copied into the backend manually during development.
//
// When the backend endpoint lands, delete the mock log block and uncomment
// the real POST below. The expected contract (adjust as the backend defines):
//
//   POST /api/v1/auth/device-tokens
//   Body: { token: string, platform: 'ios' | 'android' | 'other' }
//   Auth: bearer token (already attached by axiosClient interceptor)
// ---------------------------------------------------------------------------
export const registerDeviceTokenWithAuthService = async (
  token: string,
): Promise<void> => {
  const platform: 'ios' | 'android' | 'other' =
    Platform.OS === 'ios' || Platform.OS === 'android' ? Platform.OS : 'other';

  // ---- MOCK START ----------------------------------------------------------
  console.log('[FCM] Device token ready (mock — not yet sent to Auth service):');
  console.log(`[FCM]   platform=${platform}`);
  console.log(`[FCM]   token=${token}`);
  console.log(
    '[FCM] TODO: wire POST /api/v1/auth/device-tokens once the Auth service column exists.',
  );
  // ---- MOCK END ------------------------------------------------------------

  // ---- REAL CALL (enable when Auth service is ready) -----------------------
  // try {
  //   await axiosClient.post('/api/v1/auth/device-tokens', { token, platform });
  // } catch (err) {
  //   console.log('[FCM] Failed to register device token with Auth service:', err);
  // }
  // --------------------------------------------------------------------------

  // Reference axiosClient so the import survives lint until the real call is
  // enabled. Remove this line when uncommenting the POST above.
  void axiosClient;
};

export const syncDeviceTokenAfterLogin = async (): Promise<void> => {
  const token = await getFcmToken();
  if (!token) {
    return;
  }
  await registerDeviceTokenWithAuthService(token);
};
