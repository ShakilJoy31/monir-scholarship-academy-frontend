export type UserRole = 'school-admin' | 'branch-admin' | 'teacher' | 'student';

export interface LoginPayload {
  email?: string;
  phone?: string;
  ID?: string;
  password: string;
}

export interface AuthResponse {
  accessToken?: string;
  token?: string;
  data?: unknown;
  message: string;
}