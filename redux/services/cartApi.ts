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
      invalidatesTags: ["Cart"],
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

    updateCartItem: builder.mutation<
      void,
      { itemId: number; quantity: number }
    >({
      query: ({ itemId, quantity }) => ({
        url: `/cart-items/${itemId}`,
        method: "PUT",
        data: { quantity },
      }),
      // invalidatesTags: ["Cart"],
    }),

    deleteCartItem: builder.mutation<void, { itemId: number }>({
      query: ({ itemId }) => ({
        url: `/cart-items/${itemId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"],
    }),
  }),
  overrideExisting: false, // Để tránh ghi đè nếu lỡ import 2 lần
});

// Xuất Hooks riêng từ file này
export const {
  useAddItemMutation,
  useGetCartItemsQuery,
  useUpdateCartItemMutation,
  useDeleteCartItemMutation,
} = cartApi;
