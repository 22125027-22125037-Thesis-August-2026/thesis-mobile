// src/screens/chat/ChatScreen.styles.ts

import { StyleSheet } from 'react-native';
import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from '@/theme';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // ===== HEADER =====
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.lg,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: COLORS.primaryAlpha35,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 6,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.whiteAlpha20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  botAvatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.whiteAlpha20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  headerTextContainer: {
    flex: 1,
  },
  botName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.white,
    lineHeight: 20,
  },
  onlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.white,
  },
  onlineText: {
    fontSize: 11,
    color: COLORS.whiteAlpha85,
  },

  // ===== CHAT AREA =====
  chatArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  flatListContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    gap: SPACING.xs,
  },

  // ===== MESSAGES =====
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  aiMessageContainer: {
    justifyContent: 'flex-start',
  },
  avatarSlot: {
    width: 28,
    height: 28,
    marginRight: SPACING.xs,
    flexShrink: 0,
  },
  avatarContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarPlaceholder: {
    width: 28,
    marginLeft: SPACING.xs,
    flexShrink: 0,
  },
  messageBubble: {
    maxWidth: '78%',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  userBubble: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.xl,
    borderBottomRightRadius: 6,
    shadowColor: COLORS.primaryAlpha35,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  aiBubble: {
    backgroundColor: COLORS.primaryMuted,
    borderRadius: BORDER_RADIUS.xl,
    borderBottomLeftRadius: 6,
  },
  typingBubble: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  messageText: {
    fontSize: FONT_SIZES.sm,
    lineHeight: 21,
    marginBottom: 3,
  },
  userMessageText: {
    color: COLORS.white,
    fontWeight: '500',
  },
  aiMessageText: {
    color: COLORS.textPrimary,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 1,
  },
  userTimestamp: {
    color: COLORS.whiteAlpha70,
    textAlign: 'right',
  },
  aiTimestamp: {
    color: COLORS.textTertiary,
  },

  // ===== TYPING INDICATOR =====
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 24,
    gap: 5,
    paddingHorizontal: 2,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primaryDark,
    opacity: 0.7,
  },

  // ===== QUICK REPLIES =====
  quickRepliesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    paddingLeft: 36,
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  quickReplyChip: {
    backgroundColor: COLORS.primaryMuted,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    borderRadius: BORDER_RADIUS.chip,
    paddingVertical: 6,
    paddingHorizontal: SPACING.sm,
  },
  quickReplyText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primaryDark,
  },

  // ===== CRISIS BANNER =====
  crisisBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accentNegative,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  crisisText: {
    flex: 1,
    fontSize: FONT_SIZES.xs,
    color: COLORS.white,
    lineHeight: 18,
  },
  crisisLink: {
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  crisisDismiss: {
    padding: SPACING.xs,
    marginLeft: SPACING.xs,
  },

  // ===== INPUT BAR =====
  inputSafeArea: {
    backgroundColor: COLORS.surfaceRaised,
  },
  inputToolbar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surfaceRaised,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSubtle,
    gap: SPACING.sm,
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.input,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: 15,
    color: COLORS.textPrimary,
    maxHeight: 100,
    lineHeight: 21,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primaryAlpha35,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.primaryLight,
    shadowOpacity: 0,
    elevation: 0,
  },
});
