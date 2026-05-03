import { StyleSheet } from 'react-native';
import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from '@/theme';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    paddingBottom: SPACING.xxl + 80,
  },

  /* ==== HERO HEADER ==== */
  heroHeader: {
    backgroundColor: COLORS.primaryDeeper,
    paddingTop: SPACING.screenTop,
    paddingHorizontal: SPACING.screenHorizontal,
    paddingBottom: SPACING.xl,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: 'hidden',
    position: 'relative',
  },
  heroCircleLarge: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroCircleSmall: {
    position: 'absolute',
    bottom: -20,
    right: 40,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  dateText: {
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  notificationButton: {
    position: 'relative',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accentNegative,
    borderWidth: 1.5,
    borderColor: COLORS.primaryDeeper,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.border,
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  profileInfo: {
    flex: 1,
  },
  greetingText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.white,
    lineHeight: 28,
  },
  greetingSubtext: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 3,
  },

  /* ==== PADDED CONTENT ==== */
  paddedContent: {
    paddingHorizontal: SPACING.screenHorizontal,
    paddingTop: SPACING.lg,
  },

  /* ==== SECTIONS ==== */
  section: {
    marginBottom: SPACING.sectionGap,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },

  /* ==== CHATBOT CARD ==== */
  chatbotCard: {
    backgroundColor: COLORS.chatbotDark,
    borderRadius: BORDER_RADIUS.card,
    padding: SPACING.md,
    overflow: 'hidden',
    shadowColor: '#1C1008',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.30,
    shadowRadius: 12,
    elevation: 6,
  },
  chatbotDecorCircle: {
    position: 'absolute',
    top: -30,
    right: -20,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(34,197,94,0.12)',
  },
  chatbotTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  robotIllustration: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: 'rgba(34,197,94,0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(34,197,94,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatbotText: {
    flex: 1,
  },
  chatbotTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 2,
  },
  chatbotSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255,255,255,0.55)',
  },
  chatbotInvite: {
    backgroundColor: 'rgba(34,197,94,0.12)',
    borderRadius: 14,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.18)',
  },
  chatbotInviteText: {
    flex: 1,
  },
  chatbotInviteMain: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
    marginBottom: 2,
  },
  chatbotMeta: {
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255,255,255,0.45)',
  },
  chatbotPlusBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* ==== SESSION CARDS ==== */
  sessionsCarousel: {
    gap: SPACING.md,
    paddingRight: SPACING.screenHorizontal,
  },
  sessionCard: {
    width: 185,
    height: 140,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 4,
  },
  sessionImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  sessionOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  sessionContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.md,
  },
  sessionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.white,
  },
  sessionSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },

  /* ==== BOTTOM SPACER ==== */
  bottomSpacer: {
    height: SPACING.lg,
  },
});
