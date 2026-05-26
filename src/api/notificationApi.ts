/**
 * Notification Service client.
 *
 * Talks to the uMatter Notification Service — see
 * docs/NOTIFICATION_API_CONTROLLER_REFERENCE.md for the full endpoint spec.
 *
 * Endpoints used here:
 *   GET  /api/v1/notification/notifications/{profileId}            -> getNotifications()
 *   PUT  /api/v1/notification/notifications/{notificationId}/read  -> markAsRead(id)
 *   PUT  /api/v1/notification/notifications/{profileId}/read-all   -> markAllAsRead()
 *
 * Endpoints the backend does NOT (yet) expose, kept as local-only overlays so
 * the existing UI behaviour still works:
 *   - markAsUnread(id)        — flips `read=true → false` in the local cache
 *   - deleteNotification(id)  — hides the row from the local cache
 *   - getNotificationById(id) — resolved against the locally cached list
 *
 * The signatures match the original mock so screens don't need to change.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosClient from '@/api/axiosClient';

const PROFILE_ID_KEY = 'profileId';

export type NotificationType =
  | 'CHAT'
  | 'REMINDER'
  | 'STREAK'
  | 'INSIGHT'
  | 'BOOKING';

export interface NotificationItem {
  notificationId: string;
  profileId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
}

// Spring Data Page envelope (only the fields we actually need — see the API
// reference, section 4.1).
interface NotificationPage {
  content: NotificationItem[];
  totalElements: number;
  number: number;
  last: boolean;
}

type Listener = () => void;

// Cache of the most recent server response, plus local overlays for actions
// the backend doesn't yet support.
let cache: NotificationItem[] = [];
const locallyUnread = new Set<string>();
const locallyDeleted = new Set<string>();

const listeners = new Set<Listener>();
const notifyListeners = (): void => {
  listeners.forEach(l => l());
};

export const subscribe = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const applyOverlays = (items: NotificationItem[]): NotificationItem[] =>
  items
    .filter(n => !locallyDeleted.has(n.notificationId))
    .map(n =>
      locallyUnread.has(n.notificationId) ? { ...n, read: false } : n,
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

const resolveProfileId = async (): Promise<string | null> => {
  return AsyncStorage.getItem(PROFILE_ID_KEY);
};

// Fetch one page; the API caps `size` at 100. For a long inbox we'd paginate
// — for now a single 100-item page is enough for the screens we render.
const DEFAULT_PAGE_SIZE = 100;

export const getNotifications = async (): Promise<NotificationItem[]> => {
  const profileId = await resolveProfileId();
  if (!profileId) {
    console.log('[notificationApi] No profileId in storage — returning empty inbox.');
    cache = [];
    return [];
  }

  try {
    const res = await axiosClient.get<NotificationPage>(
      `/api/v1/notification/notifications/${profileId}`,
      { params: { page: 0, size: DEFAULT_PAGE_SIZE } },
    );
    cache = res.data?.content ?? [];
    return applyOverlays(cache);
  } catch (err) {
    console.log('[notificationApi] getNotifications failed:', err);
    return applyOverlays(cache);
  }
};

export const getNotificationById = async (
  id: string,
): Promise<NotificationItem | undefined> => {
  // No per-id GET endpoint exists — resolve against the cache, populating it
  // first if the user deep-linked straight to the detail screen.
  let item = applyOverlays(cache).find(n => n.notificationId === id);
  if (item) {
    return item;
  }

  await getNotifications();
  item = applyOverlays(cache).find(n => n.notificationId === id);
  return item;
};

export const markAsRead = async (id: string): Promise<void> => {
  // Optimistic: drop the local-unread overlay (if any) and flip the cache so
  // listeners see the update immediately.
  locallyUnread.delete(id);
  cache = cache.map(n =>
    n.notificationId === id ? { ...n, read: true } : n,
  );
  notifyListeners();

  try {
    await axiosClient.put(`/api/v1/notification/notifications/${id}/read`);
  } catch (err) {
    console.log('[notificationApi] markAsRead failed:', err);
    // 404 is treated as "already gone" per the API doc; we already updated
    // the UI optimistically so there's nothing to roll back.
  }
};

export const markAllAsRead = async (): Promise<void> => {
  const profileId = await resolveProfileId();
  if (!profileId) return;

  locallyUnread.clear();
  cache = cache.map(n => ({ ...n, read: true }));
  notifyListeners();

  try {
    await axiosClient.put(
      `/api/v1/notification/notifications/${profileId}/read-all`,
    );
  } catch (err) {
    console.log('[notificationApi] markAllAsRead failed:', err);
  }
};

// TODO(backend): the Notification Service does not expose a "mark as unread"
// endpoint. We track the override locally so the UI still works; this state
// is wiped on app reload.
export const markAsUnread = async (id: string): Promise<void> => {
  locallyUnread.add(id);
  cache = cache.map(n =>
    n.notificationId === id ? { ...n, read: false } : n,
  );
  notifyListeners();
};

// TODO(backend): the Notification Service does not expose a delete endpoint.
// We hide the row locally; it will reappear on the next cold start until the
// backend grows a real DELETE.
export const deleteNotification = async (id: string): Promise<void> => {
  locallyDeleted.add(id);
  locallyUnread.delete(id);
  notifyListeners();
};

export const getUnreadCount = async (): Promise<number> => {
  // The API doc recommends deriving this client-side from the inbox until/if
  // a dedicated endpoint is added.
  const items = applyOverlays(cache);
  return items.filter(n => !n.read).length;
};

// Wipe local caches/overlays — call this on logout to avoid leaking the
// previous user's state into the next session.
export const resetNotificationCache = (): void => {
  cache = [];
  locallyUnread.clear();
  locallyDeleted.clear();
  notifyListeners();
};
