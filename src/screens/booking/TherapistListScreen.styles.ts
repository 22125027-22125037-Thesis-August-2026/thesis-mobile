// src/screens/booking/TherapistListScreen.styles.ts

import { StyleSheet, Dimensions } from 'react-native';
import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from '@/theme';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primaryDeeper,
    paddingTop: SPACING.screenTop + SPACING.lg,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.screenHorizontal,
    borderBottomLeftRadius: 44,
    borderBottomRightRadius: 44,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: SPACING.md,
  },
  circleLarge: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  circleSmall: {
    position: 'absolute',
    bottom: -20,
    left: 30,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.white,
    lineHeight: 28,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '600',
  },
  searchBar: {
    paddingHorizontal: SPACING.screenHorizontal,
    marginBottom: SPACING.sm,
  },
  list: {
    paddingHorizontal: SPACING.screenHorizontal,
    paddingBottom: SPACING.xxl + 40,
    paddingTop: SPACING.sm,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceRaised,
    borderRadius: BORDER_RADIUS.card,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    shadowColor: COLORS.shadowBase,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginRight: SPACING.md,
    backgroundColor: COLORS.inputBackground,
  },
  info: {
    flex: 1,
    paddingTop: 2,
  },
  therapistLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  name: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 22,
  },
  specialty: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
    gap: 4,
  },
  rating: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  bookButton: {
    marginTop: SPACING.sm,
    alignSelf: 'flex-start',
    backgroundColor: COLORS.buttonGreen,
    borderRadius: BORDER_RADIUS.chip,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  bookButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
  },
});
