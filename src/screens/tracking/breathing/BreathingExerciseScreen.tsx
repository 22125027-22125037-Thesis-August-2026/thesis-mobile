import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Animated, Easing, Pressable, View } from 'react-native';
import {
  NavigationProp,
  useNavigation,
} from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { breathingApi } from '@/api';
import { AppText } from '@/components';
import {
  BREATHING_DAILY_GOAL_SECONDS,
  BREATHING_PHASES,
  BREATHING_PROMPT_KEYS,
  BREATHING_ROUNDS,
} from '@/constants/breathing';
import { AuthContext } from '@/context/AuthContext';
import { RootStackParamList } from '@/navigation';
import { COLORS } from '@/theme';
import { playSoftHaptic } from '@/utils';
import BreathingAudio from './BreathingAudio';
import { styles } from './BreathingExerciseScreen.styles';

type Stage = 'intro' | 'breathing' | 'reflection' | 'complete';

// Local calendar date (not UTC) so the backend's entryDate matches the day the
// user sees on the home dashboard — same approach as the steps tracker.
const toLocalDateKey = (date: Date): string => {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const BreathingExerciseScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { userInfo } = useContext(AuthContext)!;
  const profileId = userInfo?.profileId ?? '';
  const { t } = useTranslation();

  const [stage, setStage] = useState<Stage>('intro');
  const [round, setRound] = useState<number>(0);
  const [phaseIndex, setPhaseIndex] = useState<number>(0);
  const [promptIndex, setPromptIndex] = useState<number>(0);
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [completedMinutes, setCompletedMinutes] = useState<number>(0);
  const [goalReached, setGoalReached] = useState<boolean>(false);

  const orbScale = useRef(new Animated.Value(1)).current;
  const phaseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedAtRef = useRef<number>(0);

  const phase = BREATHING_PHASES[phaseIndex];

  const clearPhaseTimer = useCallback((): void => {
    if (phaseTimer.current) {
      clearTimeout(phaseTimer.current);
      phaseTimer.current = null;
    }
  }, []);

  // Drive the breathing orb + phase progression while in the breathing stage.
  useEffect(() => {
    if (stage !== 'breathing') return;

    playSoftHaptic();

    Animated.timing(orbScale, {
      toValue: phase.scale,
      duration: phase.seconds * 1000,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();

    phaseTimer.current = setTimeout(() => {
      const isLastPhase = phaseIndex === BREATHING_PHASES.length - 1;
      if (!isLastPhase) {
        setPhaseIndex(prev => prev + 1);
        return;
      }
      // Finished a full cycle.
      const isLastRound = round === BREATHING_ROUNDS - 1;
      if (isLastRound) {
        setStage('reflection');
        return;
      }
      setRound(prev => prev + 1);
      setPhaseIndex(0);
    }, phase.seconds * 1000);

    return clearPhaseTimer;
  }, [stage, phaseIndex, round, phase, orbScale, clearPhaseTimer]);

  useEffect(() => clearPhaseTimer, [clearPhaseTimer]);

  const handleStart = useCallback((): void => {
    startedAtRef.current = Date.now();
    setRound(0);
    setPhaseIndex(0);
    setStage('breathing');
  }, []);

  const finishSession = useCallback(async (): Promise<void> => {
    clearPhaseTimer();
    const elapsedSeconds =
      startedAtRef.current > 0
        ? Math.round((Date.now() - startedAtRef.current) / 1000)
        : 0;

    // Optimistic values from this session alone; refined with the day total
    // returned by the backend once the upsert resolves.
    setCompletedMinutes(Math.max(1, Math.round(elapsedSeconds / 60)));
    setGoalReached(elapsedSeconds >= BREATHING_DAILY_GOAL_SECONDS);
    setSoundOn(false);
    setStage('complete');

    if (profileId && elapsedSeconds > 0) {
      try {
        const log = await breathingApi.upsertBreathingLog({
          durationSeconds: elapsedSeconds,
          goalSeconds: BREATHING_DAILY_GOAL_SECONDS,
          entryDate: toLocalDateKey(new Date()),
        });
        const totalSeconds = log.totalDurationSeconds ?? elapsedSeconds;
        const goal = log.goalSeconds ?? BREATHING_DAILY_GOAL_SECONDS;
        setCompletedMinutes(Math.max(1, Math.round(totalSeconds / 60)));
        setGoalReached(totalSeconds >= goal);
      } catch (error) {
        console.error('[BreathingExerciseScreen] Failed to log session:', error);
      }
    }
  }, [clearPhaseTimer, profileId]);

  const handleNextPrompt = useCallback((): void => {
    const isLastPrompt = promptIndex === BREATHING_PROMPT_KEYS.length - 1;
    if (isLastPrompt) {
      void finishSession();
      return;
    }
    setPromptIndex(prev => prev + 1);
  }, [promptIndex, finishSession]);

  const isMusicPlaying = soundOn && (stage === 'breathing' || stage === 'reflection');
  const showGoalReached = stage === 'complete' && goalReached;

  return (
    <SafeAreaView
      style={[styles.safeArea, showGoalReached && styles.safeAreaGoalReached]}
    >
      <BreathingAudio playing={isMusicPlaying} />

      <View style={styles.headerRow}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={22} color={COLORS.white} />
        </Pressable>
        <View style={styles.headerTitleBlock}>
          <AppText style={styles.headerTitle}>
            {t('breathing.main.headerTitle')}
          </AppText>
          <AppText style={styles.headerSubtitle}>
            {t('breathing.main.headerSubtitle')}
          </AppText>
        </View>
        {stage === 'breathing' || stage === 'reflection' ? (
          <Pressable
            style={styles.soundButton}
            onPress={() => setSoundOn(prev => !prev)}
          >
            <Feather
              name={soundOn ? 'volume-2' : 'volume-x'}
              size={20}
              color={COLORS.white}
            />
          </Pressable>
        ) : (
          <View style={styles.soundButtonPlaceholder} />
        )}
      </View>

      <View style={styles.body}>
        {stage === 'intro' && (
          <View style={styles.centerBlock}>
            <View style={styles.introOrb}>
              <MaterialCommunityIcons
                name="meditation"
                size={64}
                color={COLORS.white}
              />
            </View>
            <AppText style={styles.introText}>
              {t('breathing.main.getReady')}
            </AppText>
            <Pressable style={styles.primaryButton} onPress={handleStart}>
              <AppText style={styles.primaryButtonText}>
                {t('breathing.main.startButton')}
              </AppText>
            </Pressable>
          </View>
        )}

        {stage === 'breathing' && (
          <View style={styles.centerBlock}>
            <AppText style={styles.roundLabel}>
              {t('breathing.main.roundLabel', {
                current: round + 1,
                total: BREATHING_ROUNDS,
              })}
            </AppText>
            <View style={styles.orbWrap}>
              <Animated.View
                style={[styles.orbGlow, { transform: [{ scale: orbScale }] }]}
              />
              <Animated.View
                style={[styles.orb, { transform: [{ scale: orbScale }] }]}
              />
              <AppText style={styles.phaseText}>{t(phase.labelKey)}</AppText>
            </View>
            <Pressable style={styles.skipButton} onPress={() => setStage('reflection')}>
              <AppText style={styles.skipButtonText}>
                {t('breathing.main.skip')}
              </AppText>
            </Pressable>
          </View>
        )}

        {stage === 'reflection' && (
          <View style={styles.centerBlock}>
            <AppText style={styles.reflectionTitle}>
              {t('breathing.main.reflectionTitle')}
            </AppText>
            <View style={styles.promptCard}>
              <MaterialCommunityIcons
                name="heart-outline"
                size={28}
                color={COLORS.breathingHeader}
              />
              <AppText style={styles.promptText}>
                {t(`breathing.prompts.${BREATHING_PROMPT_KEYS[promptIndex]}`)}
              </AppText>
            </View>
            <View style={styles.promptDots}>
              {BREATHING_PROMPT_KEYS.map((key, i) => (
                <View
                  key={key}
                  style={[
                    styles.promptDot,
                    i === promptIndex && styles.promptDotActive,
                  ]}
                />
              ))}
            </View>
            <Pressable style={styles.primaryButton} onPress={handleNextPrompt}>
              <AppText style={styles.primaryButtonText}>
                {promptIndex === BREATHING_PROMPT_KEYS.length - 1
                  ? t('breathing.main.finish')
                  : t('breathing.main.next')}
              </AppText>
            </Pressable>
          </View>
        )}

        {stage === 'complete' && (
          <View style={styles.centerBlock}>
            <View
              style={[
                styles.completeOrb,
                showGoalReached && styles.completeOrbGoalReached,
              ]}
            >
              <MaterialCommunityIcons
                name={showGoalReached ? 'check-decagram' : 'check'}
                size={56}
                color={COLORS.white}
              />
            </View>

            {showGoalReached && (
              <View style={styles.goalBadge}>
                <MaterialCommunityIcons
                  name="sprout"
                  size={16}
                  color={COLORS.white}
                />
                <AppText style={styles.goalBadgeText}>
                  {t('breathing.main.goalReachedBadge')}
                </AppText>
              </View>
            )}

            <AppText style={styles.completeTitle}>
              {showGoalReached
                ? t('breathing.main.goalReachedTitle')
                : t('breathing.main.completedTitle')}
            </AppText>
            <AppText style={styles.completeSubtitle}>
              {showGoalReached
                ? t('breathing.main.goalReachedSubtitle', { minutes: completedMinutes })
                : t('breathing.main.completedSubtitle', { minutes: completedMinutes })}
            </AppText>
            <Pressable
              style={[
                styles.primaryButton,
                showGoalReached && styles.primaryButtonGoalReached,
              ]}
              onPress={() => navigation.goBack()}
            >
              <AppText
                style={[
                  styles.primaryButtonText,
                  showGoalReached && styles.primaryButtonTextGoalReached,
                ]}
              >
                {t('breathing.main.completedButton')}
              </AppText>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default BreathingExerciseScreen;
