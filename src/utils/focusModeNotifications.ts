import notifee, { TriggerType, TimeUnit } from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CHANNEL_ID = 'focus_mode_channel';
const STORAGE_KEY = '@focus_mode_enabled';

const ID_WELLNESS = 'focus_wellness';
const ID_EMOTION = 'focus_emotion';

async function ensureAndroidChannel(): Promise<void> {
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: 'Chế độ tập trung',
    description: 'Nhắc nhở nhẹ nhàng từ Focus Mode',
  });
}

export async function scheduleFocusModeNotifications(): Promise<void> {
  await notifee.requestPermission();
  await ensureAndroidChannel();

  const trigger = {
    type: TriggerType.INTERVAL as const,
    interval: 90,
    timeUnit: TimeUnit.MINUTES,
  };

  await notifee.createTriggerNotification(
    {
      id: ID_WELLNESS,
      title: 'Nhắc nhở nhẹ 💚',
      body: 'Nhắc nhở nhẹ: Hãy uống một ngụm nước và hít thở sâu nhé!',
      android: { channelId: CHANNEL_ID, pressAction: { id: 'default' } },
      ios: { sound: 'default' },
    },
    trigger,
  );

  await notifee.createTriggerNotification(
    {
      id: ID_EMOTION,
      title: 'Cập nhật cảm xúc 💙',
      body: 'Đừng quên ghi lại cảm xúc của bạn hôm nay nhé!',
      data: { target: 'diary-new' },
      android: { channelId: CHANNEL_ID, pressAction: { id: 'default' } },
      ios: { sound: 'default' },
    },
    trigger,
  );

  await AsyncStorage.setItem(STORAGE_KEY, 'true');
}

export async function cancelFocusModeNotifications(): Promise<void> {
  await notifee.cancelTriggerNotification(ID_WELLNESS);
  await notifee.cancelTriggerNotification(ID_EMOTION);
  await AsyncStorage.setItem(STORAGE_KEY, 'false');
}

export async function getFocusModeEnabled(): Promise<boolean> {
  const value = await AsyncStorage.getItem(STORAGE_KEY);
  return value === 'true';
}
