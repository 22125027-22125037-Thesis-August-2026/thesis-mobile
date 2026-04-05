export type UserRole = 'TEEN' | 'PARENT' | 'THERAPIST' | 'ADMIN';

// Base profile data returned by /api/v1/auth/me
export interface User {
  profileId: string;
  role: UserRole;
  fullName: string;
  avatarUrl?: string;
  email?: string;
}

// Dữ liệu trả về khi Login thành công
export interface AuthResponse {
  token: string;
  profileId: string;
  role: UserRole;
}

export interface RegisterPayload {
  fullName: string;
  avatarUrl?: string;
  email: string;
  password: string;
  phoneNumber?: string;
  dob?: string;
  role: UserRole;
  school?: string;
  emergencyContact?: string;
  specialization?: string;
  bio?: string;
  yearsOfExperience?: number;
  consultationFee?: number;
  verified?: boolean;
  linkedTeenId?: string;
}
