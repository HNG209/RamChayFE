// app/register/page.tsx
"use client";

import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ApiResponse, RegisterRequest } from "@/types/backend"; // Import kiểu dữ liệu
import Link from "next/link"; // Dùng Link của Next.js để chuyển trang mượt hơn
import { useRegisterMutation } from "@/redux/services/authApi";
import { Api } from "@reduxjs/toolkit/query";

interface FloatingSticker {
  id: number;
  emoji: string;
  left: string;
  animationDuration: string;
  animationDelay: string;
  size: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [floatingStickers, setFloatingStickers] = useState<FloatingSticker[]>([]);

  const [register] = useRegisterMutation();

  const veganEmojis = ['🥬', '🥦', '🥕', '🍄', '🌽', '🫑', '🥒', '🍅', '🥑', '🪭', '🌶️', '🧅', '🍆', '🧄', '🪸', '🥗'];

  // Generate floating stickers on mount
  useEffect(() => {
    const stickers: FloatingSticker[] = [];
    for (let i = 0; i < 20; i++) {
      stickers.push({
        id: i,
        emoji: veganEmojis[Math.floor(Math.random() * veganEmojis.length)],
        left: `${Math.random() * 100}%`,
        animationDuration: `${12 + Math.random() * 18}s`,
        animationDelay: `${Math.random() * 10}s`,
        size: `${1.5 + Math.random() * 2.5}rem`
      });
    }
    setFloatingStickers(stickers);
  }, []);

