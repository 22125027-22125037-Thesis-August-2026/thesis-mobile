import React from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Rect, Stop } from 'react-native-svg';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components';
import {
  MEDITATION_EXERCISES,
  MeditationExercise,
} from '@/constants/meditations';
import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from '@/theme';

const CARD_WIDTH = 158;
const CARD_HEIGHT = 200;

const openMeditation = async (url: string): Promise<void> => {
  try {
    await Linking.openURL(url);
  } catch (err) {
    console.warn('[MeditationCarousel] Failed to open url', url, err);
  }
};

const MeditationCard: React.FC<{ item: MeditationExercise }> = ({ item }) => {
  const { t } = useTranslation();
  const gradientId = `med-grad-${item.id}`;

  return (
    <Pressable
      style={styles.card}
      onPress={() => void openMeditation(item.youtubeUrl)}
    >
      <Svg
        style={StyleSheet.absoluteFillObject}
        width={CARD_WIDTH}
        height={CARD_HEIGHT}
      >
        <Defs>
          <SvgLinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={item.gradient[0]} stopOpacity={1} />
            <Stop offset="0.6" stopColor={item.gradient[1]} stopOpacity={1} />
            <Stop offset="1" stopColor={item.gradient[2]} stopOpacity={1} />
          </SvgLinearGradient>
        </Defs>
        <Rect x={0} y={0} width={CARD_WIDTH} height={CARD_HEIGHT} fill={`url(#${gradientId})`} />
      </Svg>

      {/* Decorative circles */}
      <View style={styles.decorTopRight} />
      <View style={styles.decorBottomLeft} />

      {/* Top: icon + duration */}
      <View style={styles.topRow}>
        <View style={styles.iconBox}>
          <MaterialCommunityIcons name={item.icon} size={22} color={COLORS.white} />
        </View>
        <View style={styles.durationPill}>
          <MaterialCommunityIcons name="clock-outline" size={12} color={COLORS.white} />
          <AppText style={styles.durationText}>
            {t('home.meditation.minutesShort', { n: item.minutes })}
          </AppText>
        </View>
      </View>

      {/* Bottom: category + title + play */}
      <View>
        <AppText style={styles.category}>{t(item.categoryKey)}</AppText>
        <AppText style={styles.title}>{t(item.titleKey)}</AppText>
        <View style={styles.playButton}>
          <MaterialCommunityIcons name="play" size={18} color={COLORS.text} />
        </View>
      </View>
    </Pressable>
  );
};

const MeditationCarousel: React.FC = () => {
  const { t } = useTranslation();

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <AppText style={styles.sectionTitle}>
            {t('home.meditation.sectionTitle')}
          </AppText>
          <AppText style={styles.sectionSubtitle}>
            {t('home.meditation.sectionSubtitle')}
          </AppText>
        </View>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {MEDITATION_EXERCISES.map(item => (
          <MeditationCard key={item.id} item={item} />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: SPACING.xl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.screenHorizontal,
    marginBottom: SPACING.sm,
  },
  headerText: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  sectionSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textTertiary,
    marginTop: 3,
  },
  scrollContent: {
    paddingHorizontal: SPACING.screenHorizontal,
    paddingVertical: 4,
    gap: SPACING.sm,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 22,
    overflow: 'hidden',
    padding: 14,
    justifyContent: 'space-between',
    shadowColor: COLORS.shadowBase,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 5,
  },
  decorTopRight: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.whiteAlpha15,
  },
  decorBottomLeft: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.whiteAlpha10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.whiteAlpha30,
    borderWidth: 1,
    borderColor: COLORS.whiteAlpha40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: COLORS.whiteAlpha30,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  durationText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },
  category: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.whiteAlpha80,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 10,
  },
  playButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadowBase,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
});

export default MeditationCarousel;
