import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Treasure } from '@/types';

// Treasures are persisted on the server (tracking-service) now. This module is a
// thin offline cache so the Treasure Box and the home dashboard can paint
// instantly — and survive a brief offline moment — while the authoritative list
// is refetched. The server always wins; a stale cache is only ever a first paint.
const CACHE_KEY = '@treasure_box_cache';

export const loadCachedTreasures = async (): Promise<Treasure[]> => {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    return raw != null ? (JSON.parse(raw) as Treasure[]) : [];
  } catch {
    return [];
  }
};

export const cacheTreasures = async (items: Treasure[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(items));
  } catch {
    // A failed cache write is non-fatal — the server remains the source of truth.
  }
};

/** Picks a random treasure for the "Xoa dịu tôi" grounding moment. */
export const pickRandomTreasure = (items: Treasure[]): Treasure | null => {
  if (items.length === 0) {
    return null;
  }
  return items[Math.floor(Math.random() * items.length)];
};
