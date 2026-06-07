import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@emergency_contact';

export interface EmergencyContact {
  name: string;
  phone: string;
}

/**
 * Personal "trusted person to call" stored locally on the device. Mirrors the
 * emergencyContact collected at registration; can later be synced from
 * /auth/me once the backend returns it.
 */
export const loadEmergencyContact = async (): Promise<EmergencyContact | null> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as EmergencyContact;
    if (!parsed.phone) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

export const saveEmergencyContact = async (
  contact: EmergencyContact,
): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(contact));
};

export const clearEmergencyContact = async (): Promise<void> => {
  await AsyncStorage.removeItem(STORAGE_KEY);
};
