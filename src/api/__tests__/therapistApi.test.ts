// src/api/__tests__/therapistApi.test.ts

import therapistAxiosClient from '@/api/therapistAxiosClient';
import {
  getTherapists,
  getTherapistDetails,
  bookSession,
  saveMatchingData,
  Therapist,
  BookSessionData,
  Specialty,
} from '@/api/therapistApi';
import { MatchingFormData } from '@/types';

jest.mock('@/api/therapistAxiosClient', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockedAxios = therapistAxiosClient as jest.Mocked<typeof therapistAxiosClient>;

describe('therapistApi', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('getTherapists returns therapists list', async () => {
    const therapists: Therapist[] = [
      {
        id: '1',
        name: 'Alice',
        specialty: Specialty.CognitiveBehavioral,
        bio: '',
        rating: 5,
        pricePerHour: 100,
        imageUrl: '',
        availability: [],
      },
    ];

    mockedAxios.get.mockResolvedValueOnce({ data: therapists });
    const result = await getTherapists();

    expect(result).toEqual(therapists);
    expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/therapists');
  });

  it('getTherapistDetails returns therapist details', async () => {
    const therapist: Therapist = {
      id: '1',
      name: 'Alice',
      specialty: Specialty.CognitiveBehavioral,
      bio: '',
      rating: 5,
      pricePerHour: 100,
      imageUrl: '',
      availability: [],
    };

    mockedAxios.get.mockResolvedValueOnce({ data: therapist });
    const result = await getTherapistDetails('1');

    expect(result).toEqual(therapist);
    expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/therapists/1');
  });

  it('bookSession posts booking data', async () => {
    const bookingData: BookSessionData = {
      therapistId: '1',
      userId: '2',
      date: '2024-06-01',
      timeSlot: '09:00-10:00',
    };
    const bookingResponse: Record<string, unknown> = { success: true };

    mockedAxios.post.mockResolvedValueOnce({ data: bookingResponse });
    const result = await bookSession(bookingData);

    expect(result).toEqual(bookingResponse);
    expect(mockedAxios.post).toHaveBeenCalledWith('/api/v1/bookings', bookingData);
  });

  it('saveMatchingData posts documented matching payload', async () => {
    const formData: MatchingFormData = {
      hasPriorCounseling: 'Previously, but was not effective',
      gender: 'Female',
      age: '22',
      sexualOrientation: 'Still exploring',
      isLgbtqPriority: 'Yes',
      selfHarmThought: 'No',
      reasons: ['Sleep issues', 'Academic/exam pressure'],
      moodLevels: {
        anxiety: 3,
        lossInterest: 2,
        fatigue: 4,
      },
      communicationStyle: 'Guide',
    };

    mockedAxios.post.mockResolvedValueOnce({ status: 204, data: undefined });
    await saveMatchingData(formData);

    expect(mockedAxios.post).toHaveBeenCalledWith('/api/v1/matching/preferences', {
      has_prior_counseling: 'ineffective',
      gender: 'female',
      age: '22',
      sexual_orientation: 'exploring',
      is_lgbtq_priority: true,
      self_harm_thought: 'no',
      reasons: ['insomnia', 'stress'],
      mood_levels: {
        anxiety: 3,
        lossInterest: 2,
        fatigue: 4,
      },
      communication_style: 'guide',
    });
  });
});