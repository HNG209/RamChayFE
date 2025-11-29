// components/admin/Forbidden.tsx
"use client";

import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function Forbidden() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
      <div className="bg-red-50 p-4 rounded-full mb-4">
        <ShieldAlert className="w-16 h-16 text-red-500" />
      </div>

      <h1 className="text-4xl font-bold text-gray-800 mb-2">
        Truy cập bị từ chối
      </h1>
      <p className="text-gray-500 mb-8 max-w-md">
        Xin lỗi, tài khoản của bạn không đủ quyền hạn để xem trang này. Vui lòng
        liên hệ quản trị viên nếu bạn cho rằng đây là một sự nhầm lẫn.
      </p>

      <div className="flex gap-4">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>

        <Link
          href="/admin"
          className="px-6 py-2.5 bg-lime-primary text-white rounded-lg hover:bg-lime-600 transition-colors font-bold shadow-md shadow-lime-200"
        >
          Về Dashboard
        </Link>
      </div>
    </div>
  );
}
