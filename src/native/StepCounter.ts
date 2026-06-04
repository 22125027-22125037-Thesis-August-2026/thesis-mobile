import {
  EmitterSubscription,
  NativeEventEmitter,
  NativeModules,
  Platform,
} from 'react-native';

type StepCounterNative = {
  isStepCountingAvailable: () => Promise<boolean>;
  getCurrentStepCount: () => Promise<number>;
  startUpdates: () => Promise<void>;
  stopUpdates: () => Promise<void>;
  // Present so NativeEventEmitter does not warn (no-ops on the native side).
  addListener: (eventName: string) => void;
  removeListeners: (count: number) => void;
};

const native: StepCounterNative | null =
  Platform.OS === 'android'
    ? ((NativeModules as Record<string, unknown>).StepCounter as StepCounterNative) ?? null
    : null;

const emitter = native ? new NativeEventEmitter(NativeModules.StepCounter) : null;

const STEP_UPDATE_EVENT = 'StepCounterUpdate';

type StepUpdatePayload = {
  steps: number;
};

const logError = (action: string, err: unknown): void => {
  console.log(`[StepCounter] ${action} failed:`, err);
};

export const StepCounter = {
  /** Whether this device exposes a hardware step counter sensor. */
  isAvailable: async (): Promise<boolean> => {
    if (!native) return false;
    try {
      return await native.isStepCountingAvailable();
    } catch (err) {
      logError('isStepCountingAvailable', err);
      return false;
    }
  },

  /** Cumulative steps since the device last booted. */
  getCurrentStepCount: async (): Promise<number> => {
    if (!native) return 0;
    try {
      return await native.getCurrentStepCount();
    } catch (err) {
      logError('getCurrentStepCount', err);
      return 0;
    }
  },

  /**
   * Subscribe to live cumulative-step updates. Starts the native sensor
   * listener on the first subscriber and tears it down on unsubscribe.
   */
  subscribe: (cb: (cumulativeSteps: number) => void): (() => void) => {
    if (!native || !emitter) return () => undefined;

    let subscription: EmitterSubscription | null = emitter.addListener(
      STEP_UPDATE_EVENT,
      (payload: StepUpdatePayload) => cb(payload.steps),
    );

    native.startUpdates().catch(err => logError('startUpdates', err));

    return () => {
      subscription?.remove();
      subscription = null;
      native.stopUpdates().catch(err => logError('stopUpdates', err));
    };
  },
};
