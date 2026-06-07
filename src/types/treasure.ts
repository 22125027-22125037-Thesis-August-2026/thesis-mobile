// "Hộp Trân Quý" (Treasure Box) — a personal comfort/safe-space collection.
// Each treasure is something that anchors the user to life: a reason to keep
// going, a joyful memory, a cherished person, a dream, an affirmation…

export type TreasureCategoryId =
  | 'reasons' // Lý do bước tiếp — reasons to move forward
  | 'joy' // Niềm vui nhỏ — little things that make you happy
  | 'people' // Người thương — people you cherish / connections
  | 'dreams' // Ước mơ & mục tiêu — dreams, future goals
  | 'moments' // Khoảnh khắc đẹp — beautiful memories
  | 'affirmations' // Lời nhắn yêu thương — affirmations / encouragement
  | 'wins' // Điều tự hào — small wins / proud moments
  | 'comfort'; // Điều xoa dịu — comfort songs, soothing things

export interface Treasure {
  id: string;
  category: TreasureCategoryId;
  content: string;
  emoji: string;
  /** ISO timestamp */
  createdAt: string;
}
