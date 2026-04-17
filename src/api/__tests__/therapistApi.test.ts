// src/api/__tests__/therapistApi.test.ts

import therapistAxiosClient from '@/api/therapistAxiosClient';
import {
  getTherapists,
  getTherapistDetails,
  getTherapistAvailableSlots,
  bookSession,
  saveMatchingData,
  getActiveAssignedTherapist,
  Therapist,
  TherapistDetail,
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
    const therapist: TherapistDetail = {
      id: '1',
      fullName: 'Alice',
      avatarUrl: '',
      specialty: Specialty.CognitiveBehavioral,
      location: 'Ho Chi Minh City',
      bio: 'Bio',
      stats: {
        patientCount: 42,
        yearsOfExperience: 12,
        averageRating: 4.8,
        reviewCount: 10,
      },
      workingHours: [
        {
          dayLabel: 'Monday',
          startTime: '08:00',
          endTime: '16:00',
        },
      ],
      reviews: [
        {
          id: 'review-1',
          reviewerName: 'Anonymous Patient',
          reviewerAvatarUrl: null,
          rating: 5,
          comment: 'Very helpful',
          createdAt: '2026-04-15T07:40:03.011Z',
        },
      ],
    };

    mockedAxios.get.mockResolvedValueOnce({ data: therapist });
    const result = await getTherapistDetails('1');

    expect(result).toEqual(therapist);
    expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/therapists/1');
  });

  it('getTherapistAvailableSlots returns paginated slot content', async () => {
    const slots = [
      {
        slotId: 'slot-1',
        startDatetime: '2026-04-20T08:00:00Z',
        endDatetime: '2026-04-20T08:50:00Z',
      },
    ];

    mockedAxios.get.mockResolvedValueOnce({ data: { content: slots } });
    const result = await getTherapistAvailableSlots('therapist-1');

    expect(result).toEqual(slots);
    expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/therapists/therapist-1/slots', {
      params: {
        page: 0,
        size: 200,
        sort: 'startDatetime,asc',
      },
    });
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

  it('getActiveAssignedTherapist returns assigned therapist from profile endpoint', async () => {
    const profileId = 'profile-123';
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        assignmentId: 'assign-1',
        profileId,
        status: 'ACTIVE',
        assignedAt: '2026-04-15T08:10:19.251Z',
        therapist: {
          id: 'therapist-2',
          full_name: 'Dr. Active',
          specialization: 'Anxiety',
          communication_style: 'empathetic',
        },
      },
    });

    const result = await getActiveAssignedTherapist(profileId);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      '/api/v1/profiles/profile-123/assigned-therapist',
    );
    expect(result).toEqual({
      assignmentId: 'assign-1',
      profileId,
      assignedAt: '2026-04-15T08:10:19.251Z',
      id: 'therapist-2',
      fullName: 'Dr. Active',
      specialization: 'Anxiety',
      communicationStyle: 'empathetic',
      location: 'Đang cập nhật cơ sở',
      avatarUrl: null,
      status: 'ACTIVE',
    });
  });

  it('getActiveAssignedTherapist returns null when backend returns 404', async () => {
    mockedAxios.get.mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 404 },
    });

    const result = await getActiveAssignedTherapist('profile-404');
    expect(result).toBeNull();
  });
});