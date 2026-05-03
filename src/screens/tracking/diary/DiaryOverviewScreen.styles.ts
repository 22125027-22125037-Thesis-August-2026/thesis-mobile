import { StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONTS } from '@/theme';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primaryDeeper,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
  },

  /* ===== HEADER SECTION ===== */
  headerCard: {
    backgroundColor: COLORS.primaryDeeper,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.screenHorizontal,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: SPACING.sm,
  },
  headerBackButton: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: SPACING.borderWidth,
    borderColor: COLORS.whiteAlpha30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleBlock: {
    flex: 1,
    rowGap: SPACING.xxs,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },

  /* ===== SEARCH & STREAK SECTION ===== */
  searchStreakSection: {
    paddingHorizontal: SPACING.screenHorizontal,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
    marginTop: SPACING.md,
  },

  /* ===== OLD HEADER FALLBACK (kept for compatibility) ===== */
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screenHorizontal,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
    backgroundColor: COLORS.primaryDeeper,
  },
  headerTitleLegacy: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  searchInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.chip,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
  },

  /* ===== STREAK WIDGET ===== */
  streakWidget: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
  },
  streakFire: {
    fontSize: FONT_SIZES.xl,
  },
  streakContent: {
    flexDirection: 'column',
    gap: SPACING.xs,
  },
  streakNumber: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  streakLabel: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },

  /* ===== DATE RANGE FILTER ===== */
  dateRangeFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.screenHorizontal,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
    gap: SPACING.sm,
  },
  dateRangeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.chip,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  dateRangeButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  dateRangeClearButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  dateRangeClearText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    fontFamily: FONTS.semiBold,
    color: COLORS.primary,
  },

  /* ===== DATE PICKER MODAL ===== */
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
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },

  /* ===== TIMELINE FEED ===== */
  timelineContent: {
    paddingHorizontal: SPACING.screenHorizontal,
    paddingVertical: SPACING.md,
    paddingBottom: 100,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
  },
  timelineLine: {
    position: 'absolute',
    left: SPACING.screenHorizontal + 28,
    top: 56,
    width: 2,
    bottom: -SPACING.lg,
    backgroundColor: COLORS.borderSubtle,
  },
  timelineLineHidden: {
    display: 'none',
  },
  timelineDot: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    flexShrink: 0,
    marginRight: SPACING.md,
  },
  timelineDotInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  entryCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.card,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  cardHeaderLeft: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    flex: 1,
    gap: SPACING.xxs,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  separator: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.border,
  },
  moodIconWrap: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    gap: SPACING.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  entryDate: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  entryTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  entryTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  editButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  moodTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.chip,
    marginBottom: SPACING.md,
  },
  moodTagText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  entryContent: {
    fontSize: FONT_SIZES.sm,
    lineHeight: 20,
    color: COLORS.textPrimary,
    fontFamily: FONTS.regular,
  },

  /* ===== EMPTY STATE ===== */
  emptyStateWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.screenHorizontal,
    gap: SPACING.md,
  },
  emptyStateTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  emptyStateButton: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.chip,
    marginTop: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
  },

  /* ===== FAB ===== */
  fab: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
