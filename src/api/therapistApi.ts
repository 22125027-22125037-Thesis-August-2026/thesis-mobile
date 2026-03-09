// src/api/therapistApi.ts

// ✅ Correct
import axiosClient from './axiosClient';


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
      const response = await axiosClient.get<Therapist[]>('/therapists');
      return response.data;
    } catch (error) {
      // Handle or rethrow error
      throw error;
    }
  };
  
  export const getTherapistDetails = async (id: string): Promise<Therapist> => {
    try {
      const response = await axiosClient.get<Therapist>(`/therapists/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };
  
  export const bookSession = async (data: BookSessionData): Promise<any> => {
    try {
      const response = await axiosClient.post('/bookings', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

