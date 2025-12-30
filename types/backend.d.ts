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
  email?: string;
}

export interface RegisterResponse {
  id: number;
  username: string;
  fullName: string;
  phone: string[];
}

export interface Address {
  id: number;
  city: string;
  ward: string;
  street?: string;
  personalAddress: string;
  fullAddress?: string; // Combined address string for display
}

export interface CustomerUpdateRequest {
  fullName: string;
  phones: string[];
  email: string;
  addresses: Address[];
}

export interface MyProfile {
  // Thông tin chung
  id: number;
  username: string;
  fullName: string;
  email?: string;
  roles: string[];
  permissions: string[];

  // Nếu là customer, có thêm thông tin liên quan
  phones: string[];
  addresses: Address[];
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

// Product type for display
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  unit: string;
  indexImage?: string;
  images?: string[];
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

// Order
export interface OrderItemRequest {
  cartItemId: number;
  quantity: number;
}

export interface AddressCreationRequest {
  city: string;
  ward: string;
  street?: string;
  personalAddress: string;
}

export interface OrderCreationRequest {
  customerId?: number; // Optional for guest users
  receiverName: string;
  receiverPhone: string;
  shippingAddress: string;
  paymentMethod: "COD" | "QRPAY";
  email?: string; // Email for order confirmation (required for guest, optional for logged-in users)
  items: OrderItemRequest[];
}

export interface OrderCreationResponse {
  id: number;
  orderId: number;
  message: string;
}

export interface OrderListItem {
  id: number;
  orderDate: string;
  total: number;
  orderStatus: string;
  paymentMethod: string;
  itemCount: number;
}

export interface OrderDetailItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  indexImage?: string;
}

export interface OrderDetail {
  id: number;
  customerId: number;
  customerName: string;
  receiverName: string;
  receiverPhone: string;
  shippingAddress: string;
  paymentMethod: "COD" | "QRPAY";
  totalAmount: number;
  orderStatus:
    | "PENDING"
    | "CONFIRMED"
    | "SHIPPING"
    | "DELIVERED"
    | "CANCELLED"
    | "PENDING_PAYMENT";
  createdAt: string;
  updatedAt: string;
  items: OrderDetailItem[];
}

// Backend response structure
export interface OrderDetailBackendResponse {
  id: number;
  orderDate: string;
  total: number;
  orderStatus: string;
  paymentMethod: string;
  receiverName: string;
  receiverPhone: string;
  shippingAddress: string;
  customer: {
    id: number;
    username: string;
    fullName: string | null;
  };
  orderDetails: Array<{
    id: number;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    product: {
      id: number;
      name: string;
      price: number;
      indexImage?: string;
    };
  }>;
}

export interface RagProductResponse {
  id: number;
  name: string;
  indexImage: string;
  price: number;
}

export interface RagResponse {
  answer: string;
  responseList: RagProductResponse[];
}
