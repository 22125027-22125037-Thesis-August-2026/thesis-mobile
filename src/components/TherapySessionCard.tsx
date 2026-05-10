import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AppText from '@/components/AppText';
import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from '@/theme';
import { ChatSessionOverview } from '@/types';
import { formatSessionDate, getEmotionColor } from '@/utils';

interface TherapySessionCardProps {
  session: ChatSessionOverview;
  onPress: (sessionId: string) => void;
}

const EMOTION_ICON: Record<string, string> = {
  happy: 'emoticon-happy-outline',
  sad: 'emoticon-sad-outline',
  anxious: 'emoticon-confused-outline',
  angry: 'emoticon-angry-outline',
  neutral: 'emoticon-neutral-outline',
};

const TherapySessionCard: React.FC<TherapySessionCardProps> = ({ session, onPress }) => {
  const emotionKey = (session.emotion ?? 'neutral').toLowerCase();
  const iconName = EMOTION_ICON[emotionKey] ?? 'emoticon-neutral-outline';
  const emotionColor = getEmotionColor(session.emotion);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => onPress(session.sessionId)}>
      {/* Emotion icon */}
      <View style={[styles.iconContainer, { backgroundColor: emotionColor + '22' }]}>
        <MaterialCommunityIcons name={iconName} size={22} color={emotionColor} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.topRow}>
          <AppText style={styles.sessionTitle} numberOfLines={1}>
            {session.preview ?? 'Cuộc trò chuyện'}
          </AppText>
          <AppText style={styles.dateText}>
            {formatSessionDate(session.updatedAt)}
          </AppText>
        </View>
        <AppText style={styles.previewText} numberOfLines={1}>
          {session.preview}
        </AppText>
      </View>

      {/* Chevron */}
      <MaterialCommunityIcons
        name="chevron-right"
        size={18}
        color={COLORS.textTertiary}
        style={styles.chevron}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceRaised,
    borderRadius: BORDER_RADIUS.xxl,
    marginBottom: SPACING.sm,
    padding: 14,
    shadowColor: COLORS.shadowBase,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  cardPressed: {
    opacity: 0.8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    flexShrink: 0,
  },
  content: {
    flex: 1,
    gap: 3,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.xs,
  },
  sessionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
  },
  dateText: {
    fontSize: 11,
    color: COLORS.textTertiary,
    flexShrink: 0,
  },
  previewText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
  chevron: {
    marginLeft: SPACING.xs,
    flexShrink: 0,
  },
});

export default TherapySessionCard;
