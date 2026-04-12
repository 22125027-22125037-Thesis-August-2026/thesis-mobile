import { StyleSheet } from 'react-native';

import { COLORS } from '@/theme';
import { BORDER_RADIUS, FONT_SIZES, SPACING } from '@/theme';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  flex: {
    flex: 1,
  },
  root: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  headerWrap: {
    backgroundColor: COLORS.sleepHeaderPurple,
    marginHorizontal: -SPACING.xl,
    paddingHorizontal: SPACING.xl + SPACING.screenHorizontal,
    paddingTop: SPACING.md,
    paddingBottom: 86,
    borderBottomLeftRadius: 72,
    borderBottomRightRadius: 72,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: SPACING.sm,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: SPACING.borderWidth,
    borderColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  averageValue: {
    color: COLORS.white,
    marginTop: SPACING.lg,
    fontSize: 44,
    lineHeight: 50,
    fontWeight: '800',
    textAlign: 'center',
  },
  averageSubtitle: {
    color: COLORS.white,
    textAlign: 'center',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    marginTop: SPACING.xs,
  },
  fab: {
    position: 'absolute',
    right: SPACING.screenHorizontal,
    top: 196,
    width: 58,
    height: 58,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.sleepFab,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.textPrimary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  body: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.screenHorizontal,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  weekNavigatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  weekNavButton: {
    width: 34,
    height: 34,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: SPACING.borderWidth,
    borderColor: COLORS.borderSubtle,
    backgroundColor: COLORS.surface,
  },
  weekRangeLabel: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  chartCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    paddingHorizontal: SPACING.sm,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    borderWidth: SPACING.borderWidth,
    borderColor: COLORS.borderSubtle,
  },
  chartArea: {
    height: 200,
    justifyContent: 'flex-end',
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  gridLine: {
    borderTopWidth: SPACING.borderWidth,
    borderTopColor: COLORS.borderSubtle,
    borderStyle: 'dashed',
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: '100%',
  },
  column: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    rowGap: SPACING.xs,
  },
  bar: {
    width: 26,
    borderTopLeftRadius: BORDER_RADIUS.md,
    borderTopRightRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: SPACING.xs,
  },
  dayLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  loadingWrap: {
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: SPACING.sm,
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
  },
});
