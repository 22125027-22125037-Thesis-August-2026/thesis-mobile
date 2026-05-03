import { StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES } from '@/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  // Green header band
  headerBand: {
    backgroundColor: COLORS.primaryDeeper,
    paddingTop: 20,
    paddingBottom: 32,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    marginBottom: 0,
    overflow: 'hidden',
  },
  headerDecorCircle: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  brandLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: COLORS.white,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 6,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  // Checkbox
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    marginTop: 10,
    gap: 10,
  },
  checkboxText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: 0,
    flex: 1,
    lineHeight: 20,
  },
  roleSectionTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
    marginBottom: 10,
  },
  roleSelectorContainer: {
    marginBottom: 16,
    flexDirection: 'row',
    gap: 8,
  },
  roleCard: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: COLORS.backgroundDeep,
  },
  roleCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryMuted,
  },
  roleCardText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '700',
    textAlign: 'center',
  },
  roleCardTextSelected: {
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
  linkText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  registerButton: {
    backgroundColor: COLORS.buttonRegister,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  loginLink: {
    color: COLORS.primary,
    fontWeight: '700',
    marginLeft: 5,
  },
  orText: {
    textAlign: 'center',
    color: COLORS.textTertiary,
    marginVertical: 20,
    fontSize: FONT_SIZES.sm,
  },
  socialBtnLong: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceRaised,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    borderRadius: 16,
    height: 52,
    marginBottom: 12,
  },
  socialBtnText: {
    marginLeft: 10,
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
  },
});
