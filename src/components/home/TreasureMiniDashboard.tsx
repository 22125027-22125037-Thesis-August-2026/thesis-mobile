import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { AppText } from '@/components';
import { RootStackParamList } from '@/navigation';
import { getTreasureCategory } from '@/constants/treasures';
import { loadTreasures } from '@/utils/treasureStore';
import type { Treasure } from '@/types';
import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from '@/theme';

const TreasureMiniDashboard: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [treasures, setTreasures] = useState<Treasure[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void loadTreasures().then(items => {
        if (active) {
          setTreasures(items);
        }
      });
      return () => {
        active = false;
      };
    }, []),
  );

  const count = treasures.length;
  // Show a rotating-ish preview: pick the most recent treasure.
  const preview = treasures[0];
  const previewCategory = preview ? getTreasureCategory(preview.category) : null;

  const subtitle =
    count > 0
      ? `${count} điều quý giá đang được cất giữ`
      : 'Bắt đầu cất giữ những điều khiến bạn ấm lòng';

  return (
    <Pressable style={styles.card} onPress={() => navigation.navigate('TreasureBox')}>
      <View style={styles.glowCircle} />

      <View style={styles.headerRow}>
        <View style={styles.iconBox}>
          <MaterialCommunityIcons
            name="treasure-chest"
            size={22}
            color={COLORS.comfortHeaderDeep}
          />
        </View>
        <View style={styles.headerText}>
          <AppText style={styles.title}>Hộp Trân Quý</AppText>
          <AppText style={styles.subtitle}>{subtitle}</AppText>
        </View>
        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color={COLORS.comfortHeaderDeep}
        />
      </View>

      {preview && previewCategory ? (
        <View style={styles.previewRow}>
          <AppText style={styles.previewEmoji}>{preview.emoji}</AppText>
          <View style={styles.previewTextWrap}>
            <AppText style={styles.previewLabel}>{previewCategory.label}</AppText>
            <AppText style={styles.previewContent} numberOfLines={2}>
              {preview.content}
            </AppText>
          </View>
        </View>
      ) : (
        <View style={styles.emptyRow}>
          <AppText style={styles.emptyText}>
            💛 Một nơi an toàn cho những ngày khó khăn
          </AppText>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.comfortRoseSoft,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.comfortSoft,
    overflow: 'hidden',
    shadowColor: COLORS.shadowBase,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  glowCircle: {
    position: 'absolute',
    top: -40,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.comfortSoft,
    opacity: 0.7,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: 14,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.comfortSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surfaceRaised,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.comfortSoft,
  },
  previewEmoji: {
    fontSize: 26,
  },
  previewTextWrap: {
    flex: 1,
  },
  previewLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.comfortHeaderDeep,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  previewContent: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  emptyRow: {
    backgroundColor: COLORS.surfaceRaised,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.comfortSoft,
  },
  emptyText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
});

export default TreasureMiniDashboard;
