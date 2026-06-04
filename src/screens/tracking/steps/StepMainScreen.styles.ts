import { StyleSheet } from 'react-native';

import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from '@/theme';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.stepsHeaderTeal,
  },
  flex: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: SPACING.screenHorizontal,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xxl,
    rowGap: SPACING.lg,
  },
  headerCard: {
    borderRadius: 32,
    backgroundColor: COLORS.stepsHeaderTeal,
    padding: SPACING.md,
    rowGap: SPACING.lg,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: SPACING.sm,
  },
  backButton: {
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
  // Hero (today)
  heroBlock: {
    alignItems: 'center',
    rowGap: SPACING.xs,
  },
  heroLabel: {
    color: COLORS.whiteAlpha80,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  heroValue: {
    color: COLORS.white,
    fontSize: 52,
    lineHeight: 58,
    fontWeight: '800',
  },
  heroGoal: {
    color: COLORS.whiteAlpha80,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  progressTrack: {
    width: '100%',
    height: 12,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.whiteAlpha20,
    overflow: 'hidden',
    marginTop: SPACING.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.white,
  },
  heroRemaining: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    marginTop: SPACING.xxs,
  },
  heroStatsRow: {
    flexDirection: 'row',
    columnGap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  heroStatCard: {
    flex: 1,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.whiteAlpha10,
    borderWidth: SPACING.borderWidth,
    borderColor: COLORS.whiteAlpha20,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    rowGap: SPACING.xxs,
  },
  heroStatValue: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
  },
  heroStatLabel: {
    color: COLORS.whiteAlpha80,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  // Section card
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: SPACING.borderWidth,
    borderColor: COLORS.borderSubtle,
    padding: SPACING.md,
    rowGap: SPACING.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    columnGap: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  sectionSubtitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  chart: {
    marginLeft: -SPACING.xs,
    borderRadius: BORDER_RADIUS.card,
  },
  loadingWrap: {
    minHeight: 200,
    alignItems: 'center',
    justifyContent: 'center',
    rowGap: SPACING.sm,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  emptyChartState: {
    minHeight: 200,
    alignItems: 'center',
    justifyContent: 'center',
    rowGap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  emptyStateText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  summaryCard: {
    flexGrow: 1,
    flexBasis: '30%',
    minWidth: 100,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.journalPillBackground,
    padding: SPACING.md,
    rowGap: SPACING.xxs,
  },
  summaryValue: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  summaryLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});
