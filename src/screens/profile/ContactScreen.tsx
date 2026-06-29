import React from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppText } from '@/components';
import { COLORS, FONT_SIZES, SPACING } from '@/theme';

const CHANNELS = [
  { icon: 'email-outline',   label: 'Email',   value: 'apcsthesisteam@gmail.com' },
  // { icon: 'phone-outline',   label: 'Hotline', value: '1900 1234' },
  // { icon: 'message-outline', label: 'Zalo',    value: 'uMatter Official' },
  // { icon: 'web',             label: 'Website', value: 'umatter.vn' },
];

const ContactScreen: React.FC = () => {
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
            <AppText style={styles.eyebrow}>Hỗ trợ</AppText>
            <AppText style={styles.title}>Liên hệ với chúng tôi</AppText>
          </View>
          <View style={styles.headerIcon}>
            <MaterialCommunityIcons name="email-outline" size={24} color={COLORS.white} />
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AppText style={styles.intro}>
          Mọi góp ý, phản hồi hoặc thắc mắc của bạn đều giúp uMatter tốt hơn 💚.{'\n'}
          Liên hệ với chúng tôi qua các kênh sau:
        </AppText>

        {/* Channel List */}
        {CHANNELS.map((ch, idx) => (
          <View
            key={ch.label}
            style={[
              styles.channelRow,
              idx === CHANNELS.length - 1 && { borderBottomWidth: 0 },
            ]}
          >
            <View style={styles.channelIcon}>
              <MaterialCommunityIcons name={ch.icon} size={20} color={COLORS.primary} />
            </View>
            <View style={styles.channelText}>
              <AppText style={styles.channelLabel}>{ch.label}</AppText>
              <AppText style={styles.channelValue}>{ch.value}</AppText>
            </View>
          </View>
        ))}

        {/* Hours Callout */}
        {/* <View style={styles.hoursBox}>
          <AppText style={styles.hoursText}>
            Thời gian phản hồi: <AppText style={styles.hoursBold}>trong vòng 24 giờ</AppText>
            {'\n'}T2 – T6 · 8h00 – 18h00
          </AppText>
        </View> */}
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
    minWidth: 0,
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
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.whiteAlpha20,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },

  // Content
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: SPACING.screenHorizontal,
    paddingTop: 24,
    paddingBottom: SPACING.xxxl,
  },
  intro: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
  },

  // Channels
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
  },
  channelIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: COLORS.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  channelText: {
    flex: 1,
  },
  channelLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  channelValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 2,
  },

  // Hours Callout
  hoursBox: {
    marginTop: 28,
    padding: 16,
    borderRadius: 16,
    backgroundColor: COLORS.primaryMuted,
  },
  hoursText: {
    fontSize: 12.5,
    color: COLORS.primaryDark,
    lineHeight: 20,
    textAlign: 'center',
  },
  hoursBold: {
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
});

export default ContactScreen;
