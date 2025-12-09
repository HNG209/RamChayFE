import { baseApi } from "./baseApi";
import { PageResponse } from "@/types/backend"; // Import PageResponse chung

// Định nghĩa kiểu dữ liệu Category (nếu chưa có thì bạn thêm vào types/backend.ts)
export interface Category {
  id: number;
  categoryName: string;
  description: string;
}

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Lấy danh sách phân trang (MỚI THÊM)
    getCategoriesPage: builder.query<PageResponse<Category>, { page: number; size: number }>({
      query: ({ page, size }) => ({
        url: "/categories/page", // Đảm bảo Backend có endpoint này
        method: "GET",
        params: { page, size },
      }),
      providesTags: ["Category"],
    }),

    // 2. Lấy tất cả (Dùng cho dropdown ở trang Product - Giữ nguyên)
    getCategories: builder.query<Category[], void>({
      query: () => ({
        url: "/categories",
        method: "GET",
      }),      providesTags: ["Category"],
    }),

    // 3. Tạo danh mục
    createCategory: builder.mutation<Category, { categoryName: string; description: string }>({
      query: (body) => ({
        url: "/categories",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Category"], // Reset lại cache để load lại danh sách mới
    }),

    // 4. Xóa danh mục
    deleteCategory: builder.mutation<void, number>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category"],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetCategoriesPageQuery, // Hook mới
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;