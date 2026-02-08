// Dữ liệu User trả về từ API /me
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'PATIENT' | 'DOCTOR' | 'MANAGER';
  creditsBalance: number;
}

// Dữ liệu trả về khi Login thành công
export interface AuthResponse {
  token: string;
  email: string;
  role: string;
}