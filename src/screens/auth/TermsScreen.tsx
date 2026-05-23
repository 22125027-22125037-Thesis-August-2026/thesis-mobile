import { AppText } from '@/components';
import { COLORS, FONT_SIZES } from '@/theme';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

const TermsScreen = ({ navigation }: any) => {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDeeper} />

      <View style={styles.headerBand}>
        <View style={styles.headerDecorCircle} />
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.white} />
        </TouchableOpacity>
        <AppText style={styles.brandLabel}>uMatter</AppText>
        <AppText style={styles.title}>{t('terms.title')}</AppText>
        <AppText style={styles.subtitle}>{t('terms.lastUpdated')}</AppText>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>

          <AppText style={styles.intro}>{t('terms.intro')}</AppText>

          <Section title={t('terms.section1.title')} body={t('terms.section1.body')} />
          <Section title={t('terms.section2.title')} body={t('terms.section2.body')} />
          <Section title={t('terms.section3.title')} body={t('terms.section3.body')} />
          <Section title={t('terms.section4.title')} body={t('terms.section4.body')} />
          <Section title={t('terms.section5.title')} body={t('terms.section5.body')} />
          <Section title={t('terms.section6.title')} body={t('terms.section6.body')} />
          <Section title={t('terms.section7.title')} body={t('terms.section7.body')} />

          <AppText style={styles.contact}>{t('terms.contact')}</AppText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const Section = ({ title, body }: { title: string; body: string }) => (
  <View style={styles.section}>
    <AppText style={styles.sectionTitle}>{title}</AppText>
    <AppText style={styles.sectionBody}>{body}</AppText>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerBand: {
    backgroundColor: COLORS.primaryDeeper,
    paddingTop: 12,
    paddingBottom: 28,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
  },
  headerDecorCircle: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  backButton: {
    marginBottom: 12,
    width: 36,
    height: 36,
    justifyContent: 'center',
  },
  brandLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.white,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 6,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  intro: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  sectionBody: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  contact: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default TermsScreen;
