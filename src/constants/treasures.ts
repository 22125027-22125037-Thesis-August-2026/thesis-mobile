import { COLORS } from '@/theme';
import type { Treasure, TreasureCategoryId } from '@/types';

export interface TreasureCategory {
  id: TreasureCategoryId;
  label: string; // Vietnamese label, shown to the user
  emoji: string; // default emoji used when an item has none
  icon: string; // MaterialCommunityIcons name
  color: string; // accent color for the category
  tintSoft: string; // soft background tint
  prompt: string; // gentle placeholder/encouragement when adding
}

export const TREASURE_CATEGORIES: TreasureCategory[] = [
  {
    id: 'reasons',
    label: 'Lý do bước tiếp',
    emoji: '🌅',
    icon: 'white-balance-sunny',
    color: COLORS.comfortGold,
    tintSoft: COLORS.comfortGoldSoft,
    prompt: 'Điều gì khiến bạn muốn thức dậy vào ngày mai?',
  },
  {
    id: 'joy',
    label: 'Niềm vui nhỏ',
    emoji: '😊',
    icon: 'white-balance-sunny',
    color: '#F4A259',
    tintSoft: '#FFF1E2',
    prompt: 'Một điều nhỏ bé khiến bạn mỉm cười hôm nay?',
  },
  {
    id: 'people',
    label: 'Người thương',
    emoji: '❤️',
    icon: 'heart',
    color: '#E5707E',
    tintSoft: '#FDECEF',
    prompt: 'Ai là người luôn ở bên bạn?',
  },
  {
    id: 'dreams',
    label: 'Ước mơ & mục tiêu',
    emoji: '✨',
    icon: 'star-four-points',
    color: '#9B7EDE',
    tintSoft: '#F1ECFB',
    prompt: 'Bạn mong điều gì cho tương lai?',
  },
  {
    id: 'moments',
    label: 'Khoảnh khắc đẹp',
    emoji: '📸',
    icon: 'camera-iris',
    color: '#5BA8A0',
    tintSoft: '#E6F4F2',
    prompt: 'Một kỷ niệm bạn muốn giữ mãi?',
  },
  {
    id: 'affirmations',
    label: 'Lời nhắn yêu thương',
    emoji: '💌',
    icon: 'email-heart-outline',
    color: '#D9748E',
    tintSoft: COLORS.comfortSoft,
    prompt: 'Hãy viết một lời dịu dàng cho chính mình.',
  },
  {
    id: 'wins',
    label: 'Điều tự hào',
    emoji: '🏆',
    icon: 'trophy-variant',
    color: '#E0A93B',
    tintSoft: '#FBF1D6',
    prompt: 'Một điều bạn đã vượt qua và tự hào?',
  },
  {
    id: 'comfort',
    label: 'Điều xoa dịu',
    emoji: '🫶',
    icon: 'music-note-eighth',
    color: '#7F9BD6',
    tintSoft: '#E9F0FB',
    prompt: 'Bài hát, mùi hương hay điều gì giúp bạn thấy bình yên?',
  },
];

export const TREASURE_CATEGORY_MAP: Record<TreasureCategoryId, TreasureCategory> =
  TREASURE_CATEGORIES.reduce(
    (acc, category) => {
      acc[category.id] = category;
      return acc;
    },
    {} as Record<TreasureCategoryId, TreasureCategory>,
  );

export const getTreasureCategory = (id: TreasureCategoryId): TreasureCategory =>
  TREASURE_CATEGORY_MAP[id] ?? TREASURE_CATEGORIES[0];

// A curated palette of emojis the user can pick when adding a treasure.
export const TREASURE_EMOJI_CHOICES = [
  '🌅', '😊', '❤️', '✨', '📸', '💌', '🏆', '🫶',
  '🌱', '☀️', '🌊', '🍀', '🐾', '🎵', '🏡', '🌙',
  '🤍', '🌸', '🔥', '☕', '📖', '🫂', '🎈', '🕊️',
];

// Seeded mock treasures so the space never feels empty on first open.
export const SEED_TREASURES: Treasure[] = [
  {
    id: 'seed-1',
    category: 'people',
    content: 'Mẹ luôn để dành phần cơm và đợi mình về dù mình về muộn.',
    emoji: '❤️',
    createdAt: '2026-05-20T12:00:00.000Z',
  },
  {
    id: 'seed-2',
    category: 'reasons',
    content: 'Mình muốn thấy biển một lần nữa vào mùa hè này.',
    emoji: '🌊',
    createdAt: '2026-05-22T08:30:00.000Z',
  },
  {
    id: 'seed-3',
    category: 'affirmations',
    content: 'Mình đã đi được đến đây rồi. Chậm cũng được, miễn là không dừng lại.',
    emoji: '🤍',
    createdAt: '2026-05-25T21:15:00.000Z',
  },
  {
    id: 'seed-4',
    category: 'wins',
    content: 'Hôm nay mình đã ra khỏi giường và đi dạo 10 phút. Một chiến thắng nhỏ.',
    emoji: '🏆',
    createdAt: '2026-05-28T17:45:00.000Z',
  },
  {
    id: 'seed-5',
    category: 'dreams',
    content: 'Một ngày nào đó mình sẽ có một căn phòng đầy cây xanh và ánh nắng.',
    emoji: '🌱',
    createdAt: '2026-06-01T10:00:00.000Z',
  },
  {
    id: 'seed-6',
    category: 'comfort',
    content: 'Tiếng mưa rơi ngoài cửa sổ và một tách trà ấm.',
    emoji: '☕',
    createdAt: '2026-06-03T19:20:00.000Z',
  },
];
