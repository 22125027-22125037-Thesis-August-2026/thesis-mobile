import React, { useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Pressable,
  View,
  ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components';
import { COLORS } from '@/theme';
import { SCREEN_W, styles } from './OnboardingScreen.styles';

type SlideConfig = {
  id: string;
  bgTop: string;
  bgBottom: string;
  tagEmoji: string;
  illustrationIcon: string;
  illustrationColor: string;
  isLast?: boolean;
};

type Slide = SlideConfig & {
  tag: string;
  title: string;
  body: string;
  cta: string;
};

const SLIDE_CONFIGS: SlideConfig[] = [
  {
    id: 'welcome',
    bgTop: COLORS.onboardingSlide1Top,
    bgBottom: COLORS.onboardingSlide1Bottom,
    tagEmoji: '👋',
    illustrationIcon: 'heart-pulse',
    illustrationColor: COLORS.primary,
  },
  {
    id: 'track',
    bgTop: COLORS.onboardingSlide2Top,
    bgBottom: COLORS.onboardingSlide2Bottom,
    tagEmoji: '📊',
    illustrationIcon: 'chart-line',
    illustrationColor: COLORS.foodHeaderOrange,
  },
  {
    id: 'ai',
    bgTop: COLORS.onboardingSlide3Top,
    bgBottom: COLORS.onboardingSlide3Bottom,
    tagEmoji: '🤖',
    illustrationIcon: 'robot-happy-outline',
    illustrationColor: COLORS.onboardingAiBlue,
  },
  {
    id: 'therapist',
    bgTop: COLORS.primaryLight,
    bgBottom: COLORS.background,
    tagEmoji: '🩺',
    illustrationIcon: 'doctor',
    illustrationColor: COLORS.primaryDark,
    isLast: true,
  },
];

interface Props {
  onFinish: () => void;
  onSkip: () => void;
}

const OnboardingScreen: React.FC<Props> = ({ onFinish, onSkip }) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const slides: Slide[] = SLIDE_CONFIGS.map(config => ({
    ...config,
    tag: t(`onboarding.slides.${config.id}.tag`),
    title: t(`onboarding.slides.${config.id}.title`),
    body: t(`onboarding.slides.${config.id}.body`),
    cta: config.isLast ? '' : t(`onboarding.slides.${config.id}.cta`),
  }));

  const handleViewableChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  const goNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      onFinish();
    }
  };

  const renderSlide = ({ item, index }: { item: Slide; index: number }) => {
    const { illustrationColor } = item;

    return (
      <View style={[styles.slide, { width: SCREEN_W }]}>
        <View style={[styles.bgTop, { backgroundColor: item.bgTop }]} />
        <View style={[styles.bgBottom, { backgroundColor: item.bgBottom }]} />

        <View style={styles.circle1} />
        <View style={styles.circle2} />

        {!item.isLast && (
          <Pressable style={styles.skipBtn} onPress={onSkip}>
            <AppText style={styles.skipText}>{t('onboarding.skipButton')}</AppText>
          </Pressable>
        )}

        <View style={styles.illustrationArea}>
          <View style={[styles.illustrationCircle, { backgroundColor: `${illustrationColor}20` }]}>
            <View style={[styles.illustrationInner, { backgroundColor: `${illustrationColor}30`, borderColor: `${illustrationColor}50` }]}>
              <MaterialCommunityIcons name={item.illustrationIcon} size={72} color={illustrationColor} />
            </View>
          </View>
        </View>

        <View style={styles.contentPanel}>
          <View style={styles.tagRow}>
            <AppText style={styles.tagText}>{item.tagEmoji} {item.tag}</AppText>
          </View>

          <AppText style={styles.title}>{item.title}</AppText>
          <AppText style={styles.body}>{item.body}</AppText>

          <View style={styles.dotsRow}>
            {slides.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === index ? styles.dotActive : styles.dotInactive,
                ]}
              />
            ))}
          </View>

          {item.isLast ? (
            <>
              <Pressable style={styles.ctaBtnPrimary} onPress={onFinish}>
                <AppText style={styles.ctaBtnPrimaryText}>
                  {t('onboarding.slides.therapist.ctaPrimary')} →
                </AppText>
              </Pressable>
              <Pressable style={styles.ctaBtnOutline} onPress={onSkip}>
                <AppText style={styles.ctaBtnOutlineText}>
                  {t('onboarding.slides.therapist.ctaOutline')}
                </AppText>
              </Pressable>
            </>
          ) : (
            <Pressable style={styles.ctaBtnPrimary} onPress={goNext}>
              <AppText style={styles.ctaBtnPrimaryText}>{item.cta} →</AppText>
            </Pressable>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={item => item.id}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
        onViewableItemsChanged={handleViewableChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        scrollEventThrottle={16}
      />
    </SafeAreaView>
  );
};

export default OnboardingScreen;
