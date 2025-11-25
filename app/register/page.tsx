// app/register/page.tsx
"use client";

import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { RegisterRequest } from "@/types/backend"; // Import kiểu dữ liệu
import Link from "next/link"; // Dùng Link của Next.js để chuyển trang mượt hơn

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const formik = useFormik<RegisterRequest>({
    initialValues: {
      username: "",
      password: "",
      fullName: "",
      phone: "",
    },
    validationSchema: Yup.object({
      fullName: Yup.string().required("Vui lòng nhập họ và tên"),
      username: Yup.string()
        .min(4, "Tên đăng nhập phải ít nhất 4 ký tự")
        .required("Vui lòng nhập tên đăng nhập"),
      password: Yup.string()
        .min(6, "Mật khẩu phải ít nhất 6 ký tự")
        .required("Vui lòng nhập mật khẩu"),
      phone: Yup.string()
        .matches(/^[0-9]+$/, "Số điện thoại chỉ được chứa số")
        .min(10, "Số điện thoại không hợp lệ (ít nhất 10 số)")
        .max(11, "Số điện thoại không hợp lệ")
        .required("Vui lòng nhập số điện thoại"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setServerError(null);
      setSuccessMessage(null);

      try {
        // --- GIẢ LẬP GỌI API ĐĂNG KÝ ---
        // const res = await fetch("http://localhost:8080/api/auth/register", ...);

        await new Promise((r) => setTimeout(r, 1500)); // Đợi 1.5s

        // Giả lập lỗi trùng username
        if (values.username === "admin") {
          throw new Error("Tên đăng nhập này đã tồn tại!");
        }

        // --- NẾU THÀNH CÔNG ---
        setSuccessMessage("Đăng ký thành công! Đang chuyển hướng đăng nhập...");

        // Đợi 1 chút để user đọc thông báo rồi chuyển trang
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      } catch (err: any) {
        setServerError(err.message || "Đăng ký thất bại. Vui lòng thử lại.");
        setSubmitting(false); // Cho phép bấm lại nút nếu lỗi
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-light p-4 py-10">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg border border-lime-accent">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Tạo tài khoản mới
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Tham gia cùng chúng tôi ngay hôm nay
        </p>

        {/* Thông báo Lỗi */}
        {serverError && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded border border-red-200">
            {serverError}
          </div>
        )}

        {/* Thông báo Thành công */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded border border-green-200 font-medium text-center">
            {successMessage}
          </div>
        )}

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {/* 1. Full Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Họ và tên
            </label>
            <input
              type="text"
              {...formik.getFieldProps("fullName")}
              className={`w-full px-4 py-3 rounded-xl bg-cream-dark border outline-none transition-all ${
                formik.touched.fullName && formik.errors.fullName
                  ? "border-red-500 focus:ring-red-200"
                  : "border-lime-accent focus:border-lime-primary focus:ring-2 focus:ring-lime-primary/20"
              }`}
              placeholder="Nguyễn Văn A"
            />
            {formik.touched.fullName && formik.errors.fullName && (
              <p className="text-red-500 text-xs mt-1 ml-1">
                {formik.errors.fullName}
              </p>
            )}
          </div>

          {/* 2. Phone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Số điện thoại
            </label>
            <input
              type="text"
              {...formik.getFieldProps("phone")}
              className={`w-full px-4 py-3 rounded-xl bg-cream-dark border outline-none transition-all ${
                formik.touched.phone && formik.errors.phone
                  ? "border-red-500 focus:ring-red-200"
                  : "border-lime-accent focus:border-lime-primary focus:ring-2 focus:ring-lime-primary/20"
              }`}
              placeholder="0912345678"
            />
            {formik.touched.phone && formik.errors.phone && (
              <p className="text-red-500 text-xs mt-1 ml-1">
                {formik.errors.phone}
              </p>
            )}
          </div>

          {/* 3. Username */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Tên đăng nhập
            </label>
            <input
              type="text"
              {...formik.getFieldProps("username")}
              className={`w-full px-4 py-3 rounded-xl bg-cream-dark border outline-none transition-all ${
                formik.touched.username && formik.errors.username
                  ? "border-red-500 focus:ring-red-200"
                  : "border-lime-accent focus:border-lime-primary focus:ring-2 focus:ring-lime-primary/20"
              }`}
              placeholder="username123"
            />
            {formik.touched.username && formik.errors.username && (
              <p className="text-red-500 text-xs mt-1 ml-1">
                {formik.errors.username}
              </p>
            )}
          </div>

          {/* 4. Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Mật khẩu
            </label>
            <input
              type="password"
              {...formik.getFieldProps("password")}
              className={`w-full px-4 py-3 rounded-xl bg-cream-dark border outline-none transition-all ${
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={formik.isSubmitting || !!successMessage}
            className="w-full bg-lime-primary hover:bg-lime-hover text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {formik.isSubmitting ? "Đang xử lý..." : "Đăng ký tài khoản"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Đã có tài khoản?{" "}
            <Link
              href="/login"
              className="text-lime-primary font-bold hover:underline"
            >
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
