import React from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppText } from '@/components';
import { COLORS, FONT_SIZES, SPACING } from '@/theme';

const INFO_ROWS = [
  { label: 'Phiên bản',      value: '1.0.0' },
  { label: 'Ngày phát hành', value: '01/07/2026' },
  { label: 'Nhà phát triển', value: 'uMatter Vietnam' },
  { label: 'Email',          value: 'apcsthesisteam@gmail.com' },
];

const AboutScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Hero Header */}
      <View style={styles.header}>
        <View style={styles.circleLg} />
        <View style={styles.circleSm} />
        <View style={styles.headerRow}>
          <Pressable
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={18} color={COLORS.white} />
          </Pressable>
          <View style={styles.headerText}>
            <AppText style={styles.eyebrow}>Giới thiệu</AppText>
            <AppText style={styles.title}>Về uMatter</AppText>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo Mark */}
        <View style={styles.logoMark}>
          <MaterialCommunityIcons name="leaf" size={40} color={COLORS.white} />
        </View>

        <AppText style={styles.brandName}>uMatter</AppText>
        <AppText style={styles.tagline}>
          Người bạn đồng hành nhỏ trong hành trình chăm sóc tâm hồn của bạn 💚
        </AppText>

        {/* Info Table */}
        <View style={styles.table}>
          {INFO_ROWS.map((row, idx) => (
            <View
              key={row.label}
              style={[
                styles.tableRow,
                idx === INFO_ROWS.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <AppText style={styles.rowLabel}>{row.label}</AppText>
              <AppText style={styles.rowValue}>{row.value}</AppText>
            </View>
          ))}
        </View>

        <AppText style={styles.footer}>Made with 💚 in Vietnam</AppText>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: SPACING.sm,
    paddingHorizontal: SPACING.screenHorizontal,
    paddingBottom: SPACING.xl,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  circleLg: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.whiteAlpha08,
  },
  circleSm: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.whiteAlpha06,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    zIndex: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.whiteAlpha20,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  headerText: {
    flex: 1,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.whiteAlpha85,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.white,
    marginTop: 2,
  },

  // Content
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: SPACING.screenHorizontal,
    paddingTop: 28,
    paddingBottom: SPACING.xxxl,
    alignItems: 'center',
  },

  // Logo
  logoMark: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  tagline: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 6,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 16,
  },

  // Table
  table: {
    width: '100%',
    marginTop: 28,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
  },
  rowLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  rowValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },

  // Footer
  footer: {
    marginTop: 32,
    fontSize: 11,
    color: COLORS.textTertiary,
    textAlign: 'center',
  },
});

export default AboutScreen;
