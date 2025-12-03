// redux/services/cartApi.ts
import { baseApi } from "./baseApi";
import {
  AddCartItemResponse,
  CartItemCreationRequest,
  GetItemsResponse,
  Page,
} from "@/types/backend";

export const cartApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    addItem: builder.mutation<AddCartItemResponse, CartItemCreationRequest>({
      // Thêm item vào giỏ hàng
      query: (data: CartItemCreationRequest) => ({
        url: "/carts",
        method: "POST",
        data: data,
      }),
    }),

    getCartItems: builder.query<
      Page<GetItemsResponse>,
      { page?: number; size?: number }
    >({
      query: ({ page = 0, size = 10 }) => ({
        url: "/cart-items",
        method: "GET",
        params: { page, size },
      }),
      providesTags: ["Cart"],
    }),
  }),

  overrideExisting: false, // Để tránh ghi đè nếu lỡ import 2 lần
});

// Xuất Hooks riêng từ file này
export const { useAddItemMutation, useGetCartItemsQuery } = cartApi;
