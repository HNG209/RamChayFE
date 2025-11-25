// types/backend.d.ts

// Dữ liệu gửi đi khi Login
export interface LoginRequest {
  username: string;
  password: string;
}

// Dữ liệu nhận về từ API Login
export interface AuthResponse {
  token: string;
  roles: string[];
  expiresIn?: number;
}

// Ví dụ tái sử dụng cho User sau này
export interface UserProfile {
  id: number;
  fullName: string;
  email: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  fullName: string;
  phone: string;
}

export interface RegisterResponse {
  id: number;
  username: string;
  fullName: string;
  phone: string[];
}