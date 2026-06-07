// Verified Vietnamese mental-health & crisis support resources.
// Numbers checked against official sources (June 2026):
//   • Ngày Mai — https://duongdaynongngaymai.vn/hotline/
//   • Tổng đài 111 — https://tongdai111.vn/
//   • 115 / 113 — national emergency numbers
// Keep this list short, trustworthy, and current — it is shown to users who
// may be in distress, so accuracy matters more than breadth.

export type CrisisResourceKind = 'emergency' | 'hotline' | 'inApp';

export interface CrisisResource {
  id: string;
  kind: CrisisResourceKind;
  name: string;
  /** Short description of who they are / who they help. */
  description: string;
  /** Dialable phone number, digits only (used for tel: links). */
  phone?: string;
  /** Human-readable phone display. */
  phoneDisplay?: string;
  /** Operating hours, shown as a badge. */
  hours: string;
  /** MaterialCommunityIcons name. */
  icon: string;
  /** Whether the call is free. */
  free?: boolean;
}

// Shown as a prominent banner — for immediate danger to life.
export const EMERGENCY_RESOURCES: CrisisResource[] = [
  {
    id: 'emergency-115',
    kind: 'emergency',
    name: 'Cấp cứu y tế 115',
    description: 'Gọi xe cứu thương khi có nguy hiểm tức thời đến tính mạng.',
    phone: '115',
    phoneDisplay: '115',
    hours: '24/7',
    icon: 'ambulance',
    free: true,
  },
  {
    id: 'emergency-113',
    kind: 'emergency',
    name: 'Công an 113',
    description: 'Hỗ trợ khẩn cấp khi bạn hoặc người khác đang gặp nguy hiểm.',
    phone: '113',
    phoneDisplay: '113',
    hours: '24/7',
    icon: 'shield-alert',
    free: true,
  },
];

// Mental-health listening & support lines.
export const SUPPORT_HOTLINES: CrisisResource[] = [
  {
    id: 'hotline-111',
    kind: 'hotline',
    name: 'Tổng đài Quốc gia Bảo vệ Trẻ em 111',
    description:
      'Tư vấn tâm lý miễn phí cho trẻ em & thanh thiếu niên: lo âu, trầm cảm, cô đơn, ý nghĩ tự làm hại bản thân.',
    phone: '111',
    phoneDisplay: '111',
    hours: '24/7 · Mọi ngày',
    icon: 'phone-in-talk',
    free: true,
  },
  {
    id: 'hotline-ngaymai',
    kind: 'hotline',
    name: 'Đường dây nóng Ngày Mai',
    description:
      'Sơ cứu & hỗ trợ tâm lý miễn phí cho người trầm cảm và người thân. "Mai là một ngày mới…"',
    phone: '0963061414',
    phoneDisplay: '096 306 1414',
    hours: 'T4, T6, T7, CN · 13:00–20:30',
    icon: 'hand-heart',
    free: true,
  },
];
