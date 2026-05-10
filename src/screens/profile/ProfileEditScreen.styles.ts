import { StyleSheet } from 'react-native';
import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from '@/theme';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // ===== HEADER =====
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.screenHorizontal,
    paddingVertical: 14,
    backgroundColor: COLORS.surfaceRaised,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  saveBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.pill,
    backgroundColor: COLORS.primary,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primaryAlpha35,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  saveBtnDisabled: {
    backgroundColor: COLORS.primaryLight,
    shadowOpacity: 0,
    elevation: 0,
  },
  saveBtnText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.white,
  },

  // ===== AVATAR BANNER =====
  avatarBanner: {
    backgroundColor: COLORS.primaryMuted,
    paddingTop: SPACING.xl,
    paddingHorizontal: SPACING.screenHorizontal,
    paddingBottom: SPACING.xxxl,
    alignItems: 'center',
  },
  avatarTouchable: {
    position: 'relative',
  },
  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 4,
    borderColor: COLORS.surfaceRaised,
    backgroundColor: COLORS.border,
    shadowColor: COLORS.primaryAlpha18,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
  },
  editBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.surfaceRaised,
  },
  avatarHint: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },

  // ===== FORM =====
  form: {
    padding: SPACING.screenHorizontal,
    gap: SPACING.lg,
  },
  fieldGroup: {
    gap: SPACING.xs,
  },
  fieldLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: SPACING.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceRaised,
    borderRadius: BORDER_RADIUS.input,
    borderWidth: 1.5,
    borderColor: COLORS.borderSubtle,
    paddingHorizontal: SPACING.md,
    height: 54,
  },
  inputRowFocused: {
    borderColor: COLORS.primary,
    shadowColor: COLORS.primaryAlpha12,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 0,
  },
  inputRowReadonly: {
    opacity: 0.6,
    backgroundColor: COLORS.inputBackground,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
    paddingVertical: 0,
  },

  // ===== READ-ONLY INFO CARD =====
  readonlyCard: {
    backgroundColor: COLORS.surfaceRaised,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  readonlyCardTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: SPACING.xs,
  },
  readonlyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  readonlyLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textTertiary,
    width: 72,
  },
  readonlyValue: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },

  // ===== DANGER ZONE =====
  dangerZoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.xl,
    marginBottom: SPACING.sm,
  },
  dangerZoneTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.accentNegative,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  dangerCard: {
    backgroundColor: COLORS.errorBg,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1.5,
    borderColor: COLORS.accentNegative,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  dangerRowText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.accentNegative,
  },
});
