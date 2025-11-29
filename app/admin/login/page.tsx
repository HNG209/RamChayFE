// app/admin/login/page.tsx
"use client";

import { useLoginMutation } from "@/redux/services/authApi";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import { useState } from "react";
// Import thêm icon để trang trí
import { User, Lock, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [login, { isLoading }] = useLoginMutation();
  const [errorMsg, setErrorMsg] = useState("");

  const formik = useFormik({
    initialValues: { username: "", password: "" },
    onSubmit: async (values) => {
      setErrorMsg("");
      try {
        const data = await login(values).unwrap();
        router.push("/admin");

        // Kiểm tra quyền Admin (Logic của bạn)
        // const isAdmin = data.roles?.some((r: string) =>
        //   ["ROLE_ADMIN", "ROLE_MANAGER", "ROLE_STAFF"].includes(r)
        // );

        // if (isAdmin) {
        //   router.push("/admin");
        // } else {
        //   setErrorMsg("Tài khoản này không có quyền truy cập quản trị!");
        //   // Xử lý logout nếu cần
        // }
      } catch (err: any) {
        setErrorMsg("Tài khoản hoặc mật khẩu không chính xác.");
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111827] relative overflow-hidden">
      {/* Background Decor (Hiệu ứng ánh sáng nền) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-lime-500/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-lime-500/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="bg-white p-8 md:p-10 rounded-2xl shadow-2xl w-full max-w-md z-10 border border-gray-100 relative">
        {/* Nút quay lại trang chủ (ẩn ý) */}
        <Link
          href="/"
          className="absolute top-4 left-4 text-gray-400 hover:text-lime-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-lime-100 text-lime-600 mb-4 shadow-sm">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Admin Portal
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            Đăng nhập hệ thống quản trị RamChay
          </p>
        </div>

        {/* Thông báo lỗi */}
        {errorMsg && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-6 text-sm animate-pulse">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={formik.handleSubmit} className="space-y-5">
          {/* Username Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
              Tài khoản
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-lime-600 transition-colors">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                {...formik.getFieldProps("username")}
                placeholder="Nhập username..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-800 focus:bg-white focus:border-lime-500 focus:ring-4 focus:ring-lime-500/20 outline-none transition-all duration-200"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
              Mật khẩu
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-lime-600 transition-colors">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                {...formik.getFieldProps("password")}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-800 focus:bg-white focus:border-lime-500 focus:ring-4 focus:ring-lime-500/20 outline-none transition-all duration-200"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex items-center justify-center py-3.5 rounded-xl font-bold text-white shadow-lg shadow-lime-500/30 transition-all duration-200
              ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700 active:scale-[0.98]"
              }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Đang xác thực...
              </>
            ) : (
              "Đăng nhập Dashboard"
            )}
          </button>
        </form>

        {/* Footer Text */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            © 2024 RamChay System. Bảo mật tuyệt đối.
          </p>
        </div>
      </div>
    </div>
  );
}
