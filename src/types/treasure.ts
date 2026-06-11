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

/** Kind of media a treasure can carry. Mirrors the backend enum. */
export type TreasureMediaType = 'IMAGE' | 'AUDIO' | 'VIDEO';

export interface Treasure {
  id: string;
  category: TreasureCategoryId;
  content: string;
  emoji: string;
  /** ISO timestamp */
  createdAt: string;
  /** Freshly signed URL for the attached media; absent for text-only treasures. */
  mediaUrl?: string;
  /** Kind of attached media; absent for text-only treasures. */
  mediaType?: TreasureMediaType;
  /** MIME type of the attached media; absent for text-only treasures. */
  mimeType?: string;
}

/** Payload sent to tracking-service when cataloguing a new treasure. */
export interface TreasureRequest {
  category: TreasureCategoryId;
  content: string;
  emoji: string;
}

/** Raw treasure shape returned by tracking-service. */
export interface TreasureResponse {
  id: string;
  category: string;
  content: string;
  emoji: string;
  mediaUrl?: string | null;
  mediaType?: TreasureMediaType | null;
  mimeType?: string | null;
  /** ISO-8601 LocalDateTime, e.g. "2026-06-11T21:12:20". */
  createdAt: string;
}
