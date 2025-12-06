// types/backend.d.ts

// Dữ liệu gửi đi khi Login
export interface LoginRequest {
  username: string;
  password: string;
}

// Dữ liệu nhận về từ API Login
export interface LoginResponse {
  message: string;
  refreshToken: string;
  accessToken: string;
  // expiresIn?: number;
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

export interface MyProfile {
  id: number;
  username: string;
  roles: string[];
  permissions: string[];

  fullName: string;
  phones: string[];
  addresses: string[];
}

export interface CategoryCreationRequest {
  categoryName: string;
  description: string;
}

export interface CategoryCreationResponse {
  id: number;
  categoryName: string;
  description: string;
}

export interface MediaUploadRequest {
  publicId: string;
  secureUrl: string;
}

export interface MediaUploadResponse {
  id: number;
  publicId: string;
  secureUrl: string;
}

export interface ProductCreationRequest {
  name: string;
  description: string;
  price: number;
  stock: number;
  unit: string;
  category: CategoryCreationRequest;
  indexImage?: string;
  mediaUploadRequests: MediaUploadRequest[];
  imageIdsToDelete?: number[]; 

}

export interface ProductCreationResponse {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  unit: string;

  indexImage?: string;
  category?: CategoryCreationResponse;
  mediaList?: MediaUploadResponse[];
}

