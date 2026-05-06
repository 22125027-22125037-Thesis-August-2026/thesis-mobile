import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components';
import { styles } from './SplashScreen.styles';

interface Props {
  onDone: () => void;
}

const SplashScreen: React.FC<Props> = ({ onDone }) => {
  const { t } = useTranslation();
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, useNativeDriver: true, tension: 60, friction: 7 }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(taglineOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(taglineY, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
    ]).start();

    const timer = setTimeout(onDone, 2600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.circle1} />
      <View style={styles.circle2} />
      <View style={styles.circle3} />

      <Animated.View style={[styles.logoWrap, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
        <View style={styles.logoMark}>
          <AppText style={styles.logoU}>u</AppText>
          <AppText style={styles.logoM}>M</AppText>
        </View>
        <AppText style={styles.wordmark}>uMatter</AppText>
      </Animated.View>

      <Animated.View style={{ opacity: taglineOpacity, transform: [{ translateY: taglineY }] }}>
        <AppText style={styles.tagline}>{t('splash.tagline')}</AppText>
      </Animated.View>

      <View style={styles.dotsRow}>
        {[0, 1, 2].map(i => (
          <View key={i} style={styles.dot} />
        ))}
      </View>
    </View>
  );
};

export default SplashScreen;
