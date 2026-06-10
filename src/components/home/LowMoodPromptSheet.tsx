import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { AppText } from '@/components';
import { RootStackParamList } from '@/navigation';
import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from '@/theme';

type NavigationPropType = NavigationProp<RootStackParamList>;

interface LowMoodPromptSheetProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Gentle safety-net bottom sheet surfaced after a low mood check-in.
 * Warm and calm by design — it offers a soft place to land, never alarms.
 */
const LowMoodPromptSheet: React.FC<LowMoodPromptSheetProps> = ({
  visible,
  onClose,
}) => {
  const navigation = useNavigation<NavigationPropType>();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      anim.setValue(0);
      Animated.timing(anim, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, anim]);

  const goTo = (route: 'TreasureBox' | 'MentalHealthSupport'): void => {
    onClose();
    navigation.navigate(route);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        {/* Tapping the dimmed area dismisses; sits behind the card. */}
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <Animated.View
          style={[
            styles.card,
            {
              opacity: anim,
              transform: [
                {
                  translateY: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [40, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.heartCircle}>
            <MaterialCommunityIcons
              name="heart-outline"
              size={30}
              color={COLORS.comfortHeaderDeep}
            />
          </View>

          <AppText style={styles.title}>Hôm nay có vẻ nặng nề… 💛</AppText>
          <AppText style={styles.subtitle}>
            Cảm xúc nào cũng đều ổn. Bạn không phải đi qua nó một mình — đây là
            một khoảng lặng an toàn cho riêng bạn.
          </AppText>

          <View style={styles.actions}>
            <Pressable
              style={styles.primaryButton}
              onPress={() => goTo('TreasureBox')}
            >
              <MaterialCommunityIcons
                name="treasure-chest"
                size={18}
                color={COLORS.white}
              />
              <AppText style={styles.primaryButtonText}>
                Ghé Hộp Trân Quý
              </AppText>
            </Pressable>

            <Pressable
              style={styles.secondaryButton}
              onPress={() => goTo('MentalHealthSupport')}
            >
              <MaterialCommunityIcons
                name="chat-heart-outline"
                size={18}
                color={COLORS.comfortHeaderDeep}
              />
              <AppText style={styles.secondaryButtonText}>
                Mình cần nói chuyện
              </AppText>
            </Pressable>

            <Pressable style={styles.dismissButton} onPress={onClose}>
              <AppText style={styles.dismissText}>Để sau</AppText>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.overlayDarkMedium,
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.card,
    borderTopRightRadius: BORDER_RADIUS.card,
    paddingTop: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
    alignItems: 'center',
  },
  heartCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.comfortSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  actions: {
    width: '100%',
    gap: SPACING.sm,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.pill,
    backgroundColor: COLORS.comfortHeader,
  },
  primaryButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.white,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.pill,
    backgroundColor: COLORS.comfortSoft,
  },
  secondaryButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.comfortHeaderDeep,
  },
  dismissButton: {
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: SPACING.xxs,
  },
  dismissText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textTertiary,
  },
});

export default LowMoodPromptSheet;
