import axios from "axios";
import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import type { AxiosRequestConfig, AxiosError } from "axios";

const api = axios.create({
  baseURL: "http://localhost:8081/api", // Server Spring Boot
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // <--- QUAN TRỌNG: Cho phép gửi/nhận HttpOnly Cookie
});

// (Chỗ này sau này bạn sẽ viết Interceptor để Refresh Token)
// api.interceptors.response.use(...)

export const axiosBaseQuery =
  (): BaseQueryFn<
    {
      url: string;
      method?: AxiosRequestConfig["method"];
      data?: AxiosRequestConfig["data"];
      params?: AxiosRequestConfig["params"];
      headers?: AxiosRequestConfig["headers"];
    },
    unknown,
    unknown
  > =>
  // Đây là lúc RTK Query ra lệnh: "Hãy gọi API này cho tôi"
  async ({ url, method, data, params, headers }) => {
    try {
      // Gọi thằng nhân viên Axios đi làm việc
      const result = await api({
        url: url,
        method: method,
        data: data,
        params: params,
        headers: headers,
      });

      // Dịch kết quả thành công: RTK Query cần object có key là { data: ... }
      return { data: result.data };
    } catch (axiosError) {
      // Dịch kết quả thất bại: RTK Query cần object có key là { error: ... }
      const err = axiosError as AxiosError;
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };
