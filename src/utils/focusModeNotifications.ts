import notifee, { TriggerType } from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Constants ────────────────────────────────────────────────────────────────

const CHANNEL_ID = 'focus_mode_channel';
const KEY_ENABLED = '@focus_mode_enabled';
const KEY_IDS = '@focus_mode_notification_ids';
const KEY_QUIET = '@focus_mode_quiet_hours';

const INTERVAL_MIN = 90;

// iOS allows at most 64 pending local notifications per app.
// We schedule 30 per notification type (60 total), covering ≈ 3 active days.
const MAX_PER_TYPE = 30;
const SCHEDULE_DAYS = 7; // look-ahead window; capped by MAX_PER_TYPE

export type QuietHours = {
  /** Hour to stop sending (0–23). Default 22 = 10 PM. */
  start: number;
  /** Hour to resume sending (0–23). Default 7 = 7 AM. */
  end: number;
};

const DEFAULT_QUIET: QuietHours = { start: 22, end: 7 };

// ─── Quiet-hours helpers ──────────────────────────────────────────────────────

function isQuiet(date: Date, q: QuietHours): boolean {
  const h = date.getHours();
  // quiet window spans midnight (e.g. 22→7): quiet if h >= start OR h < end
  return q.start > q.end
    ? h >= q.start || h < q.end
    : h >= q.start && h < q.end;
}

/** If `date` falls inside quiet hours, advance it to q.end:00 the next morning. */
function skipQuiet(date: Date, q: QuietHours): Date {
  if (!isQuiet(date, q)) return date;
  const next = new Date(date);
  if (next.getHours() >= q.start) {
    next.setDate(next.getDate() + 1); // already past midnight, move to tomorrow
  }
  next.setHours(q.end, 0, 0, 0);
  return next;
}

function buildSchedule(from: Date, q: QuietHours): Date[] {
  const horizon = new Date(from.getTime() + SCHEDULE_DAYS * 86_400_000);
  const slots: Date[] = [];
  let cursor = skipQuiet(new Date(from.getTime() + INTERVAL_MIN * 60_000), q);

  while (cursor < horizon && slots.length < MAX_PER_TYPE) {
    slots.push(new Date(cursor));
    cursor = skipQuiet(new Date(cursor.getTime() + INTERVAL_MIN * 60_000), q);
  }
  return slots;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getQuietHours(): Promise<QuietHours> {
  try {
    const raw = await AsyncStorage.getItem(KEY_QUIET);
    return raw ? (JSON.parse(raw) as QuietHours) : DEFAULT_QUIET;
  } catch {
    return DEFAULT_QUIET;
  }
}

export async function setQuietHours(q: QuietHours): Promise<void> {
  await AsyncStorage.setItem(KEY_QUIET, JSON.stringify(q));
}

export async function getFocusModeEnabled(): Promise<boolean> {
  return (await AsyncStorage.getItem(KEY_ENABLED)) === 'true';
}

/**
 * Schedules up to MAX_PER_TYPE × 2 TimestampTrigger notifications for the next
 * SCHEDULE_DAYS, skipping the configured quiet hours window each night.
 */
export async function scheduleFocusModeNotifications(): Promise<void> {
  await notifee.requestPermission();
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: 'Chế độ tập trung',
    description: 'Nhắc nhở nhẹ nhàng từ Focus Mode',
  });

  await _cancelAll();

  const quiet = await getQuietHours();
  const slots = buildSchedule(new Date(), quiet);
  const ids: string[] = [];

  for (const slot of slots) {
    const ts = slot.getTime();

    await notifee.createTriggerNotification(
      {
        id: `fw_${ts}`,
        title: 'Nhắc nhở nhẹ 💚',
        body: 'Nhắc nhở nhẹ: Hãy uống một ngụm nước và hít thở sâu nhé!',
        android: { channelId: CHANNEL_ID, pressAction: { id: 'default' } },
        ios: { sound: 'default' },
      },
      { type: TriggerType.TIMESTAMP, timestamp: ts },
    );

    await notifee.createTriggerNotification(
      {
        id: `fe_${ts}`,
        title: 'Cập nhật cảm xúc 💙',
        body: 'Đừng quên ghi lại cảm xúc của bạn hôm nay nhé!',
        data: { target: 'diary-new' },
        android: { channelId: CHANNEL_ID, pressAction: { id: 'default' } },
        ios: { sound: 'default' },
      },
      { type: TriggerType.TIMESTAMP, timestamp: ts },
    );

    ids.push(`fw_${ts}`, `fe_${ts}`);
  }

  await AsyncStorage.setItem(KEY_IDS, JSON.stringify(ids));
  await AsyncStorage.setItem(KEY_ENABLED, 'true');
}

export async function cancelFocusModeNotifications(): Promise<void> {
  await _cancelAll();
  await AsyncStorage.setItem(KEY_ENABLED, 'false');
}

/**
 * Called on every app launch. If focus mode is on but fewer than 6 triggers
 * remain (< 3 upcoming slots), re-schedules to keep the queue full.
 */
export async function rescheduleFocusModeIfNeeded(): Promise<void> {
  if (!(await getFocusModeEnabled())) return;
  try {
    const raw = await AsyncStorage.getItem(KEY_IDS);
    const storedIds: string[] = raw ? JSON.parse(raw) : [];
    const activeIds = await notifee.getTriggerNotificationIds();
    const remaining = storedIds.filter(id => activeIds.includes(id));
    if (remaining.length < 6) {
      await scheduleFocusModeNotifications();
    }
  } catch {
    await scheduleFocusModeNotifications();
  }
}

// ─── Internal ─────────────────────────────────────────────────────────────────

async function _cancelAll(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(KEY_IDS);
    const ids: string[] = raw ? JSON.parse(raw) : [];
    if (ids.length) {
      await Promise.all(ids.map(id => notifee.cancelTriggerNotification(id)));
    }
  } catch {
    await notifee.cancelTriggerNotifications();
  }
  await AsyncStorage.removeItem(KEY_IDS);
}
