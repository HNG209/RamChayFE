// app/(customer)/order/[id]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  MapPin,
  Phone,
  User,
  CreditCard,
  Clock,
  CheckCircle,
  Loader2,
  XCircle,
  Truck,
} from "lucide-react";
import { useGetOrderByIdQuery } from "@/redux/services/orderApi";
import Image from "next/image";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = Number(params.id);

  const { data: order, isLoading, error } = useGetOrderByIdQuery(orderId);

  // Format price
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return dateString; // Return original string if invalid
    }

    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Get status display
  const getStatusDisplay = (status: string) => {
    const statusMap = {
      PENDING: { text: "Chờ xác nhận", color: "text-yellow-600", bg: "bg-yellow-50", icon: Clock },
      PENDING_PAYMENT: { text: "Chờ thanh toán", color: "text-orange-600", bg: "bg-orange-50", icon: Clock },
      CONFIRMED: { text: "Đã xác nhận", color: "text-blue-600", bg: "bg-blue-50", icon: CheckCircle },
      SHIPPING: { text: "Đang giao hàng", color: "text-purple-600", bg: "bg-purple-50", icon: Truck },
      DELIVERED: { text: "Đã giao hàng", color: "text-green-600", bg: "bg-green-50", icon: CheckCircle },
      CANCELLED: { text: "Đã hủy", color: "text-red-600", bg: "bg-red-50", icon: XCircle },
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.PENDING;
  };

  // Get payment method display
  const getPaymentMethodDisplay = (method: string) => {
    const methodMap = {
      COD: "Thanh toán khi nhận hàng (COD)",
      QRPAY: "Thanh toán QR Code",
    };
    return methodMap[method as keyof typeof methodMap] || method;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream-light flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-lime-primary" />
          <span className="text-gray-600">Đang tải thông tin đơn hàng...</span>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-cream-light">
        <div className="container mx-auto px-4 pt-6">
          <div className="flex items-center gap-2 mb-6">
            <Link href="/products" className="p-2 hover:bg-white rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">Chi tiết đơn hàng</h1>
          </div>
          <div className="bg-white p-8 rounded-xl text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Không tìm thấy đơn hàng này.</p>
            <Link href="/products" className="text-lime-primary font-bold hover:underline">
              Quay lại trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statusDisplay = getStatusDisplay(order.orderStatus);
  const StatusIcon = statusDisplay.icon;

  return (
    <div className="min-h-screen bg-cream-light pb-10">
      <div className="container mx-auto px-4 pt-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <Link href="/products" className="p-2 hover:bg-white rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Chi tiết đơn hàng</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-gray-800">Đơn hàng #{order.id}</h3>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${statusDisplay.bg}`}>
                  <StatusIcon className={`w-4 h-4 ${statusDisplay.color}`} />
                  <span className={`font-medium text-sm ${statusDisplay.color}`}>{statusDisplay.text}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="text-gray-500">Ngày đặt:</span>
                  <p className="font-medium text-gray-800">{formatDate(order.createdAt)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Cập nhật lần cuối:</span>
                  <p className="font-medium text-gray-800">{formatDate(order.updatedAt)}</p>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-lime-primary" />
                Thông tin giao hàng
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-gray-400 mt-1" />
                  <div>
                    <p className="text-gray-500">Người nhận</p>
                    <p className="font-medium text-gray-800">{order.receiverName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-gray-400 mt-1" />
                  <div>
                    <p className="text-gray-500">Số điện thoại</p>
                    <p className="font-medium text-gray-800">{order.receiverPhone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                  <div>
                    <p className="text-gray-500">Địa chỉ giao hàng</p>
                    <p className="font-medium text-gray-800">{order.shippingAddress}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-lime-primary" />
                Phương thức thanh toán
              </h3>
              <p className="text-gray-800 font-medium">{getPaymentMethodDisplay(order.paymentMethod)}</p>
            </div>

            {/* Order Items */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-lime-primary" />
                Sản phẩm ({order.items.length})
              </h3>

              <div className="space-y-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="relative w-16 h-16 shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                      {item.indexImage ? (
                        <Image src={item.indexImage} alt={item.productName} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Package className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-800 truncate">{item.productName}</h4>
                      <p className="text-sm text-gray-500">
                        {formatPrice(item.unitPrice)} x {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lime-primary">{formatPrice(item.subtotal)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-lime-accent/50 sticky top-24">
              <h3 className="font-bold text-lg text-gray-800 mb-4">Tổng đơn hàng</h3>

              <div className="space-y-3 text-sm text-gray-600 mb-6 border-b border-gray-100 pb-6">
                <div className="flex justify-between">
                  <span>Tạm tính ({order.items.length} món)</span>
                  <span className="font-medium">
                    {formatPrice(order.items.reduce((sum, item) => sum + item.subtotal, 0))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển</span>
                  <span className="text-gray-400">Miễn phí</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-gray-800">Tổng cộng</span>
                <span className="text-2xl font-bold text-lime-primary">{formatPrice(order.totalAmount)}</span>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => router.push("/products")}
                  className="w-full bg-lime-primary hover:bg-lime-hover text-white font-bold py-3 rounded-xl shadow-lg shadow-lime-primary/30 transition-all active:scale-[0.98]"
                >
                  Tiếp tục mua sắm
                </button>

                {order.orderStatus === "PENDING" && (
                  <button className="w-full border-2 border-red-500 text-red-500 hover:bg-red-50 font-bold py-3 rounded-xl transition-all active:scale-[0.98]">
                    Hủy đơn hàng
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
