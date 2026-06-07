import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { AppText } from '@/components';
import { RootStackParamList } from '@/navigation';
import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from '@/theme';

const SupportMiniDashboard: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <Pressable
      style={styles.card}
      onPress={() => navigation.navigate('MentalHealthSupport')}
    >
      <View style={styles.glowCircle} />

      <View style={styles.headerRow}>
        <View style={styles.iconBox}>
          <MaterialCommunityIcons
            name="lifebuoy"
            size={22}
            color={COLORS.supportHeaderDeep}
          />
        </View>
        <View style={styles.headerText}>
          <AppText style={styles.title}>Cần ai đó lắng nghe?</AppText>
          <AppText style={styles.subtitle}>
            Đường dây hỗ trợ tâm lý — luôn sẵn sàng, miễn phí
          </AppText>
        </View>
        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color={COLORS.supportHeaderDeep}
        />
      </View>

      <View style={styles.ctaRow}>
        <View style={styles.ctaPill}>
          <MaterialCommunityIcons
            name="phone-in-talk"
            size={14}
            color={COLORS.supportHeaderDeep}
          />
          <AppText style={styles.ctaPillText}>Gọi ngay</AppText>
        </View>
        <AppText style={styles.ctaHint}>
          Bạn không đơn độc — luôn có người ở đây vì bạn 🤍
        </AppText>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.supportSoft,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.supportHeader,
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
    backgroundColor: COLORS.whiteAlpha40,
    opacity: 0.6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceRaised,
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
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  ctaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.surfaceRaised,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BORDER_RADIUS.pill,
  },
  ctaPillText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.supportHeaderDeep,
  },
  ctaHint: {
    flex: 1,
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 15,
  },
});

export default SupportMiniDashboard;
