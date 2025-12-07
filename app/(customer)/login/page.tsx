// app/login/page.tsx
"use client";

import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { useState } from "react";
// Import kiểu dữ liệu đã định nghĩa để tái sử dụng
import { LoginResponse, LoginRequest, ApiResponse } from "@/types/backend";
import Link from "next/link";
import { useLoginMutation } from "@/redux/services/authApi";

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const [login, { isLoading: isLoggingIn }] = useLoginMutation();

  // Cấu hình Formik
  const formik = useFormik<LoginRequest>({
    // 1. Giá trị khởi tạo
    initialValues: {
      username: "",
      password: "",
    },

    // 2. Định nghĩa luật kiểm tra (Validation Schema) dùng Yup
    validationSchema: Yup.object({
      username: Yup.string()
        .required("Vui lòng nhập tên đăng nhập")
        .min(4, "Tên đăng nhập phải dài hơn 4 ký tự"),
      password: Yup.string()
        .required("Vui lòng nhập mật khẩu")
        .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    }),

    // 3. Hàm chạy khi bấm nút Submit (và đã qua bước kiểm tra lỗi)
    onSubmit: async (values, { setSubmitting }) => {
      setServerError(null);

      try {
        await login(values).unwrap();
        // --- GIẢ LẬP GỌI API ---
        // await new Promise((r) => setTimeout(r, 1000));

        if (values.password === "wrong") {
          throw new Error("Mật khẩu không đúng (Test Formik)");
        }

        router.push("/");
      } catch (err: any) {
        const error = err?.data as ApiResponse<null>;
        setServerError(error.message || "Lỗi hệ thống");
      } finally {
        setSubmitting(false); // Báo cho Formik biết đã xử lý xong
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-light p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-lime-accent">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Đăng Nhập
        </h2>

        {/* Lỗi từ Server trả về (ví dụ: Sai pass) */}
        {serverError && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded border border-red-200">
            {serverError}
          </div>
        )}

        <form onSubmit={formik.handleSubmit} className="space-y-5">
          {/* USERNAME FIELD */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Tên đăng nhập
            </label>
            <input
              id="username"
              // name="username" // Quan trọng: phải trùng với initialValues
              type="text"
              // Dùng spread syntax của Formik để tự bind value và onChange
              {...formik.getFieldProps("username")}
              className={`w-full px-4 py-3 rounded-xl bg-cream-dark border outline-none transition-all
                ${
                  formik.touched.username && formik.errors.username
                    ? "border-red-500 focus:ring-red-200"
                    : "border-lime-accent focus:border-lime-primary focus:ring-2 focus:ring-lime-primary/20"
                }`}
              placeholder="Nhập username..."
            />
            {/* Hiển thị lỗi validate ngay dưới input */}
            {formik.touched.username && formik.errors.username && (
              <p className="text-red-500 text-xs mt-1 ml-1">
                {formik.errors.username}
              </p>
            )}
          </div>

          {/* PASSWORD FIELD */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Mật khẩu
            </label>
            <input
              id="password"
              // name="password"
              type="password"
              {...formik.getFieldProps("password")}
              className={`w-full px-4 py-3 rounded-xl bg-cream-dark border outline-none transition-all
                ${
                  formik.touched.password && formik.errors.password
                    ? "border-red-500 focus:ring-red-200"
                    : "border-lime-accent focus:border-lime-primary focus:ring-2 focus:ring-lime-primary/20"
                }`}
              placeholder="••••••••"
            />
            {formik.touched.password && formik.errors.password && (
              <p className="text-red-500 text-xs mt-1 ml-1">
                {formik.errors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="w-full bg-lime-primary hover:bg-lime-hover text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {/* {formik.isSubmitting ? "Đang kiểm tra..." : "Đăng nhập"} */}
            {isLoggingIn ? "Đang kiểm tra..." : "Đăng nhập"}
          </button>
        </form>
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Chưa có tài khoản? {/* Sử dụng Link thay vì thẻ a href */}
            <Link
              href="/register"
              className="text-lime-primary font-bold hover:underline"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
