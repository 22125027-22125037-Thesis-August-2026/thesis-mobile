export type UserRole = 'TEEN' | 'PARENT' | 'THERAPIST' | 'ADMIN';

// Base profile data returned by /api/v1/auth/me
export interface User {
  profileId: string;
  role: UserRole;
  fullName: string;
  avatarUrl?: string;
  email?: string;
  phoneNumber?: string;
  dob?: string;
}

// Dữ liệu trả về khi Login thành công
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
  /** Access-token lifetime in seconds (e.g. 900 for 15 min). */
  expiresIn?: number;
  /** @deprecated legacy single-token field, kept during backend rollout. */
  token?: string;
  profileId: string;
  role: UserRole;
}

// Dữ liệu trả về khi gọi /auth/refresh (refresh token xoay vòng mỗi lần)
export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
  expiresIn?: number;
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
