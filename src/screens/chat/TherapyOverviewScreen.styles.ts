import { StyleSheet } from 'react-native';
import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from '@/theme';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },

  // ===== HEADER =====
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: COLORS.primaryAlpha35,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 6,
  },
  headerTextContainer: {},
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
    lineHeight: 24,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.whiteAlpha85,
    marginTop: 3,
  },

  // ===== SCROLLABLE CONTENT =====
  scrollContent: {
    flexGrow: 1,
    paddingBottom: SPACING.xxl,
  },

  // ===== HERO CARD =====
  heroWrapper: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  heroCard: {
    backgroundColor: COLORS.primaryMuted,
    borderRadius: BORDER_RADIUS.xxl,
    borderWidth: 1.5,
    borderColor: COLORS.primaryLight,
    padding: SPACING.lg,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  aiAvatar: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  heroTextContainer: {
    flex: 1,
  },
  heroTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 3,
  },
  heroSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
  heroCTAPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceRaised,
    borderWidth: 1.5,
    borderColor: COLORS.primaryLight,
    borderRadius: 14,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  heroCTAText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primaryDark,
    flex: 1,
  },
  heroCTAButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },

  // ===== HISTORY SECTION =====
  historySection: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.65,
    marginBottom: SPACING.sm,
  },
  listContainer: {
    paddingBottom: SPACING.xl,
  },

  // ===== STATES =====
  loadingContainer: {
    paddingVertical: SPACING.xxl,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: SPACING.xxl,
    alignItems: 'center',
    gap: SPACING.md,
  },
  emptyText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: SPACING.lg,
  },
});
