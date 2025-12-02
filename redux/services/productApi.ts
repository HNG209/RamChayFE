import { baseApi } from "./baseApi";
import { ProductCreationRequest, ProductCreationResponse } from "@/types/backend";

export const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Lấy danh sách: Trả về mảng ProductCreationResponse
    getProducts: builder.query<ProductCreationResponse[], void>({
      query: () => ({
        url: "/products",
        method: "GET", // Mặc định axios là GET nhưng khai báo rõ càng tốt
      }),
      providesTags: ["Product"],
    }),

    // 2. Tạo sản phẩm
    createProduct: builder.mutation<ProductCreationResponse, ProductCreationRequest & { images: File[] }>({
      query: ({ images, ...productData }) => {
        const formData = new FormData();
        formData.append("product", JSON.stringify(productData));
        if (images && images.length > 0) {
          images.forEach((file) => formData.append("image", file));
        }

        return {
          url: "/products",
          method: "POST",
          data: formData,
          headers: { "Content-Type": undefined },
        };
      },
      invalidatesTags: ["Product"],
    }),

    // 3. Xóa sản phẩm
    deleteProduct: builder.mutation<void, number>({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateProductMutation,
  useGetProductsQuery,
  useDeleteProductMutation
} = productApi;