// app/login/page.tsx
"use client";

import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
// Import kiểu dữ liệu đã định nghĩa để tái sử dụng
import { LoginResponse, LoginRequest, ApiResponse } from "@/types/backend";
import Link from "next/link";
import { useLoginMutation } from "@/redux/services/authApi";

interface FloatingSticker {
  id: number;
  emoji: string;
  left: string;
  animationDuration: string;
  animationDelay: string;
  size: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [floatingStickers, setFloatingStickers] = useState<FloatingSticker[]>(
    []
  );

  const [login, { isLoading: isLoggingIn }] = useLoginMutation();

  const veganEmojis = [
    "🥬",
    "🥦",
    "🥕",
    "🍄",
    "🌽",
    "🥒",
    "🍅",
    "🥑",
    "🪭",
    "🌶️",
    "🧅",
    "🍆",
    "🧄",
    "🥗",
  ];

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
        size: `${1.5 + Math.random() * 2.5}rem`,
      });
    }
    setFloatingStickers(stickers);
  }, []);

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
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative"
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
              bottom: "-5rem",
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

      <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl w-full max-w-md border-2 border-green-200 relative z-10">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-green-200/40 to-transparent rounded-bl-full"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-linear-to-tr from-chocolate/10 to-transparent rounded-tr-full"></div>

        <div className="relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-linear-to-br from-chocolate to-amber-700 text-white mb-4 shadow-lg">
              <span className="text-2xl font-bold">RamChay</span>
            </div>
            <h2 className="text-3xl font-bold bg-linear-to-r from-chocolate to-amber-700 bg-clip-text text-transparent mb-2">
              Đăng Nhập
            </h2>
            <p className="text-gray-600 text-sm">
              Chào mừng bạn trở lại RamChay
            </p>
          </div>

          {/* Lỗi từ Server trả về (ví dụ: Sai pass) */}
          {serverError && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded border border-red-200">
              {serverError}
            </div>
          )}

          <form onSubmit={formik.handleSubmit} className="space-y-5">
            {/* USERNAME FIELD */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tên đăng nhập
              </label>
              <input
                id="username"
                type="text"
                {...formik.getFieldProps("username")}
                className={`w-full px-4 py-3.5 rounded-xl border-2 outline-none transition-all
                ${
                  formik.touched.username && formik.errors.username
                    ? "border-red-500 bg-red-50 focus:ring-4 focus:ring-red-200"
                    : "border-green-200 bg-green-50/30 focus:border-chocolate focus:ring-4 focus:ring-chocolate/20 focus:bg-white"
                }`}
                placeholder="Nhập username..."
              />
              {formik.touched.username && formik.errors.username && (
                <p className="text-red-500 text-xs mt-1 ml-1">
                  {formik.errors.username}
                </p>
              )}
            </div>

            {/* PASSWORD FIELD */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mật khẩu
              </label>
              <input
                id="password"
                type="password"
                {...formik.getFieldProps("password")}
                className={`w-full px-4 py-3.5 rounded-xl border-2 outline-none transition-all
                ${
                  formik.touched.password && formik.errors.password
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

            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="w-full bg-linear-to-r from-chocolate via-amber-700 to-chocolate bg-size-200 hover:bg-pos-100 text-white font-bold py-4 px-4 rounded-xl shadow-lg shadow-chocolate/40 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2 relative overflow-hidden group"
            >
              {/* Sticker effects on hover */}
              <span className="absolute -top-2 -left-2 text-2xl opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-opacity duration-300">
                🥬
              </span>
              <span className="absolute -top-1 left-1/4 text-xl opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-opacity duration-300 delay-75">
                🥕
              </span>
              <span className="absolute -bottom-2 left-1/3 text-2xl opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-opacity duration-300 delay-150">
                🥦
              </span>
              <span className="absolute -top-2 right-1/4 text-xl opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-opacity duration-300 delay-100">
                🍄
              </span>
              <span className="absolute -bottom-1 -right-2 text-2xl opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-opacity duration-300 delay-200">
                🌽
              </span>
              <span className="relative z-10">
                {isLoggingIn ? "Đang kiểm tra..." : "Đăng nhập"}
              </span>
            </button>
          </form>
          <div className="mt-8 text-center">
            <div className="text-gray-500 text-sm">
              Chưa có tài khoản?{" "}
              <Link
                href="/register"
                className="text-chocolate font-bold hover:underline relative inline-block group"
              >
                <span className="absolute -top-3 -left-3 text-lg opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-opacity duration-300">
                  🥬
                </span>
                <span className="absolute -top-4 -right-3 text-base opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-opacity duration-300 delay-100">
                  🥕
                </span>
                <span className="relative z-10">Đăng ký ngay</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
