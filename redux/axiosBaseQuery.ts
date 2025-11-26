import axios from "axios";
import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import type { AxiosRequestConfig, AxiosError } from "axios";

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
      // TRƯỜNG HỢP 1: THÀNH CÔNG (Code 1000)
      if (data.code === 1000) {
        // Quan trọng: Gán lại data bằng chính cái result bên trong
        // Giúp bỏ đi lớp vỏ bọc ApiResponse
        response.data = data.result;
        return response;
      }

      // TRƯỜNG HỢP 2: LỖI NGHIỆP VỤ (HTTP 200 nhưng Code != 1000)
      // Ví dụ: User tồn tại, Sai password...
      // Ta phải ném lỗi để code nhảy xuống catch
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
    // Xử lý lỗi HTTP (401, 403, 404, 500...)

    // (Chỗ này sau này bạn sẽ chèn logic Refresh Token nếu gặp lỗi 401)

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
