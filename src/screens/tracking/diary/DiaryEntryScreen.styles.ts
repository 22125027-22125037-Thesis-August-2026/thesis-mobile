import { StyleSheet } from 'react-native';

import { COLORS } from '@/theme';
import { BORDER_RADIUS, FONT_SIZES, SPACING } from '@/theme';

export const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  flex: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  container: {
    paddingHorizontal: SPACING.screenHorizontal,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xl,
    rowGap: SPACING.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: SPACING.sm,
  },
  headerBackButton: {
    width: 46,
    height: 46,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: SPACING.borderWidth,
    borderColor: COLORS.journalIconStroke,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.journalBackground,
  },
  screenTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  section: {
    rowGap: SPACING.sm,
  },
  sectionLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  titleInputContainer: {
    minHeight: 56,
    backgroundColor: COLORS.journalPillBackground,
    borderRadius: BORDER_RADIUS.full,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    columnGap: SPACING.sm,
  },
  titleInput: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    paddingVertical: SPACING.sm,
  },

  // ── Tag category card ─────────────────────────────────────────────────────────
  tagCard: {
    borderWidth: 1.5,
    borderColor: COLORS.borderSubtle,
    borderRadius: BORDER_RADIUS.card,
    backgroundColor: COLORS.journalPillBackground,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    rowGap: SPACING.sm,
  },
  categorySection: {
    rowGap: SPACING.xs,
  },
  categorySeparator: {
    height: 1,
    backgroundColor: COLORS.borderSubtle,
    marginVertical: SPACING.xs,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: SPACING.xs,
  },
  categoryLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },

  // ── Emotion Grid ─────────────────────────────────────────────────────────────
  emotionGrid: {
    rowGap: SPACING.xs,
  },
  emotionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  emotionCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.card,
    rowGap: 6,
  },
  emotionCellSelected: {
    backgroundColor: COLORS.journalMoodActive,
  },
  emotionCircle: {
    width: 52,
    height: 52,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emotionCircleSelected: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  emotionLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  emotionLabelSelected: {
    color: COLORS.textPrimary,
    fontWeight: '700',
  },

  // ── Quick Note card ───────────────────────────────────────────────────────────
  quickNoteCard: {
    borderWidth: 1.5,
    borderColor: COLORS.borderSubtle,
    borderRadius: BORDER_RADIUS.card,
    backgroundColor: COLORS.journalPillBackground,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs,
    minHeight: 80,
  },
  quickNoteInput: {
    minHeight: 44,
    fontSize: FONT_SIZES.sm,
    lineHeight: 20,
    color: COLORS.textPrimary,
    textAlignVertical: 'top',
  },

  // ── Toolbar shared by note card ───────────────────────────────────────────────
  toolbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
    columnGap: SPACING.xs,
  },
  addPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: SPACING.xs,
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.xs,
  },
  addPhotoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: SPACING.xs,
  },
  counterText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  attachmentsPreviewRow: {
    columnGap: SPACING.sm,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  previewImage: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: SPACING.borderWidth,
    borderColor: COLORS.borderSubtle,
  },

  // ── Submit ────────────────────────────────────────────────────────────────────
  submitArea: {
    paddingHorizontal: SPACING.screenHorizontal,
    paddingBottom: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  submitButton: {
    backgroundColor: COLORS.buttonPrimary,
    minHeight: 58,
    borderRadius: BORDER_RADIUS.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: SPACING.sm,
  },
  submitText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.buttonPrimaryText,
  },

  // ── Date picker ───────────────────────────────────────────────────────────────
  datePickerButton: {
    minHeight: 56,
    backgroundColor: COLORS.journalPillBackground,
    borderRadius: BORDER_RADIUS.full,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    columnGap: SPACING.sm,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  datePickerText: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  datePickerModal: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  datePickerContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.card,
    borderTopRightRadius: BORDER_RADIUS.card,
    paddingBottom: SPACING.lg,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  datePickerHeaderText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.primary,
  },
  datePickerConfirmButton: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.button,
    alignItems: 'center',
  },
  datePickerConfirmText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.white,
  },
});