  const formik = useFormik<RegisterRequest>({
    initialValues: {
      username: "",
      password: "",
      fullName: "",
      phone: "",
      email: "",
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
      email: Yup.string()
        .email("Email không hợp lệ")
        .required("Vui lòng nhập email"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setServerError(null);
      setSuccessMessage(null);

      try {
        await register(values).unwrap();

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
        // err.data là dữ liệu trả về từ axiosBaseQuery
        const apiError = err?.data as ApiResponse<null> | undefined;
        if (apiError && typeof apiError.message === "string") {
          setServerError(apiError.message);
        } else if (err instanceof Error) {
          setServerError(err.message);
        } else {
          setServerError("Lỗi hệ thống");
        }
      } finally {
        setSubmitting(false); // Báo cho Formik biết đã xử lý xong
      }
    },
  });

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 py-10 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: "url('/background-vegan-footer.png')" }}
    >
      {/* Floating Veggie Stickers - Behind everything */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {floatingStickers.map((sticker) => (
          <div
            key={sticker.id}
            className="absolute will-change-transform"
            style={{
              left: sticker.left,
              bottom: '-5rem',
              fontSize: sticker.size,
              animation: `float-up ${sticker.animationDuration} linear ${sticker.animationDelay} infinite`,
            }}
          >
            {sticker.emoji}
          </div>
        ))}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-1"></div>

      <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl w-full max-w-lg border-2 border-green-200 relative z-10">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-green-200/40 to-transparent rounded-bl-full"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-linear-to-tr from-chocolate/10 to-transparent rounded-tr-full"></div>

        <div className="relative z-10">
          <div className="mb-8">
            <div className="flex justify-center mb-4">
              <div className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-linear-to-br from-chocolate to-amber-700 text-white shadow-lg">
                <span className="text-2xl font-bold">RamChay</span>
              </div>
            </div>
            <h2 className="text-3xl font-bold bg-linear-to-r from-chocolate to-amber-700 bg-clip-text text-transparent mb-2 text-center">
              Tạo tài khoản mới
            </h2>
            <p className="text-gray-600 text-sm text-center">
              Tham gia cùng chúng tôi ngay hôm nay
            </p>
          </div>

          {/* Thông báo Lỗi */}
          {serverError && (
            <div className="mb-4 p-3 text-center bg-red-50 text-red-600 text-sm rounded border border-red-200">
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Họ và tên
              </label>
              <input
                type="text"
                {...formik.getFieldProps("fullName")}
                className={`w-full px-4 py-3.5 rounded-xl border-2 outline-none transition-all ${formik.touched.fullName && formik.errors.fullName
                  ? "border-red-500 bg-red-50 focus:ring-4 focus:ring-red-200"
                  : "border-green-200 bg-green-50/30 focus:border-chocolate focus:ring-4 focus:ring-chocolate/20 focus:bg-white"
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Số điện thoại
              </label>
              <input
                type="tel"
                {...formik.getFieldProps("phone")}
                className={`w-full px-4 py-3.5 rounded-xl border-2 outline-none transition-all ${formik.touched.phone && formik.errors.phone
                  ? "border-red-500 bg-red-50 focus:ring-4 focus:ring-red-200"
                  : "border-green-200 bg-green-50/30 focus:border-chocolate focus:ring-4 focus:ring-chocolate/20 focus:bg-white"
                  }`}
                placeholder="0987654321"
              />
              {formik.touched.phone && formik.errors.phone && (
                <p className="text-red-500 text-xs mt-1 ml-1">
                  {formik.errors.phone}
                </p>
              )}
            </div>

            {/* 2.5. Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                {...formik.getFieldProps("email")}
                className={`w-full px-4 py-3.5 rounded-xl border-2 outline-none transition-all ${formik.touched.email && formik.errors.email
                  ? "border-red-500 bg-red-50 focus:ring-4 focus:ring-red-200"
                  : "border-green-200 bg-green-50/30 focus:border-chocolate focus:ring-4 focus:ring-chocolate/20 focus:bg-white"
                  }`}
                placeholder="example@gmail.com"
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-red-500 text-xs mt-1 ml-1">
                  {formik.errors.email}
                </p>
              )}
            </div>

            {/* 3. Username */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tên đăng nhập
              </label>
              <input
                type="text"
                {...formik.getFieldProps("username")}
                className={`w-full px-4 py-3.5 rounded-xl border-2 outline-none transition-all ${formik.touched.username && formik.errors.username
                  ? "border-red-500 bg-red-50 focus:ring-4 focus:ring-red-200"
                  : "border-green-200 bg-green-50/30 focus:border-chocolate focus:ring-4 focus:ring-chocolate/20 focus:bg-white"
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mật khẩu
              </label>
              <input
                type="password"
                {...formik.getFieldProps("password")}
                className={`w-full px-4 py-3.5 rounded-xl border-2 outline-none transition-all ${formik.touched.password && formik.errors.password
                  ? "border-red-500 bg-red-50 focus:ring-4 focus:ring-red-200"
                  : "border-green-200 bg-green-50/30 focus:border-chocolate focus:ring-4 focus:ring-chocolate/20 focus:bg-white"
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
              className="w-full bg-linear-to-r from-chocolate via-amber-700 to-chocolate bg-size-200 hover:bg-pos-100 text-white font-bold py-4 px-4 rounded-xl shadow-lg shadow-chocolate/40 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4 relative overflow-hidden group"
            >
              {/* Sticker effects on hover */}
              <span className="absolute -top-2 -left-2 text-2xl opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-opacity duration-300">🥬</span>
              <span className="absolute -top-1 left-1/4 text-xl opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-opacity duration-300 delay-75">🥕</span>
              <span className="absolute -bottom-2 left-1/3 text-2xl opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-opacity duration-300 delay-150">🥦</span>
              <span className="absolute -top-2 right-1/4 text-xl opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-opacity duration-300 delay-100">🍄</span>
              <span className="absolute -bottom-1 -right-2 text-2xl opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-opacity duration-300 delay-200">🌽</span>
              <span className="relative z-10">{formik.isSubmitting ? "Đang xử lý..." : "Đăng ký tài khoản"}</span>
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Đã có tài khoản?{" "}
              <Link
                href="/login"
                className="text-chocolate font-bold hover:underline relative inline-block group"
              >
                <span className="absolute -top-3 -left-3 text-lg opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-opacity duration-300">🥬</span>
                <span className="absolute -top-4 -right-3 text-base opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-opacity duration-300 delay-100">🥕</span>
                <span className="relative z-10">Đăng nhập ngay</span>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
