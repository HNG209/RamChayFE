// redux/services/authApi.ts
import { baseApi } from "./baseApi";
import {
  LoginRequest,
  AuthResponse,
  RegisterRequest,
  RegisterResponse,
} from "@/types/backend";

// Sử dụng injectEndpoints để thêm vào gốc
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials: LoginRequest) => ({
        url: "/auth/login",
        method: "POST",
        data: credentials,
      }),
    }),

    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (data: RegisterRequest) => ({
        url: "/auth/register",
        method: "POST",
        data: data,
      }),
    }),

    // Ví dụ API lấy thông tin user hiện tại
    // getProfile: builder.query<any, void>({
    //   query: () => ({
    //     url: '/users/profile',
    //     method: 'GET',
    //   }),
    // }),
  }),
  overrideExisting: false, // Để tránh ghi đè nếu lỡ import 2 lần
});

// Xuất Hooks riêng từ file này
export const {
  useLoginMutation,
  useRegisterMutation,
  // useGetProfileQuery
} = authApi;
