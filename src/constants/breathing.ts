// Guided breathing exercise configuration.
// The session runs a fixed number of breath rounds (inhale → hold → exhale),
// then walks the user through a sequence of reflection prompts.

export type BreathingPhaseKey = 'inhale' | 'hold' | 'exhale';

export interface BreathingPhase {
  key: BreathingPhaseKey;
  /** Duration of the phase in seconds. */
  seconds: number;
  /** i18n key for the on-screen instruction. */
  labelKey: string;
  /** Target scale for the breathing orb during this phase. */
  scale: number;
}

// One cycle ≈ 14s (4-4-6). The orb expands on inhale, stays on hold, contracts
// on exhale.
export const BREATHING_PHASES: BreathingPhase[] = [
  { key: 'inhale', seconds: 4, labelKey: 'breathing.phases.inhale', scale: 1.4 },
  { key: 'hold', seconds: 4, labelKey: 'breathing.phases.hold', scale: 1.4 },
  { key: 'exhale', seconds: 6, labelKey: 'breathing.phases.exhale', scale: 1 },
];

// Number of full breath cycles before moving on to the reflection prompts.
export const BREATHING_ROUNDS = 4;

// Daily goal in seconds (5 minutes). Mirrors STEPS_DAILY_GOAL.
export const BREATHING_DAILY_GOAL_SECONDS = 300;

// Ordered reflection prompts shown after the breathing rounds. Each key maps to
// a `breathing.prompts.<key>` string in the locale files.
export const BREATHING_PROMPT_KEYS: string[] = [
  'goodMemory',
  'recentAchievement',
  'gratitude',
  'personYouLove',
  'safePlace',
];
