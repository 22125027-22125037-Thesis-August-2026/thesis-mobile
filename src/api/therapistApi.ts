// src/api/therapistApi.ts

// ✅ Correct
import axios from 'axios';
import therapistAxiosClient from '@/api/therapistAxiosClient';
import { MatchingFormData } from '@/types';

type MatchingChoice = string;

interface MatchingPreferencesPayload {
  has_prior_counseling: string;
  gender: string;
  age: string;
  sexual_orientation: string;
  is_lgbtq_priority: boolean;
  self_harm_thought: string;
  reasons: string[];
  mood_levels: {
    anxiety: number;
    lossInterest: number;
    fatigue: number;
  };
  communication_style: string;
}

const mapChoiceValue = (
  value: string,
  valueMap: Record<string, string>,
  fallback: string,
): string => {
  const mapped = valueMap[value];
  if (mapped) {
    return mapped;
  }

  const normalized = value.toLowerCase().trim();
  return normalized.length > 0 ? normalized : fallback;
};

const BINARY_TO_BOOLEAN_MAP: Record<MatchingChoice, boolean> = {
  yes: true,
  no: false,
  co: true,
  khong: false,
  true: true,
  false: false,
};

const PRIOR_COUNSELING_MAP: Record<MatchingChoice, string> = {
  never: 'never',
  'chua bao gio': 'never',
  'previously, but was not effective': 'ineffective',
  'da tung, nhung khong hieu qua': 'ineffective',
  'previously, and found it helpful': 'effective',
  'da tung, va thay rat tot': 'effective',
};

const GENDER_MAP: Record<MatchingChoice, string> = {
  male: 'male',
  nam: 'male',
  female: 'female',
  nu: 'female',
  other: 'other',
  khac: 'other',
};

const SEXUAL_ORIENTATION_MAP: Record<MatchingChoice, string> = {
  straight: 'straight',
  gay: 'gay',
  lesbian: 'lesbian',
  bisexual: 'bisexual',
  pansexual: 'pansexual',
  asexual: 'asexual',
  'still exploring': 'exploring',
  'dang tim hieu': 'exploring',
  'prefer not to say': 'noAnswer',
  'khong muon noi': 'noAnswer',
};

const REASONS_MAP: Record<MatchingChoice, string> = {
  'anxiety, nervousness': 'anxiety',
  'lo au, hoi hop': 'anxiety',
  'sadness, loss of motivation': 'depression',
  'buon chan, mat dong luc': 'depression',
  'academic/exam pressure': 'stress',
  'ap luc hoc tap/thi cu': 'stress',
  'sleep issues': 'insomnia',
  'mat ngu': 'insomnia',
  'relationships/family': 'relationship',
  'moi quan he/gia dinh': 'relationship',
  'psychological trauma': 'trauma',
  'chan thuong tam ly': 'trauma',
  'eating disorder': 'eating',
  'roi loan an uong': 'eating',
};

const COMMUNICATION_STYLE_MAP: Record<MatchingChoice, string> = {
  listener: 'listener',
  'nguoi lang nghe': 'listener',
  guide: 'guide',
  'nguoi huong dan': 'guide',
  'combination of both': 'combined',
  'ket hop ca hai': 'combined',
};

const normalizeString = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .trim();

const mapChoiceToBoolean = (value: string): boolean => {
  const normalized = normalizeString(value);
  return BINARY_TO_BOOLEAN_MAP[normalized] ?? false;
};

