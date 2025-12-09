// app/admin/login/page.tsx
"use client";

import { useAdminLoginMutation } from "@/redux/services/authApi";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import { useState } from "react";
// Import thêm icon để trang trí
import { User, Lock, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ApiResponse } from "@/types/backend";

export default function AdminLoginPage() {
  const router = useRouter();
  const [login, { isLoading }] = useAdminLoginMutation();
  const [errorMsg, setErrorMsg] = useState("");

  const formik = useFormik({
    initialValues: { username: "", password: "" },
    onSubmit: async (values) => {
      setErrorMsg("");
      try {
        await login(values).unwrap();
        router.push("/admin");
      } catch (err: any) {
        // err.data là dữ liệu trả về từ axiosBaseQuery
        const apiError = err?.data as ApiResponse<null> | undefined;
        if (apiError && typeof apiError.message === "string") {
          setErrorMsg(apiError.message);
        } else if (err instanceof Error) {
          setErrorMsg(err.message);
        } else {
          setErrorMsg("Lỗi hệ thống");
        }
      }
    },
  });

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-chocolate via-amber-800 to-orange-900 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-green-400 rounded-full blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="mb-8">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
              <span className="text-4xl">🌿</span>
            </div>
            <h1 className="text-5xl font-bold mb-4">RamChay Admin</h1>
            <p className="text-xl text-white/80">
              Hệ thống quản trị thực phẩm chay
            </p>
          </div>

          <div className="space-y-4 mt-8">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center shrink-0 mt-1">
                <span className="text-xl">📊</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Quản lý toàn diện</h3>
                <p className="text-white/70 text-sm">Theo dõi sản phẩm, đơn hàng và khách hàng</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center shrink-0 mt-1">
                <span className="text-xl">🔒</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Bảo mật cao</h3>
                <p className="text-white/70 text-sm">Phân quyền chi tiết và mã hóa dữ liệu</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-linear-to-br from-gray-50 to-green-50/30 p-8 relative z-10">
        <div className="w-full max-w-md">
          {/* Back to Home */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-chocolate transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Về trang chủ</span>
          </Link>

          {/* Form Card */}
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-green-200/50 p-8 relative overflow-hidden">
            {/* Decorative corner gradients */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-green-200/30 to-transparent rounded-bl-full"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-linear-to-tr from-chocolate/10 to-transparent rounded-tr-full"></div>

            {/* Header */}
            <div className="mb-8 relative z-10">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-br from-chocolate to-amber-700 text-white mb-4 shadow-lg">
                <Lock className="w-7 h-7" />
              </div>
              <h2 className="text-3xl font-bold bg-linear-to-r from-chocolate to-amber-700 bg-clip-text text-transparent mb-2">
                Đăng nhập quản trị
              </h2>
              <p className="text-gray-600">
                Vui lòng nhập thông tin để tiếp tục
              </p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="flex items-start gap-3 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Đăng nhập thất bại</p>
                  <p className="text-sm mt-0.5">{errorMsg}</p>
                </div>
              </div>
            )}

            <form onSubmit={formik.handleSubmit} className="space-y-5">
              {/* Username */}
              <div className="relative z-10">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tài khoản
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-chocolate">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    {...formik.getFieldProps("username")}
                    placeholder="Nhập tài khoản"
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-green-200 rounded-xl text-gray-900 placeholder:text-gray-400 bg-green-50/30 focus:border-chocolate focus:ring-4 focus:ring-chocolate/20 focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="relative z-10">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mật khẩu
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-chocolate">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    {...formik.getFieldProps("password")}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-green-200 rounded-xl text-gray-900 placeholder:text-gray-400 bg-green-50/30 focus:border-chocolate focus:ring-4 focus:ring-chocolate/20 focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`relative z-10 w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white shadow-lg transition-all overflow-hidden
                  ${isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-linear-to-r from-chocolate via-amber-700 to-chocolate bg-size-200 hover:bg-pos-100 active:scale-[0.98] shadow-chocolate/40"
                  }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang xác thực...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Đăng nhập
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-500">
                © 2024 RamChay. Hệ thống quản trị nội bộ.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
