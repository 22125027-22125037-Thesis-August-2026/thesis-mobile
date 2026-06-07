import { useCallback, useEffect, useState } from 'react';

import { breathingApi, diaryApi, foodApi, sleepApi, stepsApi } from '@/api';
import { BREATHING_DAILY_GOAL_SECONDS } from '@/constants/breathing';
import { SATIETY_UI_MAP } from '@/constants/food';
import { MoodTag } from '@/constants/moods';
import { getTodaySteps } from '@/services/stepTracker';
import {
  BreathingLogResponse,
  FoodLogResponse,
  SleepLogResponse,
  StepLogResponse,
} from '@/types';
import { calculateStreakFromCreatedAt } from '@/utils';

export const WATER_DAILY_GOAL = 8;
export const STEPS_DAILY_GOAL = 6000;
export const BREATHING_DAILY_GOAL_MINUTES = Math.round(
  BREATHING_DAILY_GOAL_SECONDS / 60,
);

export type NutritionStatus = 'tot' | 'binhThuong' | 'canCaiThien';

export interface HomeDashboardData {
  sleep: { hours: number[]; avg: number };
  diary: { moods: (MoodTag | null)[]; streak: number };
  nutrition: {
    waterCups: number;
    waterGoal: number;
    weekScore: number;
    status: NutritionStatus;
  };
  steps: { days: number[]; today: number; goal: number };
  breathing: { minutes: number[]; today: number; goalMinutes: number };
  isLoading: boolean;
  refetch: () => Promise<void>;
}

const EMPTY_7: number[] = [0, 0, 0, 0, 0, 0, 0];
const EMPTY_MOODS: (MoodTag | null)[] = [null, null, null, null, null, null, null];

// Uses local calendar date (not UTC) to match backend's entryDate format
const toLocalDateKey = (date: Date): string => {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const buildLast7DayKeys = (): string[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const keys: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    keys.push(toLocalDateKey(d));
  }
  return keys;
};

const resolveSleepDateKey = (log: SleepLogResponse): string | null => {
  if (log.entryDate) return log.entryDate;
  // Match SleepMainScreen: use wakeTime (the morning you got up), not bedTime
  if (log.wakeTime) return toLocalDateKey(new Date(log.wakeTime));
  return null;
};

const deriveStatus = (weekScore: number): NutritionStatus => {
  if (weekScore >= 4) return 'tot';
  if (weekScore >= 3) return 'binhThuong';
  return 'canCaiThien';
};

