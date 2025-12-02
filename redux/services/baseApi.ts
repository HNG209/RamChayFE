// redux/services/baseApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../axiosBaseQuery';

// Tạo API rỗng
export const baseApi = createApi({
  reducerPath: 'api', // Tên định danh trong Store
  baseQuery: axiosBaseQuery(), // Dùng Axios
  // Khai báo trước các Tag để dùng cho Caching (quan trọng cho Product)
  tagTypes: ['User', 'Product', 'Cart','Manager'], 
  endpoints: () => ({}),
});