/**
 * Lightweight in-memory record of which daily tracking categories the user has
 * logged today. Resets automatically on a new calendar day.
 *
 * Intentionally module-level (not React state) so any screen can update it
 * without prop-drilling or a provider.
 *
 * Seeding: ProfileScreen calls seedCacheFromStatus() after fetching the real
 * server data on focus, so the cache always reflects the true server state
 * before any popup is shown. markCategoryLogged() then increments from that
 * accurate baseline.
 */

export type TrackingCategory = 'diary' | 'nutrition' | 'sleep' | 'steps';

export interface CelebrationStatus {
  count: number;
  diary: boolean;
  nutrition: boolean;
  sleep: boolean;
  steps: boolean;
}

const todayKey = (): string => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const state: { date: string; logged: Set<TrackingCategory> } = {
  date: '',
  logged: new Set(),
};

/**
 * Seeds the cache with the authoritative server-side status for today.
 * Call this whenever the real tracking data is fetched (e.g. ProfileScreen
 * useFocusEffect). Subsequent markCategoryLogged() calls will increment from
 * this accurate baseline instead of from zero.
 */
export const seedCacheFromStatus = (status: {
  diary: boolean;
  nutrition: boolean;
  sleep: boolean;
  steps: boolean;
}): void => {
  const today = todayKey();
  // Always reset to today before seeding so stale data from a previous day
  // is never accidentally promoted.
  state.date = today;
  state.logged.clear();
  if (status.diary) state.logged.add('diary');
  if (status.nutrition) state.logged.add('nutrition');
  if (status.sleep) state.logged.add('sleep');
  if (status.steps) state.logged.add('steps');
};

/**
 * Records that the user has logged `category` today and returns the updated
 * status. Safe to call multiple times for the same category (idempotent).
 */
export const markCategoryLogged = (
  category: TrackingCategory,
): CelebrationStatus => {
  const today = todayKey();
  if (state.date !== today) {
    state.date = today;
    state.logged.clear();
  }
  state.logged.add(category);
  return buildStatus();
};

const buildStatus = (): CelebrationStatus => ({
  count: state.logged.size,
  diary: state.logged.has('diary'),
  nutrition: state.logged.has('nutrition'),
  sleep: state.logged.has('sleep'),
  steps: state.logged.has('steps'),
});
