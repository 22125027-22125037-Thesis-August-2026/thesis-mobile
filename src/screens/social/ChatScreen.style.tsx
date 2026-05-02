import { StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '@/theme';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screenHorizontal,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  headerTextWrap: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    marginTop: 2,
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  headerPlaceholder: {
    width: 36,
    height: 36,
  },
  listContainer: {
    flex: 1,
  },
  messageListContent: {
    paddingHorizontal: SPACING.screenHorizontal,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  bubbleRow: {
    flexDirection: 'row',
    width: '100%',
  },
  myBubbleRow: {
    justifyContent: 'flex-end',
  },
  otherBubbleRow: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: BORDER_RADIUS.card,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    shadowColor: COLORS.shadowBase,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  myBubble: {
    backgroundColor: COLORS.accentPositive,
    borderBottomRightRadius: BORDER_RADIUS.sm,
  },
  otherBubble: {
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: BORDER_RADIUS.sm,
  },
  bubbleText: {
    fontSize: FONT_SIZES.sm,
    lineHeight: 20,
  },
  myBubbleText: {
    color: COLORS.white,
  },
  otherBubbleText: {
    color: COLORS.textPrimary,
  },
  bubbleTime: {
    marginTop: SPACING.xs,
    fontSize: FONT_SIZES.xs,
    alignSelf: 'flex-end',
  },
  myBubbleTime: {
    color: COLORS.whiteAlpha30,
  },
  otherBubbleTime: {
    color: COLORS.textSecondary,
  },
  emptyState: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  historyLoadingWrap: {
    paddingBottom: SPACING.sm,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.screenHorizontal,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSubtle,
    backgroundColor: COLORS.surface,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 130,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: BORDER_RADIUS.input,
    backgroundColor: COLORS.inputBackground,
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.sm,
  },
  sendButton: {
    minWidth: 72,
    height: 44,
    borderRadius: BORDER_RADIUS.button,
    backgroundColor: COLORS.accentNeutral,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  sendButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.whiteAlpha30,
  },
  loadingText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
  },
});