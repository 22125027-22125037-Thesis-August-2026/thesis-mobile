import { StyleSheet } from 'react-native';
import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from '@/theme';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  /* ===== HEADER ===== */
  header: {
    paddingTop: SPACING.sm,
    paddingHorizontal: SPACING.screenHorizontal,
    paddingBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceRaised,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.shadowBase,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  titleWrap: {
    flex: 1,
    marginLeft: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.text,
  },
  countPill: {
    backgroundColor: COLORS.primaryMuted,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  countPillText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },

  /* ===== LIST ===== */
  listContent: {
    paddingHorizontal: SPACING.screenHorizontal,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xxl,
    gap: SPACING.sm,
  },
  sectionHeader: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.text,
  },

  /* ===== CARD ===== */
  card: {
    backgroundColor: COLORS.surfaceRaised,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: COLORS.shadowBase,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  cardUnread: {
    borderColor: COLORS.primaryAlpha18,
    backgroundColor: COLORS.surface,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  cardBody: {
    flex: 1,
    marginRight: SPACING.xs,
  },
  cardTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  cardMessage: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  cardRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 6,
    minHeight: 40,
  },
  badgeProgress: {
    backgroundColor: COLORS.journalMoodActive,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeProgressText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.journalMoodFace,
  },
  cardTime: {
    fontSize: 10,
    color: COLORS.textTertiary,
    fontWeight: '500',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accentNegative,
  },
  menuButton: {
    padding: 4,
  },

  /* ===== EMPTY ===== */
  emptyWrap: {
    paddingVertical: SPACING.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  emptyText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },

  /* ===== ACTION SHEET ===== */
  sheetBackdrop: {
    flex: 1,
    backgroundColor: COLORS.overlayDarkSoft,
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: COLORS.surfaceRaised,
    borderTopLeftRadius: BORDER_RADIUS.xxl,
    borderTopRightRadius: BORDER_RADIUS.xxl,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.borderSubtle,
    alignSelf: 'center',
    marginBottom: SPACING.sm,
  },
  sheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  sheetItemText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '600',
  },
  sheetItemDestructive: {
    color: COLORS.errorText,
  },
  sheetDivider: {
    height: 1,
    backgroundColor: COLORS.borderSubtle,
  },
});