const toMatchingPreferencesPayload = (
  data: MatchingFormData,
): MatchingPreferencesPayload => ({
  has_prior_counseling: mapChoiceValue(
    normalizeString(data.hasPriorCounseling),
    PRIOR_COUNSELING_MAP,
    normalizeString(data.hasPriorCounseling),
  ),
  gender: mapChoiceValue(
    normalizeString(data.gender),
    GENDER_MAP,
    normalizeString(data.gender),
  ),
  age: data.age.trim(),
  sexual_orientation: mapChoiceValue(
    normalizeString(data.sexualOrientation),
    SEXUAL_ORIENTATION_MAP,
    normalizeString(data.sexualOrientation),
  ),
  is_lgbtq_priority: mapChoiceToBoolean(data.isLgbtqPriority),
  self_harm_thought: mapChoiceValue(
    normalizeString(data.selfHarmThought),
    { yes: 'yes', no: 'no', co: 'yes', khong: 'no' },
    normalizeString(data.selfHarmThought),
  ),
  reasons: data.reasons.map(reason =>
    mapChoiceValue(
      normalizeString(reason),
      REASONS_MAP,
      normalizeString(reason),
    ),
  ),
  mood_levels: {
    anxiety: data.moodLevels.anxiety,
    lossInterest: data.moodLevels.lossInterest,
    fatigue: data.moodLevels.fatigue,
  },
  communication_style: mapChoiceValue(
    normalizeString(data.communicationStyle),
    COMMUNICATION_STYLE_MAP,
    normalizeString(data.communicationStyle),
  ),
});

export enum Specialty {
  CognitiveBehavioral = 'CognitiveBehavioral',
  Psychoanalysis = 'Psychoanalysis',
  FamilyTherapy = 'FamilyTherapy',
  // Add more specialties as needed
}

export interface AvailabilitySlot {
  day: string; // e.g., 'Monday'
  timeSlots: string[]; // e.g., ['09:00-10:00', '14:00-15:00']
}

export interface Therapist {
  id: string;
  name: string;
  specialty: Specialty;
  bio: string;
  rating: number;
  pricePerHour: number;
  imageUrl: string;
  availability: AvailabilitySlot[];
}

export interface BookSessionData {
  therapistId: string;
  userId: string;
  date: string;
  timeSlot: string;
}

export interface ActiveAssignedTherapist {
  assignmentId: string;
  profileId: string;
  assignedAt: string;
  id: string;
  fullName: string;
  specialization: string;
  communicationStyle: string;
  location: string;
  avatarUrl: string | null;
  status: string;
}

interface AssignedTherapistResponse {
  assignmentId: string;
  profileId: string;
  status: string;
  assignedAt: string;
  therapist: {
    id: string;
    full_name: string;
    specialization: string;
    communication_style: string;
    location?: string;
    avatar_url?: string;
  };
}

export const getTherapists = async (): Promise<Therapist[]> => {
  try {
    const response = await therapistAxiosClient.get<Therapist[]>('/api/v1/therapists');
    return response.data;
  } catch (error) {
    // Handle or rethrow error
    throw error;
  }
};

export const getTherapistDetails = async (id: string): Promise<Therapist> => {
  try {
    const response = await therapistAxiosClient.get<Therapist>(
      `/api/v1/therapists/${id}`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const bookSession = async (
  data: BookSessionData,
): Promise<Record<string, unknown>> => {
  try {
    const response = await therapistAxiosClient.post('/api/v1/bookings', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const saveMatchingData = async (
  data: MatchingFormData,
): Promise<void> => {
  try {
    const payload = toMatchingPreferencesPayload(data);
    await therapistAxiosClient.post('/api/v1/matching/preferences', payload);
  } catch (error) {
    throw error;
  }
};

export const getActiveAssignedTherapist = async (
  profileId: string,
): Promise<ActiveAssignedTherapist | null> => {
  try {
    const response = await therapistAxiosClient.get<AssignedTherapistResponse>(
      `/api/v1/profiles/${profileId}/assigned-therapist`,
    );
    const assigned = response.data;

    return {
      assignmentId: assigned.assignmentId,
      profileId: assigned.profileId,
      assignedAt: assigned.assignedAt,
      id: assigned.therapist.id,
      fullName: assigned.therapist.full_name,
      specialization: assigned.therapist.specialization,
      communicationStyle: assigned.therapist.communication_style,
      location: assigned.therapist.location ?? 'Đang cập nhật cơ sở',
      avatarUrl: assigned.therapist.avatar_url ?? null,
      status: assigned.status,
    };
  } catch (error) {
    // Backend returns 404 when the profile has no ACTIVE assignment.
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }

    throw error;
  }
};
