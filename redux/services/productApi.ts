import { baseApi } from "./baseApi";
import { ProductCreationRequest, ProductCreationResponse, PageResponse } from "@/types/backend";

export const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Lấy danh sách phân trang & Lọc
    getProductsPage: builder.query<PageResponse<ProductCreationResponse>, { page: number; size: number; keyword: string; categoryId: string | number }>({
      query: ({ page, size, keyword, categoryId }) => {
        // Tạo object params
        const params: Record<string, any> = {
          page,
          size,
          keyword,
        };

        // Chỉ gửi categoryId lên nếu nó khác "all" và có giá trị
        // Việc này an toàn hơn gửi chuỗi rỗng "" lên backend (Spring Boot đôi khi không parse được "" sang Long)
        if (categoryId && categoryId !== "all") {
          params.categoryId = categoryId;
        }

        return {
          url: "/products/page",
          method: "GET",
          params: params, // RTK Query sẽ tự convert object này thành query string an toàn
        };
      },
      providesTags: ["Product"],
    }),

    // 2. Lấy tất cả danh mục
    getAllCategories: builder.query<any, void>({
      query: () => ({
        url: "/categories", // Đảm bảo bạn đã có CategoryController mapping này
        method: "GET",
      }),
    }),

    // 3. Lấy tất cả sản phẩm (List thường - dùng cho select box hoặc export)
    getProducts: builder.query<ProductCreationResponse[], void>({
      query: () => ({
        url: "/products",
        method: "GET",
      }),
      providesTags: ["Product"],
    }),

    // 4. Tạo sản phẩm mới (Multipart)
    createProduct: builder.mutation<ProductCreationResponse, ProductCreationRequest & { images: File[] }>({
      query: ({ images, ...productData }) => {
        const formData = new FormData();
        // Backend yêu cầu @RequestPart("product") là JSON string
        formData.append("product", JSON.stringify(productData));
        
        // Backend yêu cầu @RequestPart("image") là List<File>
        if (images && images.length > 0) {
          images.forEach((file) => formData.append("image", file));
        }
        
        return { 
          url: "/products", 
          method: "POST", 
          data: formData, 
          // Để undefined để browser tự set boundary cho multipart
          headers: { "Content-Type": undefined } 
        };
      },
      invalidatesTags: ["Product"],
    }),

    // 5. Xóa sản phẩm
    deleteProduct: builder.mutation<void, number>({
      query: (id) => ({ 
        url: `/products/${id}`, 
        method: "DELETE" 
      }),
      invalidatesTags: ["Product"],
    }),

    // 6. Lấy chi tiết 1 sản phẩm
    getProductById: builder.query<ProductCreationResponse, number>({
      query: (id) => ({ 
        url: `/products/${id}`, 
        method: "GET" 
      }),
      providesTags: (result, error, id) => [{ type: "Product", id }],
    }),

    // 7. Cập nhật sản phẩm
    updateProduct: builder.mutation<ProductCreationResponse, { id: number; data: FormData }>({
      query: ({ id, data }) => ({ 
        url: `/products/${id}`, 
        method: "PUT", 
        data: data, 
        headers: { "Content-Type": undefined } 
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Product", id }, "Product"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetProductsPageQuery,
  useGetAllCategoriesQuery,
  useGetProductsQuery,
  useCreateProductMutation,
  useDeleteProductMutation,
  useGetProductByIdQuery,
  useUpdateProductMutation,
} = productApi;