import axios from "axios";
import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import type { AxiosRequestConfig, AxiosError } from "axios";

let isRefreshing = false;
let failedQueue: any[] = [];


const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  result: T;
}

const api = axios.create({
  baseURL: "http://localhost:8081/api", // Server Spring Boot
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Cho phép gửi/nhận HttpOnly Cookie
});

api.interceptors.response.use(
  (response) => {
    // Lấy data gốc từ server
    const data = response.data as ApiResponse;

    // Kiểm tra xem có đúng format Spring Boot không (có field code và result)
    if (data && typeof data.code === "number") {
      if (data.code === 1000) {
        response.data = data.result;
        return response;
      }

      return Promise.reject({
        response: response,
        message: data.message || "Lỗi nghiệp vụ không xác định",
        code: data.code, // Lưu lại mã lỗi để hiển thị nếu cần
      });
    }

    // Trường hợp khác (File, Blob...) thì trả về nguyên gốc
    return response;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response, // Success thì cho qua
  async (error) => {
    const originalRequest = error.config || error.response?.config;

    // Lấy mã lỗi: Ưu tiên lấy từ object tự reject ở trên (error.code)
    const errorCode = error.response.data.code || error.response?.status;

    // KIỂM TRA: Nếu là lỗi 3005 (Hết hạn) và chưa từng retry
    if (errorCode === 3005 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalRequest); // Gọi lại request cũ sau khi refresh xong
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      // Nếu chưa ai refresh -> Mình xung phong đi refresh
      originalRequest._retry = true; // Đánh dấu để không lặp vô tận
      isRefreshing = true;

      try {
        // GỌI API REFRESH
        // Vì dùng Cookie HttpOnly, trình duyệt tự gửi RefreshToken đi
        await api.post("/auth/refresh");

        // Nếu thành công -> AccessToken mới đã được Server set vào Cookie

        processQueue(null);

        // Gọi lại request ban đầu bị lỗi
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh thất bại (RefreshToken cũng hết hạn hoặc bị thu hồi)
        processQueue(refreshError, null);

        await api.post("/auth/logout");

        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false; // Mở khóa
      }
    }
    return Promise.reject(error);
  }
);

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
  async ({ url, method, data, params, headers }) => {
    try {
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
