import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components';
import { RootStackParamList } from '@/navigation';
import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from '@/theme';

const FindTherapistCta: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <Pressable
      style={styles.card}
      onPress={() => navigation.navigate('MainTabs', { screen: 'TherapistTab' })}
    >
      <View style={styles.iconCircle}>
        <MaterialCommunityIcons
          name="hospital-box-outline"
          size={22}
          color={COLORS.white}
        />
      </View>
      <View style={styles.textBlock}>
        <AppText style={styles.title}>{t('home.findTherapist.title')}</AppText>
        <AppText style={styles.subtitle}>{t('home.findTherapist.subtitle')}</AppText>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.primary} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: COLORS.primaryMuted,
    borderWidth: 1.5,
    borderColor: COLORS.primaryLight,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.md,
    paddingHorizontal: 18,
    marginTop: SPACING.lg,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  subtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    marginTop: 2,
  },
});

export default FindTherapistCta;
