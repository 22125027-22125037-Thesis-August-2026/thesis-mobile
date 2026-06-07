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
    backgroundColor: COLORS.comfortHeader,
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
    backgroundColor: COLORS.comfortCircle,
  },
  heroCircleSmall: {
    position: 'absolute',
    bottom: 10,
    left: -30,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: COLORS.comfortCircle,
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
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.whiteAlpha85,
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  comfortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.white,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.pill,
    shadowColor: COLORS.shadowBase,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
  },
  comfortButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.comfortHeaderDeep,
  },
  crisisLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: SPACING.sm,
    paddingVertical: 6,
  },
  crisisLinkText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.white,
    textDecorationLine: 'underline',
  },

  // ── Category chips ──
  chipScroll: {
    marginTop: SPACING.lg,
  },
  chipRow: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.pill,
    backgroundColor: COLORS.comfortChipIdle,
    borderWidth: 1,
    borderColor: COLORS.comfortSoft,
  },
  chipActive: {
    backgroundColor: COLORS.comfortChipActive,
    borderColor: COLORS.comfortChipActive,
  },
  chipEmoji: {
    fontSize: 14,
  },
  chipLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  chipLabelActive: {
    color: COLORS.white,
  },

  // ── List ──
  listSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    gap: SPACING.sm,
  },
  treasureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surfaceRaised,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    shadowColor: COLORS.shadowBase,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  treasureEmojiBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  treasureEmoji: {
    fontSize: 24,
  },
  treasureBody: {
    flex: 1,
  },
  treasureCategory: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 3,
  },
  treasureContent: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    lineHeight: 20,
  },
  treasureDelete: {
    padding: 4,
  },

  // ── Empty state ──
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  emptyHint: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
    lineHeight: 20,
  },

  bottomSpacer: {
    height: 80,
  },

  // ── FAB ──
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.xl,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.comfortHeader,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.comfortHeaderDeep,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },

  // ── Add modal ──
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
    maxHeight: '88%',
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
    marginBottom: SPACING.md,
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
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: BORDER_RADIUS.pill,
    backgroundColor: COLORS.surfaceRaised,
    borderWidth: 1.5,
    borderColor: COLORS.borderSubtle,
  },
  categoryOptionEmoji: {
    fontSize: 15,
  },
  categoryOptionLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  categoryOptionLabelActive: {
    fontWeight: '700',
  },
  contentInput: {
    backgroundColor: COLORS.surfaceRaised,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    padding: SPACING.md,
    minHeight: 100,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    textAlignVertical: 'top',
  },
  counter: {
    alignSelf: 'flex-end',
    fontSize: 11,
    color: COLORS.textTertiary,
    marginTop: 4,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  emojiOption: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceRaised,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  emojiOptionActive: {
    backgroundColor: COLORS.comfortSoft,
    borderColor: COLORS.comfortHeader,
  },
  emojiOptionText: {
    fontSize: 22,
  },
  saveButton: {
    backgroundColor: COLORS.comfortHeader,
    borderRadius: BORDER_RADIUS.pill,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.comfortChipIdle,
  },
  saveButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.white,
  },
  modalBottomSpacer: {
    height: SPACING.xxl,
  },

  // ── Comfort overlay ──
  comfortBackdrop: {
    flex: 1,
    backgroundColor: COLORS.overlayDarkMedium,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  comfortCard: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
  },
  comfortHint: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textTertiary,
    marginBottom: SPACING.lg,
    fontStyle: 'italic',
  },
  comfortEmoji: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  comfortCategory: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.comfortHeaderDeep,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: SPACING.sm,
  },
  comfortContent: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: SPACING.xl,
  },
  comfortActions: {
    width: '100%',
    gap: SPACING.sm,
  },
  comfortShuffle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.pill,
    backgroundColor: COLORS.comfortSoft,
  },
  comfortShuffleText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.comfortHeaderDeep,
  },
  comfortClose: {
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.pill,
    backgroundColor: COLORS.comfortHeader,
    alignItems: 'center',
  },
  comfortCloseText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.white,
  },
  comfortCrisisLink: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  comfortCrisisText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.comfortHeaderDeep,
    textDecorationLine: 'underline',
  },
});
