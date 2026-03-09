// src/api/__tests__/therapistApi.test.ts

import { getTherapists, getTherapistDetails, bookSession, Therapist, BookSessionData } from '../therapistApi';
import axiosClient from '../index';

jest.mock('../index');

const mockedAxios = axiosClient as jest.Mocked<typeof axiosClient>;

describe('therapistApi', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('getTherapists returns therapists list', async () => {
    const therapists: Therapist[] = [{ id: '1', name: 'Alice', specialty: 0, bio: '', rating: 5, pricePerHour: 100, imageUrl: '', availability: [] }];
    mockedAxios.get.mockResolvedValueOnce({ data: therapists });
    const result = await getTherapists();
    expect(result).toEqual(therapists);
    expect(mockedAxios.get).toHaveBeenCalledWith('/therapists');
  });

  it('getTherapistDetails returns therapist details', async () => {
    const therapist: Therapist = { id: '1', name: 'Alice', specialty: 0, bio: '', rating: 5, pricePerHour: 100, imageUrl: '', availability: [] };
    mockedAxios.get.mockResolvedValueOnce({ data: therapist });
    const result = await getTherapistDetails('1');
    expect(result).toEqual(therapist);
    expect(mockedAxios.get).toHaveBeenCalledWith('/therapists/1');
  });

  it('bookSession posts booking data', async () => {
    const bookingData: BookSessionData = { therapistId: '1', userId: '2', date: '2024-06-01', timeSlot: '09:00-10:00' };
    const bookingResponse = { success: true };
    mockedAxios.post.mockResolvedValueOnce({ data: bookingResponse });
    const result = await bookSession(bookingData);
    expect(result).toEqual(bookingResponse);
    expect(mockedAxios.post).toHaveBeenCalledWith('/bookings', bookingData);
  });

  it('getTherapists throws on error', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));
    await expect(getTherapists()).rejects.toThrow('Network error');
  });

  it('getTherapistDetails throws on error', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Not found'));
    await expect(getTherapistDetails('1')).rejects.toThrow('Not found');
  });

  it('bookSession throws on error', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Booking failed'));
    await expect(bookSession({ therapistId: '1', userId: '2', date: '2024-06-01', timeSlot: '09:00-10:00' })).rejects.toThrow('Booking failed');
  });
});