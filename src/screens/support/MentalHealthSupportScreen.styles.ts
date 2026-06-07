import { StyleSheet } from 'react-native';

import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from '@/theme';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },

  // ── Hero ──
  hero: {
    backgroundColor: COLORS.supportHeader,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xl,
    borderBottomLeftRadius: BORDER_RADIUS.card,
    borderBottomRightRadius: BORDER_RADIUS.card,
    overflow: 'hidden',
  },
  heroCircleLarge: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: COLORS.supportCircle,
  },
  heroCircleSmall: {
    position: 'absolute',
    bottom: -20,
    left: -30,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: COLORS.supportCircle,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.whiteAlpha20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEyebrow: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.whiteAlpha85,
    letterSpacing: 0.4,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.whiteAlpha85,
    lineHeight: 21,
  },

  body: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },

  // ── Emergency banner ──
  emergencyBanner: {
    backgroundColor: COLORS.supportEmergencySoft,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.supportEmergency,
  },
  emergencyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  emergencyTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    color: COLORS.supportEmergencyDeep,
  },
  emergencyText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
  emergencyButtonsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  emergencyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.supportEmergency,
    paddingVertical: 11,
    borderRadius: BORDER_RADIUS.pill,
  },
  emergencyButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.white,
  },

  // ── Section label ──
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: SPACING.xl,
    marginBottom: SPACING.sm,
  },

  // ── Personal emergency contact ──
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.supportEmergencySoft,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.supportEmergency,
  },
  contactIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactText: {
    flex: 1,
  },
  contactName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.text,
  },
  contactPhone: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  contactEdit: {
    padding: 6,
  },
  contactCallButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.supportEmergency,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactAddCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.supportHeader,
    borderStyle: 'dashed',
    backgroundColor: COLORS.supportSoft,
  },
  contactAddText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.supportHeaderDeep,
  },

  // ── Hotline card ──
  hotlineCard: {
    backgroundColor: COLORS.surfaceRaised,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    shadowColor: COLORS.shadowBase,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  hotlineHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  hotlineIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.supportSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hotlineHeaderText: {
    flex: 1,
  },
  hotlineName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  hotlineBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  hotlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: COLORS.supportSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.pill,
  },
  hotlineBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.supportHeaderDeep,
  },
  hotlineDescription: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    lineHeight: 19,
    marginBottom: SPACING.md,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.supportHeader,
    paddingVertical: 13,
    borderRadius: BORDER_RADIUS.pill,
  },
  callButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.white,
  },

  // ── In-app cards ──
  inAppCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surfaceRaised,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  inAppIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inAppText: {
    flex: 1,
  },
  inAppTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.text,
  },
  inAppSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // ── Footer ──
  footer: {
    backgroundColor: COLORS.supportSoft,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginTop: SPACING.lg,
  },
  footerText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.supportHeaderDeep,
    lineHeight: 21,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: SPACING.xl,
  },

  // ── Edit contact modal ──
  modalBackdrop: {
    flex: 1,
    backgroundColor: COLORS.overlayDark45,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xxl,
    borderTopRightRadius: BORDER_RADIUS.xxl,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  modalHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.borderSubtle,
    marginBottom: SPACING.md,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  modalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.text,
  },
  fieldLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.surfaceRaised,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  modalSaveButton: {
    backgroundColor: COLORS.supportHeader,
    borderRadius: BORDER_RADIUS.pill,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  modalSaveButtonDisabled: {
    backgroundColor: COLORS.borderSubtle,
  },
  modalSaveText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.white,
  },
  modalRemoveButton: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  modalRemoveText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.supportEmergencyDeep,
  },
  modalBottomSpacer: {
    height: SPACING.xxl,
  },
});
