import { StyleSheet } from 'react-native';

import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from '@/theme';

const ORB_SIZE = 180;

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.breathingHeader,
  },
  safeAreaGoalReached: {
    backgroundColor: COLORS.breathingComplete,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: SPACING.sm,
    paddingHorizontal: SPACING.screenHorizontal,
    paddingTop: SPACING.sm,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.whiteAlpha30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soundButton: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.whiteAlpha30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soundButtonPlaceholder: {
    width: 44,
    height: 44,
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
    opacity: 0.85,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  centerBlock: {
    alignItems: 'center',
    rowGap: SPACING.xl,
  },

  // Intro
  introOrb: {
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: ORB_SIZE / 2,
    backgroundColor: COLORS.breathingOrb,
    alignItems: 'center',
    justifyContent: 'center',
  },
  introText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.9,
  },

  // Breathing
  roundLabel: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    opacity: 0.85,
  },
  orbWrap: {
    width: ORB_SIZE + 80,
    height: ORB_SIZE + 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbGlow: {
    position: 'absolute',
    width: ORB_SIZE + 60,
    height: ORB_SIZE + 60,
    borderRadius: (ORB_SIZE + 60) / 2,
    backgroundColor: COLORS.breathingOrbGlow,
  },
  orb: {
    position: 'absolute',
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: ORB_SIZE / 2,
    backgroundColor: COLORS.breathingOrb,
  },
  phaseText: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '700',
  },
  skipButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  skipButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    opacity: 0.8,
  },

  // Reflection
  reflectionTitle: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    textAlign: 'center',
  },
  promptCard: {
    backgroundColor: COLORS.surfaceRaised,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    rowGap: SPACING.md,
    alignItems: 'center',
    width: '100%',
  },
  promptText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    lineHeight: 26,
    textAlign: 'center',
    fontWeight: '600',
  },
  promptDots: {
    flexDirection: 'row',
    columnGap: SPACING.xs,
  },
  promptDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.whiteAlpha30,
  },
  promptDotActive: {
    backgroundColor: COLORS.white,
    width: 20,
  },

  // Complete
  completeOrb: {
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: ORB_SIZE / 2,
    backgroundColor: COLORS.breathingOrb,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeOrbGoalReached: {
    backgroundColor: COLORS.breathingCompleteOrb,
  },
  goalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: SPACING.xs,
    backgroundColor: COLORS.breathingCompleteBadge,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
  },
  goalBadgeText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  completeTitle: {
    color: COLORS.white,
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
  },
  completeSubtitle: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    opacity: 0.9,
  },

  // Shared
  primaryButton: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl,
    minWidth: 200,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: COLORS.breathingHeader,
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
  },
  primaryButtonGoalReached: {
    backgroundColor: COLORS.white,
  },
  primaryButtonTextGoalReached: {
    color: COLORS.breathingComplete,
  },
});
