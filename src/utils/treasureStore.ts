import AsyncStorage from '@react-native-async-storage/async-storage';

import { SEED_TREASURES } from '@/constants/treasures';
import type { Treasure, TreasureCategoryId } from '@/types';

const STORAGE_KEY = '@treasure_box_items';
const SEED_FLAG_KEY = '@treasure_box_seeded';

const sortNewestFirst = (items: Treasure[]): Treasure[] =>
  [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

/**
 * Load all treasures. On the very first run we seed a few sample treasures so
 * the safe space never feels empty. Seeding is one-shot: if the user later
 * deletes everything, we don't re-seed.
 */
export const loadTreasures = async (): Promise<Treasure[]> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw != null) {
      const parsed = JSON.parse(raw) as Treasure[];
      return sortNewestFirst(parsed);
    }

    const alreadySeeded = await AsyncStorage.getItem(SEED_FLAG_KEY);
    if (alreadySeeded === 'true') {
      return [];
    }

    await AsyncStorage.multiSet([
      [STORAGE_KEY, JSON.stringify(SEED_TREASURES)],
      [SEED_FLAG_KEY, 'true'],
    ]);
    return sortNewestFirst(SEED_TREASURES);
  } catch {
    return [];
  }
};

const persist = async (items: Treasure[]): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const addTreasure = async (input: {
  category: TreasureCategoryId;
  content: string;
  emoji: string;
}): Promise<Treasure[]> => {
  const current = await loadTreasures();
  const treasure: Treasure = {
    id: `t-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    category: input.category,
    content: input.content.trim(),
    emoji: input.emoji,
    createdAt: new Date().toISOString(),
  };
  const next = sortNewestFirst([treasure, ...current]);
  await persist(next);
  return next;
};

export const deleteTreasure = async (id: string): Promise<Treasure[]> => {
  const current = await loadTreasures();
  const next = current.filter(item => item.id !== id);
  await persist(next);
  return next;
};

/** Picks a random treasure for the "Xoa dịu tôi" grounding moment. */
export const pickRandomTreasure = (items: Treasure[]): Treasure | null => {
  if (items.length === 0) {
    return null;
  }
  return items[Math.floor(Math.random() * items.length)];
};
