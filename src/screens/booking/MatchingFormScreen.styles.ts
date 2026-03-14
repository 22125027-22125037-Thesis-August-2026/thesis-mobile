// src/screens/booking/MatchingFormScreen.styles.ts
import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS, FONT_SIZES } from '../../constants/theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  /* ─── Header ─── */
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 48,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderBottomLeftRadius: BORDER_RADIUS.card,
    borderBottomRightRadius: BORDER_RADIUS.card,
    zIndex: 2,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  backButton: {
    padding: 4,
  },
  stepIndicator: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    opacity: 0.85,
  },
  brandText: {
    color: COLORS.chipSelected,
    fontSize: 26,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: SPACING.md,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 3,
  },

  /* ─── Leaf Background ─── */
  leafBackground: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.lg,
    paddingBottom: 140,
  },

  /* ─── Card ─── */
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.card,
    padding: SPACING.xl,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  questionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xxs,
  },
  questionSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },

  /* ─── Pills ─── */
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.sm,
  },
  pill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.chip,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    borderWidth: 1,
  },
  pillSelected: {
    backgroundColor: COLORS.chipSelected,
    borderColor: COLORS.chipSelected,
  },
  pillUnselected: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
  },
  pillText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
  },
  pillTextSelected: {
    color: COLORS.text,
  },
  pillTextUnselected: {
    color: COLORS.textSecondary,
  },

  /* ─── Vertical list options ─── */
  verticalOptionContainer: {
    gap: SPACING.sm,
  },
  verticalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderWidth: 1,
  },
  verticalOptionSelected: {
    backgroundColor: COLORS.chipSelected,
    borderColor: COLORS.chipSelected,
  },
  verticalOptionUnselected: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
  },
  verticalOptionText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    flex: 1,
    marginRight: SPACING.sm,
  },
  verticalOptionTextSelected: {
    color: COLORS.text,
  },
  verticalOptionTextUnselected: {
    color: COLORS.textSecondary,
  },

  inputWrapper: {
    marginTop: SPACING.sm,
  },
  inputQuestionLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },

  /* ─── Mood scales ─── */
  scaleSection: {
    marginBottom: SPACING.lg,
  },
  scaleTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  gradientTrack: {
    flexDirection: 'row',
    height: 8,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  gradientSegment: {
    flex: 1,
  },
  gradientSegmentStart: {
    backgroundColor: COLORS.chipSelected,
  },
  gradientSegmentMiddle: {
    backgroundColor: COLORS.primary,
  },
  gradientSegmentEnd: {
    backgroundColor: COLORS.buttonPrimary,
  },
  scaleButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  scalePoint: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  scalePointSelected: {
    backgroundColor: COLORS.buttonPrimary,
    borderColor: COLORS.buttonPrimary,
  },
  scalePointUnselected: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
  },
  scalePointText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
  },
  scalePointTextSelected: {
    color: COLORS.white,
  },
  scalePointTextUnselected: {
    color: COLORS.text,
  },
  scaleLegendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scaleLegendText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },

  /* ─── Footer ─── */
  footer: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: 0,
    paddingBottom: SPACING.xl,
    alignItems: 'flex-end',
  },
  footerButtonNext: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.buttonPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.buttonPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  footerButtonNextDisabled: {
    opacity: 0.45,
  },
});

export default styles;
