/**
 * Mock notification "API".
 *
 * Operates on an in-memory store seeded from `mock/notifications.json` so the
 * screens can be wired up before the backend exists.
 *
 * TODO(backend): replace every function in this file with real HTTP calls
 * (axiosClient). The function signatures intentionally mirror what the eventual
 * REST endpoints will look like:
 *   GET    /notifications              -> getNotifications()
 *   PATCH  /notifications/:id/read     -> markAsRead(id)
 *   PATCH  /notifications/:id/unread   -> markAsUnread(id)
 *   DELETE /notifications/:id          -> deleteNotification(id)
 */

import mockNotifications from '../../mock/notifications.json';

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

type Listener = () => void;

// TODO(backend): drop this store — the server is the source of truth.
let store: NotificationItem[] = (
  mockNotifications as { content: NotificationItem[] }
).content.map(n => ({ ...n }));

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

// Simulated latency so callers don't accidentally rely on synchronous behavior.
const FAKE_LATENCY_MS = 120;
const delay = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

export const getNotifications = async (): Promise<NotificationItem[]> => {
  // TODO(backend): GET /notifications  (paginate + sort server-side)
  await delay(FAKE_LATENCY_MS);
  return [...store].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
};

export const getNotificationById = async (
  id: string,
): Promise<NotificationItem | undefined> => {
  // TODO(backend): GET /notifications/:id
  await delay(FAKE_LATENCY_MS);
  return store.find(n => n.notificationId === id);
};

export const markAsRead = async (id: string): Promise<void> => {
  // TODO(backend): PATCH /notifications/:id/read
  await delay(FAKE_LATENCY_MS);
  store = store.map(n =>
    n.notificationId === id ? { ...n, read: true } : n,
  );
  notifyListeners();
};

export const markAsUnread = async (id: string): Promise<void> => {
  // TODO(backend): PATCH /notifications/:id/unread
  await delay(FAKE_LATENCY_MS);
  store = store.map(n =>
    n.notificationId === id ? { ...n, read: false } : n,
  );
  notifyListeners();
};

export const deleteNotification = async (id: string): Promise<void> => {
  // TODO(backend): DELETE /notifications/:id
  await delay(FAKE_LATENCY_MS);
  store = store.filter(n => n.notificationId !== id);
  notifyListeners();
};

export const getUnreadCount = async (): Promise<number> => {
  // TODO(backend): GET /notifications/unread-count
  await delay(FAKE_LATENCY_MS);
  return store.filter(n => !n.read).length;
};
