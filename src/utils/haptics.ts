import { Platform, Vibration } from 'react-native';

type HapticTrigger = (
  type: string,
  options?: { enableVibrateFallback?: boolean; ignoreAndroidSystemSettings?: boolean },
) => void;

let hapticTrigger: HapticTrigger | null = null;

try {
  // Optional native module. Project may not have it installed yet —
  // run: `npm install react-native-haptic-feedback` + `cd ios && pod install`
  // to enable the richer iOS Taptic / Android one-shot effects.
  const mod = require('react-native-haptic-feedback');
  hapticTrigger = (mod?.default?.trigger ?? mod?.trigger) as HapticTrigger | null;
} catch {
  hapticTrigger = null;
}

const HAPTIC_OPTIONS = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

export const playSoftHaptic = (): void => {
  if (hapticTrigger) {
    hapticTrigger('impactLight', HAPTIC_OPTIONS);
    return;
  }

  Vibration.vibrate(Platform.OS === 'ios' ? 10 : 15);
};
