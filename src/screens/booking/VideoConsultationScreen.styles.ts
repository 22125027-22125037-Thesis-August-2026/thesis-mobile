import { StyleSheet } from 'react-native';
import { COLORS } from '@/theme';
import { BORDER_RADIUS, FONT_SIZES, SPACING } from '@/theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  content: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: SPACING.borderWidth,
    borderColor: COLORS.borderSubtle,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  loadingWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: SPACING.submitButtonHeight,
  },
  loadingText: {
    marginTop: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  errorText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.errorText,
    textAlign: 'center',
  },
  primaryButton: {
    width: '100%',
    minHeight: SPACING.submitButtonHeight,
    borderRadius: BORDER_RADIUS.button,
    backgroundColor: COLORS.buttonPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  primaryButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.buttonPrimaryText,
    textAlign: 'center',
  },
  endMeetingButton: {
    width: '100%',
    minHeight: SPACING.submitButtonHeight,
    borderRadius: BORDER_RADIUS.button,
    backgroundColor: COLORS.videoEndCall,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.md,
  },
});

export default styles;
