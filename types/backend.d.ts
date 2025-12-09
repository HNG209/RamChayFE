// types/backend.d.ts

export interface ApiResponse<T> {
  code: number;
  message: string;
  result?: T;
}

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
  // Thông tin chung
  id: number;
  username: string;
  fullName: string;
  roles: string[];
  permissions: string[];

  // Nếu là customer, có thêm thông tin liên quan
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
  categoryId: number;
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
// Cart
export interface CartProduct {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock: number; // Số lượng tồn kho
}

export interface CartItemCreationRequest {
  quantity: number;
  unitPrice: number;
  subtotal: number;
  productId: number;
}

export interface AddCartItemResponse {
  cartId?: number;
}

export interface GetItemsResponse {
  id: number;
  productName: string;
  quantity: number;
  productId: number;
  unitPrice: number;
  indexImage: string;
}

export interface GetItemsResponseWithSelected extends GetItemsResponse {
  selected: boolean;
}

export interface Page<T> {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface PageResponse<T> {
    content: T[];
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
}
