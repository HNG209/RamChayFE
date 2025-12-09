// redux/services/authApi.ts
import { baseApi } from "./baseApi";
import { LoginRequest, LoginResponse, MyProfile, RegisterRequest, RegisterResponse } from "@/types/backend";

// Sử dụng injectEndpoints để thêm vào gốc
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials: LoginRequest) => ({
        url: "/auth/login",
        method: "POST",
        data: credentials,
      }),
      invalidatesTags: ["User", "Cart", "Order"], // Clear cache for new user
    }),

    adminLogin: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials: LoginRequest) => ({
        url: "/auth/admin-login",
        method: "POST",
        data: credentials,
      }),
      invalidatesTags: ["User"], // admin không có Cart
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["Cart", "Order"],
    }),

    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (data: RegisterRequest) => ({
        url: "/auth/register",
        method: "POST",
        data: data,
      }),
    }),

    // Lấy người dùng đang đăng nhập
    getMyProfile: builder.query<MyProfile, void>({
      query: () => ({
        url: "/auth/me",
        method: "GET",
      }),
      providesTags: ["User"],
    }),
  }),
  overrideExisting: false, // Để tránh ghi đè nếu lỡ import 2 lần
});

// Xuất Hooks riêng từ file này
export const { useLoginMutation, useAdminLoginMutation, useRegisterMutation, useGetMyProfileQuery, useLogoutMutation } =
  authApi;
