import { baseApi } from "./baseApi";
import { CategoryCreationRequest, CategoryCreationResponse } from "@/types/backend";

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Lấy danh sách
    getCategories: builder.query<CategoryCreationResponse[], void>({
      query: () => ({
        url: "/categories",
        method: "GET",
      }),
      providesTags: ["Category"], // Tag để tự động refresh
    }),

    // 2. Thêm danh mục
    createCategory: builder.mutation<CategoryCreationResponse, CategoryCreationRequest>({
      query: (payload) => ({
        url: "/categories",
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["Category"], // Thêm xong tự load lại danh sách
    }),

    // 3. Xóa danh mục
    deleteCategory: builder.mutation<void, number>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category"], // Xóa xong tự load lại danh sách
    }),
  }),
  overrideExisting: false,
});

export const { 
  useGetCategoriesQuery, 
  useCreateCategoryMutation, 
  useDeleteCategoryMutation 
} = categoryApi;