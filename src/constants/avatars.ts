// Bộ ảnh đại diện mẫu của hệ thống — dùng icon con vật (MaterialCommunityIcons)
// thay cho ảnh tải lên tự do. Avatar được lưu vào backend (`avatarUrl`) dưới dạng
// chuỗi `preset:<key>` để phân biệt với URL ảnh thật (avatar của therapist/bạn bè).

export const PRESET_PREFIX = 'preset:';

export interface PresetAvatar {
  /** Khóa định danh, lưu trong avatarUrl dưới dạng `preset:<key>`. */
  key: string;
  /** Tên icon MaterialCommunityIcons. */
  icon: string;
  /** Màu nền hình tròn. */
  bgColor: string;
}

// 8 con vật dễ thương + màu nền pastel.
export const PRESET_AVATARS: PresetAvatar[] = [
  { key: 'cat', icon: 'cat', bgColor: '#FFE0B2' },
  { key: 'dog', icon: 'dog', bgColor: '#D7CCC8' },
  { key: 'rabbit', icon: 'rabbit', bgColor: '#F8BBD0' },
  { key: 'panda', icon: 'panda', bgColor: '#E0E0E0' },
  { key: 'owl', icon: 'owl', bgColor: '#C5CAE9' },
  { key: 'penguin', icon: 'penguin', bgColor: '#B3E5FC' },
  { key: 'koala', icon: 'koala', bgColor: '#C8E6C9' },
  { key: 'duck', icon: 'duck', bgColor: '#FFF9C4' },
];

export const DEFAULT_AVATAR_KEY = PRESET_AVATARS[0].key;

/** Tạo chuỗi lưu trữ từ key preset. */
export const toAvatarValue = (key: string): string => `${PRESET_PREFIX}${key}`;

export type ResolvedAvatar =
  | { type: 'preset'; icon: string; bgColor: string }
  | { type: 'uri'; uri: string }
  | { type: 'placeholder' };

/**
 * Diễn giải giá trị avatarUrl thành cách hiển thị:
 * - `preset:<key>` khớp danh sách → icon con vật
 * - URL http(s) → ảnh từ mạng (giữ tương thích avatar cũ / người khác)
 * - còn lại → ảnh placeholder mặc định
 */
export const resolveAvatar = (avatarUrl?: string | null): ResolvedAvatar => {
  if (avatarUrl && avatarUrl.startsWith(PRESET_PREFIX)) {
    const key = avatarUrl.slice(PRESET_PREFIX.length);
    const preset = PRESET_AVATARS.find(a => a.key === key);
    if (preset) {
      return { type: 'preset', icon: preset.icon, bgColor: preset.bgColor };
    }
  }

  if (avatarUrl && /^https?:\/\//i.test(avatarUrl)) {
    return { type: 'uri', uri: avatarUrl };
  }

  return { type: 'placeholder' };
};
