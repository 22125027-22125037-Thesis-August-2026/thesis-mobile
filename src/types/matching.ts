// src/types/matching.ts

export interface MatchingFormData {
  hasPriorCounseling: string;
  gender: string;
  age: string;
  sexualOrientation: string;
  isLgbtqPriority: string;
  selfHarmThought: string;
  reasons: string[];
  moodLevels: {
    anxiety: number;
    lossInterest: number;
    fatigue: number;
  };
  communicationStyle: string;
}

export const INITIAL_MATCHING_FORM: MatchingFormData = {
  hasPriorCounseling: '',
  gender: '',
  age: '',
  sexualOrientation: '',
  isLgbtqPriority: '',
  selfHarmThought: '',
  reasons: [],
  moodLevels: {
    anxiety: 3,
    lossInterest: 3,
    fatigue: 3,
  },
  communicationStyle: '',
};
