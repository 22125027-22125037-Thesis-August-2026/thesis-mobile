import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  TOUR_SEEN_KEY,
  TOUR_STEPS,
  TourStep,
  TourTargetKey,
} from '@/constants/tour';

export interface TargetRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

type MeasureFn = () => Promise<TargetRect | null>;
type ScrollIntoViewFn = (
  key: TourTargetKey,
  measure: MeasureFn | undefined,
) => Promise<void> | void;

interface TourContextValue {
  isActive: boolean;
  stepIndex: number;
  totalSteps: number;
  currentStep: TourStep | null;
  targetRect: TargetRect | null;
  start: (force?: boolean) => Promise<void>;
  next: () => void;
  skip: () => void;
  registerTarget: (key: TourTargetKey, measure: MeasureFn) => void;
  unregisterTarget: (key: TourTargetKey) => void;
  registerScroller: (fn: ScrollIntoViewFn | null) => void;
}

const TourContext = createContext<TourContextValue | null>(null);

const wait = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

export const TourProvider = ({ children }: { children: ReactNode }) => {
  const [isActive, setIsActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);

  const targetsRef = useRef<Map<TourTargetKey, MeasureFn>>(new Map());
  const scrollerRef = useRef<ScrollIntoViewFn | null>(null);
  // Bảo vệ chống race khi nhiều applyStep chạy chồng nhau.
  const applyTokenRef = useRef(0);

  const registerTarget = useCallback((key: TourTargetKey, measure: MeasureFn) => {
    targetsRef.current.set(key, measure);
  }, []);

  const unregisterTarget = useCallback((key: TourTargetKey) => {
    targetsRef.current.delete(key);
  }, []);

  const registerScroller = useCallback((fn: ScrollIntoViewFn | null) => {
    scrollerRef.current = fn;
  }, []);

  const applyStep = useCallback(async (index: number) => {
    const token = ++applyTokenRef.current;
    const step = TOUR_STEPS[index];
    if (!step) {
      return;
    }

    // Bước giới thiệu ở giữa — không cần đo phần tử.
    if (!step.target) {
      setTargetRect(null);
      return;
    }

    // Ẩn spotlight cũ trong lúc cuộn/đo để tránh nhấp nháy lệch vị trí.
    setTargetRect(null);

    const measure = targetsRef.current.get(step.target);

    if (step.scrollIntoView && scrollerRef.current) {
      await scrollerRef.current(step.target, measure);
      await wait(380); // đợi ScrollView ổn định trước khi đo
    }

    if (token !== applyTokenRef.current) {
      return; // đã có bước mới hơn, bỏ kết quả này
    }

    const rect = measure ? await measure() : null;

    if (token !== applyTokenRef.current) {
      return;
    }

    setTargetRect(rect);
  }, []);

  const goToStep = useCallback(
    (index: number) => {
      setStepIndex(index);
      void applyStep(index);
    },
    [applyStep],
  );

  const finish = useCallback(() => {
    applyTokenRef.current++;
    setIsActive(false);
    setTargetRect(null);
    void AsyncStorage.setItem(TOUR_SEEN_KEY, 'true');
  }, []);

  const start = useCallback(
    async (force = false) => {
      if (!force) {
        const seen = await AsyncStorage.getItem(TOUR_SEEN_KEY);
        if (seen === 'true') {
          return;
        }
      }
      setIsActive(true);
      goToStep(0);
    },
    [goToStep],
  );

  const next = useCallback(() => {
    setStepIndex(prev => {
      const nextIndex = prev + 1;
      if (nextIndex >= TOUR_STEPS.length) {
        finish();
        return prev;
      }
      void applyStep(nextIndex);
      return nextIndex;
    });
  }, [applyStep, finish]);

  const skip = useCallback(() => {
    finish();
  }, [finish]);

  const value = useMemo<TourContextValue>(
    () => ({
      isActive,
      stepIndex,
      totalSteps: TOUR_STEPS.length,
      currentStep: isActive ? TOUR_STEPS[stepIndex] ?? null : null,
      targetRect,
      start,
      next,
      skip,
      registerTarget,
      unregisterTarget,
      registerScroller,
    }),
    [
      isActive,
      stepIndex,
      targetRect,
      start,
      next,
      skip,
      registerTarget,
      unregisterTarget,
      registerScroller,
    ],
  );

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
};

export const useTour = (): TourContextValue => {
  const ctx = useContext(TourContext);
  if (!ctx) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return ctx;
};

export { TourContext };
