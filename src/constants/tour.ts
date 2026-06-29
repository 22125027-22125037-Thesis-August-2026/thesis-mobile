// Định nghĩa các bước cho tour coach-mark dành cho người mới.
// Mỗi bước trỏ tới một "target" thật trên UI (đã đăng ký qua useTourTarget),
// trừ bước `welcome` hiển thị card chào mừng ở giữa màn hình.

export const TOUR_TARGETS = {
  // Các thẻ trên Home
  mood: 'home.mood',
  dashboards: 'home.dashboards',
  // Các thẻ theo dõi mới (nằm trong khu "Theo dõi sức khỏe")
  treasure: 'home.treasure',
  steps: 'home.steps',
  breathing: 'home.breathing',
  nutrition: 'home.nutrition',
  support: 'home.support',
  // Khu thư giãn & thiền
  meditation: 'home.meditation',
  companion: 'home.companion',
  findTherapist: 'home.findTherapist',
  // 5 tab dưới
  tabHome: 'tab.home',
  tabAi: 'tab.ai',
  tabTherapist: 'tab.therapist',
  tabChat: 'tab.chat',
  tabProfile: 'tab.profile',
  // Các tính năng trong màn Hồ sơ
  streakTrophy: 'profile.streakTrophy',
  dailyTrophy: 'profile.dailyTrophy',
  focusMode: 'profile.focusMode',
} as const;

// Tên các tab dùng cho điều hướng trong tour (khớp với MainTabParamList).
export type TourNavTab =
  | 'HomeTab'
  | 'AIChatTab'
  | 'TherapistTab'
  | 'ChatRoomTab'
  | 'ProfileTab';

export type TourTargetKey = (typeof TOUR_TARGETS)[keyof typeof TOUR_TARGETS];

export type TourPlacement = 'above' | 'below' | 'center';

export interface TourStep {
  id: string;
  // null = bước giới thiệu ở giữa màn hình (không khoét sáng phần tử nào)
  target: TourTargetKey | null;
  placement: TourPlacement;
  // có cần cuộn target vào tầm nhìn trước khi đo không (các thẻ trong Home)
  scrollIntoView?: boolean;
  // chuyển sang tab này trước khi đo (dùng cho các bước nằm ở màn khác)
  navigateTab?: TourNavTab;
}

// Khoá i18n: tour.steps.<id>.{title,body}
export const TOUR_STEPS: TourStep[] = [
  { id: 'welcome', target: null, placement: 'center' },
  { id: 'mood', target: TOUR_TARGETS.mood, placement: 'below', scrollIntoView: true },
  { id: 'dashboards', target: TOUR_TARGETS.dashboards, placement: 'below', scrollIntoView: true },
  // Giới thiệu riêng các thẻ theo dõi mới (theo đúng thứ tự hiển thị trên màn hình)
  { id: 'treasure', target: TOUR_TARGETS.treasure, placement: 'below', scrollIntoView: true },
  { id: 'steps', target: TOUR_TARGETS.steps, placement: 'below', scrollIntoView: true },
  { id: 'breathing', target: TOUR_TARGETS.breathing, placement: 'below', scrollIntoView: true },
  { id: 'nutrition', target: TOUR_TARGETS.nutrition, placement: 'below', scrollIntoView: true },
  { id: 'support', target: TOUR_TARGETS.support, placement: 'below', scrollIntoView: true },
  { id: 'meditation', target: TOUR_TARGETS.meditation, placement: 'below', scrollIntoView: true },
  { id: 'companion', target: TOUR_TARGETS.companion, placement: 'below', scrollIntoView: true },
  { id: 'findTherapist', target: TOUR_TARGETS.findTherapist, placement: 'below', scrollIntoView: true },
  { id: 'tabHome', target: TOUR_TARGETS.tabHome, placement: 'above' },
  { id: 'tabAi', target: TOUR_TARGETS.tabAi, placement: 'above' },
  { id: 'tabTherapist', target: TOUR_TARGETS.tabTherapist, placement: 'above' },
  { id: 'tabChat', target: TOUR_TARGETS.tabChat, placement: 'above' },
  { id: 'tabProfile', target: TOUR_TARGETS.tabProfile, placement: 'above' },
  // Chuyển sang tab Hồ sơ và giới thiệu các tính năng tại đó
  {
    id: 'streakTrophy',
    target: TOUR_TARGETS.streakTrophy,
    placement: 'below',
    scrollIntoView: true,
    navigateTab: 'ProfileTab',
  },
  { id: 'dailyTrophy', target: TOUR_TARGETS.dailyTrophy, placement: 'below', scrollIntoView: true },
  { id: 'focusMode', target: TOUR_TARGETS.focusMode, placement: 'below', scrollIntoView: true },
];

export const TOUR_SEEN_KEY = 'hasSeenAppTour';