export const useHomeDashboardData = (
  profileId: string | undefined,
): HomeDashboardData => {
  const [sleepHours, setSleepHours] = useState<number[]>(EMPTY_7);
  const [sleepAvg, setSleepAvg] = useState<number>(0);
  const [diaryMoods, setDiaryMoods] = useState<(MoodTag | null)[]>(EMPTY_MOODS);
  const [diaryStreak, setDiaryStreak] = useState<number>(0);
  const [waterCups, setWaterCups] = useState<number>(0);
  const [weekScore, setWeekScore] = useState<number>(0);
  const [status, setStatus] = useState<NutritionStatus>('canCaiThien');
  const [stepDays, setStepDays] = useState<number[]>(EMPTY_7);
  const [stepsToday, setStepsToday] = useState<number>(0);
  const [breathingMinutes, setBreathingMinutes] = useState<number[]>(EMPTY_7);
  const [breathingToday, setBreathingToday] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refetch = useCallback(async (): Promise<void> => {
    if (!profileId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const dayKeys = buildLast7DayKeys();
    const todayKey = dayKeys[dayKeys.length - 1];
    const startKey = dayKeys[0];

    const [sleepRes, diaryRes, foodRes, stepsRes, breathingRes] = await Promise.allSettled([
      sleepApi.getAllSleepLogs(profileId),
      diaryApi.getDiaryEntries(profileId),
      foodApi.getFoodLogs(profileId, startKey, todayKey),
      stepsApi.getStepLogsInRange(profileId, startKey, todayKey),
      breathingApi.getBreathingLogsInRange(profileId, startKey, todayKey),
    ]);

    // Log any failures for debugging
    if (sleepRes.status === 'rejected') console.error('[Dashboard] sleep fetch failed:', sleepRes.reason);
    if (diaryRes.status === 'rejected') console.error('[Dashboard] diary fetch failed:', diaryRes.reason);
    if (foodRes.status === 'rejected') console.error('[Dashboard] food fetch failed:', foodRes.reason);
    if (stepsRes.status === 'rejected') console.error('[Dashboard] steps fetch failed:', stepsRes.reason);
    if (breathingRes.status === 'rejected') console.error('[Dashboard] breathing fetch failed:', breathingRes.reason);

    // Sleep
    if (sleepRes.status === 'fulfilled') {
      const minutesByDay = new Map<string, number>();
      sleepRes.value.forEach(log => {
        const key = resolveSleepDateKey(log);
        if (!key) return;
        const prev = minutesByDay.get(key) ?? 0;
        minutesByDay.set(key, prev + (log.durationMinutes ?? 0));
      });
      const hours = dayKeys.map(k => {
        const minutes = minutesByDay.get(k) ?? 0;
        return Math.round((minutes / 60) * 10) / 10;
      });
      const nonZero = hours.filter(h => h > 0);
      const avg = nonZero.length === 0
        ? 0
        : Math.round((nonZero.reduce((s, v) => s + v, 0) / nonZero.length) * 10) / 10;
      setSleepHours(hours);
      setSleepAvg(avg);
    } else {
      setSleepHours(EMPTY_7);
      setSleepAvg(0);
    }

    // Diary moods
    if (diaryRes.status === 'fulfilled') {
      const byDay = new Map<string, { tag: string | undefined; createdAt: string }>();
      diaryRes.value.forEach(entry => {
        const key = entry.entryDate;
        if (!key) return;
        const existing = byDay.get(key);
        if (!existing || new Date(entry.createdAt) > new Date(existing.createdAt)) {
          byDay.set(key, { tag: entry.moodTag, createdAt: entry.createdAt });
        }
      });
      const moods: (MoodTag | null)[] = dayKeys.map(k => {
        const entry = byDay.get(k);
        const tag = entry?.tag;
        if (tag === 'TERRIBLE' || tag === 'BAD' || tag === 'NEUTRAL' || tag === 'GOOD' || tag === 'EXCELLENT') {
          return tag;
        }
        return null;
      });
      setDiaryMoods(moods);
    } else {
      setDiaryMoods(EMPTY_MOODS);
    }

    // Streak: computed from diary createdAt dates (immune to backdating)
    if (diaryRes.status === 'fulfilled') {
      setDiaryStreak(calculateStreakFromCreatedAt(diaryRes.value));
    }

    // Nutrition
    if (foodRes.status === 'fulfilled') {
      const logs: FoodLogResponse[] = foodRes.value;
      const todayLogs = logs.filter(l => l.entryDate === todayKey);
      const cups = todayLogs.reduce((sum, l) => sum + (l.waterGlasses ?? 0), 0);
      const scores = logs
        .map(l => SATIETY_UI_MAP[l.satietyLevel]?.value)
        .filter((v): v is number => typeof v === 'number');
      const avg = scores.length === 0
        ? 0
        : Math.round((scores.reduce((s, v) => s + v, 0) / scores.length) * 10) / 10;
      setWaterCups(cups);
      setWeekScore(avg);
      setStatus(deriveStatus(avg));
    } else {
      setWaterCups(0);
      setWeekScore(0);
      setStatus('canCaiThien');
    }

    // Steps: map logged counts onto the 7 day keys by entryDate (latest wins)
    let mappedToday = 0;
    if (stepsRes.status === 'fulfilled') {
      const stepsByDay = new Map<string, { count: number; updatedAt: string }>();
      stepsRes.value.forEach((log: StepLogResponse) => {
        const key = log.entryDate;
        if (!key) return;
        const existing = stepsByDay.get(key);
        if (!existing || new Date(log.updatedAt) > new Date(existing.updatedAt)) {
          stepsByDay.set(key, { count: log.stepCount ?? 0, updatedAt: log.updatedAt });
        }
      });
      const days = dayKeys.map(k => stepsByDay.get(k)?.count ?? 0);
      mappedToday = stepsByDay.get(todayKey)?.count ?? 0;
      setStepDays(days);
    } else {
      setStepDays(EMPTY_7);
    }

    // Prefer the live sensor reading so the card reflects today's steps even
    // before a sync round-trips to the backend.
    try {
      const liveToday = await getTodaySteps();
      setStepsToday(Math.max(liveToday, mappedToday));
    } catch {
      setStepsToday(mappedToday);
    }

    // Breathing: total seconds per day -> minutes (latest log per entryDate wins)
    if (breathingRes.status === 'fulfilled') {
      const secondsByDay = new Map<string, { seconds: number; updatedAt: string }>();
      breathingRes.value.forEach((log: BreathingLogResponse) => {
        const key = log.entryDate;
        if (!key) return;
        const existing = secondsByDay.get(key);
        if (!existing || new Date(log.updatedAt) > new Date(existing.updatedAt)) {
          secondsByDay.set(key, {
            seconds: log.totalDurationSeconds ?? 0,
            updatedAt: log.updatedAt,
          });
        }
      });
      const minutes = dayKeys.map(k =>
        Math.round((secondsByDay.get(k)?.seconds ?? 0) / 60),
      );
      setBreathingMinutes(minutes);
      setBreathingToday(Math.round((secondsByDay.get(todayKey)?.seconds ?? 0) / 60));
    } else {
      setBreathingMinutes(EMPTY_7);
      setBreathingToday(0);
    }

    setIsLoading(false);
  }, [profileId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  // Reflect the live today count in the last bar so the chart matches the subtitle.
  const stepDaysWithToday = stepDays.length === 7
    ? [...stepDays.slice(0, 6), Math.max(stepDays[6] ?? 0, stepsToday)]
    : stepDays;

  return {
    sleep: { hours: sleepHours, avg: sleepAvg },
    diary: { moods: diaryMoods, streak: diaryStreak },
    nutrition: { waterCups, waterGoal: WATER_DAILY_GOAL, weekScore, status },
    steps: { days: stepDaysWithToday, today: stepsToday, goal: STEPS_DAILY_GOAL },
    breathing: {
      minutes: breathingMinutes,
      today: breathingToday,
      goalMinutes: BREATHING_DAILY_GOAL_MINUTES,
    },
    isLoading,
    refetch,
  };
};
