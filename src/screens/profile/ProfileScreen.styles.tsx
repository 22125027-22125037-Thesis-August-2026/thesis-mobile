import { StyleSheet } from 'react-native';
import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from '@/theme';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },

  // ===== HERO HEADER =====
  heroHeader: {
    backgroundColor: COLORS.primary,
    paddingTop: SPACING.md,
    paddingHorizontal: SPACING.screenHorizontal,
    paddingBottom: 80,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
    position: 'relative',
  },
  heroCircleLarge: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.whiteAlpha08,
  },
  heroCircleSmall: {
    position: 'absolute',
    bottom: 10,
    left: -20,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.whiteAlpha06,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  heroGreeting: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.whiteAlpha85,
    fontWeight: '500',
  },
  settingsBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.whiteAlpha20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.white,
  },

  // ===== AVATAR CARD (overlap header) =====
  avatarCard: {
    marginHorizontal: SPACING.screenHorizontal,
    marginTop: -56,
    backgroundColor: COLORS.surfaceRaised,
    borderRadius: BORDER_RADIUS.card,
    padding: SPACING.lg,
    alignItems: 'center',
    shadowColor: COLORS.primaryAlpha18,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 8,
    zIndex: 1,
  },
  avatarWrapper: {
    marginTop: -48,
    marginBottom: SPACING.sm,
  },
  avatarEditBadge: {
    position: 'absolute',
    right: -2,
    bottom: SPACING.sm + 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.surfaceRaised,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: COLORS.surfaceRaised,
    backgroundColor: COLORS.border,
    shadowColor: COLORS.shadowBase,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  roleChip: {
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.pill,
    backgroundColor: COLORS.primaryMuted,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  roleChipText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.primaryDark,
  },

  // ===== STATS ROW =====
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.borderSubtle,
    marginVertical: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 3,
    textAlign: 'center',
  },

  // ===== CTA EDIT BUTTON =====
  ctaWrapper: {
    width: '100%',
    marginTop: SPACING.lg,
  },
  ctaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.pill,
    paddingVertical: 14,
    shadowColor: COLORS.primaryAlpha35,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  ctaPillText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.white,
  },

  // ===== MENU SECTIONS =====
  sectionBlock: {
    marginHorizontal: SPACING.screenHorizontal,
    marginTop: SPACING.lg,
  },
  trophySpacer: {
    height: SPACING.sm,
  },
  sectionLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: SPACING.sm,
    paddingHorizontal: 4,
  },
  menuCard: {
    backgroundColor: COLORS.surfaceRaised,
    borderRadius: BORDER_RADIUS.card,
    overflow: 'hidden',
    shadowColor: COLORS.shadowBase,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
  },
  menuRowLast: {
    borderBottomWidth: 0,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  menuTextBlock: {
    flex: 1,
  },
  menuTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  menuSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  menuChevron: {
    marginLeft: SPACING.xs,
  },

  // ===== LOGOUT BUTTON =====
  logoutBlock: {
    marginHorizontal: SPACING.screenHorizontal,
    marginTop: SPACING.lg,
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: BORDER_RADIUS.pill,
    borderWidth: 1.5,
    borderColor: COLORS.accentNegative,
    backgroundColor: COLORS.surfaceRaised,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.accentNegative,
  },

  // ===== AVATAR PICKER MODAL =====
  avatarModalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlayDark45,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  avatarModalCard: {
    width: '100%',
    backgroundColor: COLORS.surfaceRaised,
    borderRadius: BORDER_RADIUS.card,
    padding: SPACING.lg,
  },
  avatarModalTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  avatarModalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 14,
  },
  avatarModalOption: {
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 33,
    padding: 2,
  },
  avatarModalOptionSelected: {
    borderColor: COLORS.primary,
  },

  // ===== FOOTER =====
  footer: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: COLORS.textTertiary,
    textAlign: 'center',
  },
});
