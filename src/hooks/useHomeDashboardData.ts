import { useCallback, useEffect, useState } from 'react';

import { diaryApi, foodApi, sleepApi } from '@/api';
import { SATIETY_UI_MAP } from '@/constants/food';
import { MoodTag } from '@/constants/moods';
import { FoodLogResponse, SleepLogResponse } from '@/types';
import { calculateStreakFromCreatedAt } from '@/utils';

export const WATER_DAILY_GOAL = 8;

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

    const [sleepRes, diaryRes, foodRes] = await Promise.allSettled([
      sleepApi.getAllSleepLogs(profileId),
      diaryApi.getDiaryEntries(profileId),
      foodApi.getFoodLogs(profileId, startKey, todayKey),
    ]);

    // Log any failures for debugging
    if (sleepRes.status === 'rejected') console.error('[Dashboard] sleep fetch failed:', sleepRes.reason);
    if (diaryRes.status === 'rejected') console.error('[Dashboard] diary fetch failed:', diaryRes.reason);
    if (foodRes.status === 'rejected') console.error('[Dashboard] food fetch failed:', foodRes.reason);

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

    setIsLoading(false);
  }, [profileId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return {
    sleep: { hours: sleepHours, avg: sleepAvg },
    diary: { moods: diaryMoods, streak: diaryStreak },
    nutrition: { waterCups, waterGoal: WATER_DAILY_GOAL, weekScore, status },
    isLoading,
    refetch,
  };
};
