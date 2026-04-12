import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SPACING } from '@/theme';
import { ChatSessionOverview } from '@/types';
import { formatSessionDate, getEmotionColor } from '@/utils';

interface TherapySessionCardProps {
  session: ChatSessionOverview;
  onPress: (sessionId: string) => void;
}

const TherapySessionCard: React.FC<TherapySessionCardProps> = ({
  session,
  onPress,
}) => {
  return (
    <Pressable
      style={styles.cardContainer}
      onPress={() => onPress(session.sessionId)}
    >
      <View
        style={[
          styles.colorBar,
          { backgroundColor: getEmotionColor(session.emotion) },
        ]}
      />
      <View style={styles.cardContent}>
        <Text style={styles.dateText}>{formatSessionDate(session.updatedAt)}</Text>
        <Text style={styles.previewText} numberOfLines={1}>
          {session.preview}
        </Text>
      </View>

      <Pressable
        style={styles.moreButton}
        onPress={() => console.log('Open Menu', session.sessionId)}
      >
        <MaterialCommunityIcons
          name="dots-vertical"
          size={20}
          color={COLORS.textSecondary}
        />
      </Pressable>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: SPACING.md,
    alignItems: 'center',
    shadowColor: COLORS.shadowBase,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  colorBar: {
    width: 6,
    height: '100%',
  },
  cardContent: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  previewText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  moreButton: {
    padding: SPACING.md,
  },
});

export default TherapySessionCard;
