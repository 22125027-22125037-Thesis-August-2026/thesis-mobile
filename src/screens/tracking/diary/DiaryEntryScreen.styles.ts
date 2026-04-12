import { StyleSheet } from 'react-native';

import { COLORS } from '@/theme';
import { BORDER_RADIUS, FONT_SIZES, SPACING } from '@/theme';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.journalBackground,
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
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  moodOuter: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodOuterSelected: {
    backgroundColor: COLORS.journalMoodActive,
  },
  moodInner: {
    width: 50,
    height: 50,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentCard: {
    borderWidth: 2,
    borderColor: COLORS.journalContentBorder,
    borderRadius: BORDER_RADIUS.card,
    backgroundColor: COLORS.journalPillBackground,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    minHeight: 250,
  },
  contentInput: {
    flex: 1,
    minHeight: 130,
    fontSize: 38,
    lineHeight: 46,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlignVertical: 'top',
  },
  toolbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
    columnGap: SPACING.xs,
  },
  toolbarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: SPACING.xs,
  },
  iconPillButton: {
    width: 42,
    height: 42,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.journalToolbarPill,
    alignItems: 'center',
    justifyContent: 'center',
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
});
