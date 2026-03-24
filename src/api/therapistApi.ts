// src/api/therapistApi.ts

// ✅ Correct
import axiosClient from './axiosClient';
import { MatchingFormData } from '../types/matching';


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

export const getTherapists = async (): Promise<Therapist[]> => {
    try {
      const response = await axiosClient.get<Therapist[]>('/api/v1/therapists');
      return response.data;
    } catch (error) {
      // Handle or rethrow error
      throw error;
    }
  };
  
  export const getTherapistDetails = async (id: string): Promise<Therapist> => {
    try {
      const response = await axiosClient.get<Therapist>(`/api/v1/therapists/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };
  
  export const bookSession = async (data: BookSessionData): Promise<any> => {
    try {
      const response = await axiosClient.post('/api/v1/bookings', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  export const saveMatchingData = async (data: MatchingFormData): Promise<void> => {
    try {
      await axiosClient.post('/therapists/matching', data);
    } catch (error) {
      throw error;
    }
  };

