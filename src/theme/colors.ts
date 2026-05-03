export const COLORS = {
  // Brand — bright emerald green (v3)
  primary: '#22C55E',
  primaryMid: '#4ADE80',
  primaryLight: '#BBF7D0',
  primaryMuted: '#F0FDF4',
  primaryDark: '#16A34A',
  primaryDeeper: '#166534',

  // Backgrounds — clean bright white
  background: '#F8FAFC',
  backgroundDeep: '#F1F5F9',
  surface: '#FFFFFF',
  surfaceRaised: '#FFFFFF',

  // Text — WCAG AA compliant
  text: '#0F172A',
  textPrimary: '#0F172A',
  textSecondary: '#475569',   // 5.9:1 on white — WCAG AA ✓
  textTertiary: '#94A3B8',    // captions ≥14px only
  textLight: '#475569',
  textDark: '#1E293B',
  textInverse: '#FFFFFF',
  placeholder: '#94A3B8',
  placeholderMuted: '#CBD5E1',

  // Borders
  white: '#FFFFFF',
  border: '#CBD5E1',
  borderSubtle: '#E2E8F0',
  borderNeutral: '#E2E8F0',

  // Inputs
  inputBackground: '#F8FAFC',
  inputBorder: '#CBD5E1',
  inputBorderFocus: '#22C55E',
  inputIcon: '#475569',
  inputIconMuted: '#94A3B8',

  // Buttons
  buttonPrimary: '#0F172A',
  buttonPrimaryText: '#FFFFFF',
  buttonGreen: '#16A34A',
  buttonRegister: '#94A3B8',

  // Accents
  accentPositive: '#22C55E',
  accentNeutral: '#64748B',
  accentNegative: '#F43F5E',

  // Links & social
  socialBg: '#F1F5F9',
  link: '#2563EB',            // accessible blue
  errorBorder: '#F43F5E',
  errorBg: '#FFF1F2',
  errorText: '#BE123C',
  facebook: '#3B5998',
  google: '#DB4437',
  instagram: '#C13584',

  // Journal / Diary
  journalBackground: '#F1F5F9',
  journalPillBackground: '#F8FAFC',
  journalToolbarPill: '#E2E8F0',
  journalIconStroke: '#1E293B',
  journalContentBorder: '#64748B',
  journalInputText: '#94A3B8',
  journalCounter: '#94A3B8',
  journalMoodActive: '#DDD6FE',
  journalMoodFace: '#1E293B',
  journalMoodTerrible: '#DC2626',
  journalMoodBad: '#EA580C',
  journalMoodNeutral: '#D97706',
  journalMoodGood: '#16A34A',
  journalMoodExcellent: '#0D9488',
  chipSelected: '#BBF7D0',

  // Video
  videoBackground: '#111111',
  videoSurface: '#1E1E1E',
  videoPipSurface: '#2B2B2B',
  videoPipBorder: '#454545',
  videoControlBackground: '#2A2A2A',
  videoEndCall: '#D9534F',

  // Consultation feedback
  consultationFeedbackBackground: '#DCFCE7',
  consultationFeedbackPrimary: '#16A34A',
  consultationFeedbackTitle: '#0F172A',
  consultationFeedbackSecondary: '#64748B',
  consultationFeedbackAvatar: '#E2E8F0',
  consultationFeedbackDivider: '#E2E8F0',

  // Sleep
  sleepHeaderPurple: '#7C4DFF',
  sleepPurpleSoft: '#EDE7FF',
  sleepQualityExcellent: '#2E7D32',
  sleepQualityGood: '#827717',
  sleepQualityNeutral: '#4E5C5C',
  sleepQualityBad: '#BF360C',
  sleepQualityTerrible: '#4A148C',
  sleepChartEmpty: '#F1F1F1',
  sleepFab: '#1A1A1A',

  // Food / Nutrition
  foodHeaderOrange: '#FF8F00',
  foodOrangeSoft: '#FFF8E1',
  foodChartEmpty: '#F1F1F1',
  foodFab: '#1A1A1A',

  // Appointments / Therapy
  appointmentsActive: '#16A34A',
  therapyBackground: '#FFFFFF',
  therapyHeroBackground: '#F0FDF4',
  therapyPrimaryButton: '#0F172A',

  // Misc
  chatbotDark: '#0F172A',
  shadowBase: '#000000',
  emotionSad: '#FB923C',
  emotionHappy: '#4ADE80',
  emotionAnxious: '#A855F7',
  emotionAngry: '#EF4444',
  emotionNeutral: '#94A3B8',
  warning: '#F59E0B',
  ratingStar: '#F59E0B',
  rippleDarkSoft: 'rgba(0, 0, 0, 0.05)',
  overlayDarkSoft: 'rgba(0, 0, 0, 0.4)',
  overlayDarkMedium: 'rgba(0, 0, 0, 0.5)',
  whiteAlpha10: 'rgba(255, 255, 255, 0.1)',
  whiteAlpha20: 'rgba(255, 255, 255, 0.2)',
  whiteAlpha30: 'rgba(255, 255, 255, 0.3)',
} as const;
