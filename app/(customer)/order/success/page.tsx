"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Mail } from "lucide-react";
import { useEffect } from "react";

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email");
  const isGuest = searchParams.get("guest") === "true";

  useEffect(() => {
    // Redirect if accessed without proper parameters
    if (!email) {
      router.push("/products");
    }
  }, [email, router]);

  return (
    <div className="min-h-screen bg-linear-to-br from-lime-50 via-cream-light to-lime-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Success Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-lime-primary/20 rounded-full blur-2xl"></div>
              <div className="relative bg-lime-primary rounded-full p-6">
                <CheckCircle className="w-16 h-16 text-white" strokeWidth={2.5} />
              </div>
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Đặt hàng thành công!
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            Cảm ơn bạn đã tin tưởng và mua hàng tại cửa hàng của chúng tôi
          </p>

          {/* Email Notification Box */}
          <div className="bg-linear-to-r from-lime-50 to-lime-100 border-2 border-lime-200 rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="bg-white rounded-full p-3 shrink-0">
                <Mail className="w-6 h-6 text-lime-primary" />
              </div>
              <div className="text-left flex-1">
                <h3 className="font-bold text-gray-800 mb-2">
                  Thông tin đơn hàng đã được gửi đến email
                </h3>
                <p className="text-lime-primary font-semibold text-lg break-all">
                  {email}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Vui lòng kiểm tra hộp thư của bạn (bao gồm cả thư mục spam) để xem chi tiết đơn hàng
                </p>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="space-y-3 mb-8">
            <h3 className="font-bold text-gray-800 text-lg mb-4">Tiếp theo bạn có thể:</h3>
            
            {isGuest ? (
              <Link
                href="/products"
                className="block p-4 border-2 border-gray-200 rounded-xl hover:border-lime-primary hover:bg-lime-50 transition-all text-gray-700 hover:text-lime-primary font-medium text-center"
              >
                🛍️ Tiếp tục mua sắm
              </Link>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Link
                  href="/products"
                  className="p-4 border-2 border-gray-200 rounded-xl hover:border-lime-primary hover:bg-lime-50 transition-all text-gray-700 hover:text-lime-primary font-medium"
                >
                  🛍️ Tiếp tục mua sắm
                </Link>
                
                <Link
                  href="/orders"
                  className="p-4 border-2 border-gray-200 rounded-xl hover:border-lime-primary hover:bg-lime-50 transition-all text-gray-700 hover:text-lime-primary font-medium"
                >
                  📦 Xem đơn hàng của tôi
                </Link>
              </div>
            )}
          </div>

          {/* Contact Support */}
          <div className="pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Cần hỗ trợ? Liên hệ với chúng tôi qua{" "}
              <a href="mailto:support@ramchay.com" className="text-lime-primary font-semibold hover:underline">
                support@ramchay.com
              </a>
            </p>
          </div>
        </div>

        {/* Back to Home Link */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-gray-600 hover:text-lime-primary transition-colors font-medium"
          >
            ← Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
