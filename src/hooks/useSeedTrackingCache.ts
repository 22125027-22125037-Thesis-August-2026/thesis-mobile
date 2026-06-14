import { useContext, useEffect, useRef } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { diaryApi, foodApi, sleepApi, stepsApi } from '@/api';
import { getTodayTrackingStatus, seedCacheFromStatus } from '@/utils';

const todayDateKey = (): string => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

/**
 * Fetches today's tracking status from the server and seeds the popup cache
 * once per calendar day. Call this at the navigator level (e.g. MainTabNavigator)
 * so the cache is accurate before the user opens any tracking screen,
 * regardless of whether they visit ProfileScreen first.
 */
export const useSeedTrackingCache = (): void => {
  const authContext = useContext(AuthContext);
  const profileId = authContext?.userInfo?.profileId;
  const seededDateRef = useRef('');

  useEffect(() => {
    if (!profileId) return;

    const today = todayDateKey();
    if (seededDateRef.current === today) return;

    // Non-blocking: fire and forget — errors are silently ignored because this
    // is background housekeeping; the popup degrades gracefully to count=0.
    Promise.allSettled([
      diaryApi.getDiaryEntries(profileId),
      foodApi.getAllFoodLogs(profileId),
      sleepApi.getAllSleepLogs(profileId),
      stepsApi.getAllStepLogs(profileId),
    ]).then(([diaryRes, foodRes, sleepRes, stepsRes]) => {
      const status = getTodayTrackingStatus(
        diaryRes.status === 'fulfilled' ? diaryRes.value : [],
        foodRes.status === 'fulfilled' ? foodRes.value : [],
        sleepRes.status === 'fulfilled' ? sleepRes.value : [],
        stepsRes.status === 'fulfilled' ? stepsRes.value : [],
      );
      seedCacheFromStatus(status);
      seededDateRef.current = today;
    });
  }, [profileId]);
};
