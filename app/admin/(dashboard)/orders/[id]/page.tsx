// app/admin/(dashboard)/orders/[id]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useGetOrderByIdForManagerQuery, useUpdateOrderStatusMutation } from "@/redux/services/orderApi";
import { Loader2, ArrowLeft, User, Phone, MapPin, CreditCard, ShoppingBag, Calendar, Package } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const ORDER_STATUS_MAP: Record<string, { label: string; color: string; bgColor: string }> = {
  PENDING_PAYMENT: { label: "Chờ thanh toán", color: "text-orange-700", bgColor: "bg-orange-100" },
  PAID: { label: "Đã thanh toán", color: "text-blue-700", bgColor: "bg-blue-100" },
  PROCESSING: { label: "Đang xử lý", color: "text-yellow-700", bgColor: "bg-yellow-100" },
  SHIPPING: { label: "Đang giao", color: "text-purple-700", bgColor: "bg-purple-100" },
  COMPLETED: { label: "Hoàn thành", color: "text-green-700", bgColor: "bg-green-100" },
  CANCELLED: { label: "Đã hủy", color: "text-red-700", bgColor: "bg-red-100" },
};

const PAYMENT_METHOD_MAP: Record<string, string> = {
  COD: "Thanh toán khi nhận hàng",
  QRPAY: "Thanh toán QR",
};

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = Number(params.id);

  const { data: order, isLoading, error } = useGetOrderByIdForManagerQuery(orderId);
  const [updateOrderStatus] = useUpdateOrderStatusMutation();

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleUpdateStatus = async () => {
    if (!order || !newStatus) return;

    try {
      await updateOrderStatus({
        orderId: order.id,
        orderStatus: newStatus,
      }).unwrap();

      alert("Cập nhật trạng thái thành công!");
      setShowStatusModal(false);
      setNewStatus("");
    } catch (error: any) {
      console.error("Update status error:", error);
      alert(error?.data?.message || "Có lỗi xảy ra khi cập nhật trạng thái");
    }
  };

  const openStatusModal = () => {
    if (order) {
      setNewStatus(order.orderStatus);
      setShowStatusModal(true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-lime-primary" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 mb-4">Không tìm thấy đơn hàng</p>
        <Link href="/admin/orders" className="text-lime-primary hover:underline">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const statusInfo = ORDER_STATUS_MAP[order.orderStatus] || {
    label: order.orderStatus,
    color: "text-gray-700",
    bgColor: "bg-gray-100",
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/orders"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Đơn hàng #{order.id}</h1>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
        <button
          onClick={openStatusModal}
          className={`px-4 py-2 rounded-lg text-sm font-semibold ${statusInfo.color} ${statusInfo.bgColor} hover:opacity-80 transition-opacity`}
        >
          {statusInfo.label}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-lime-primary" />
              Sản phẩm ({order.items.length})
            </h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="relative w-16 h-16 shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                    {item.indexImage ? (
                      <Image
                        src={item.indexImage}
                        alt={item.productName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Package className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-800">{item.productName}</h4>
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

            {/* Total */}
            <div className="mt-6 pt-6 border-t-2 border-gray-200 flex items-center justify-between">
              <span className="text-lg font-bold text-gray-800">Tổng cộng</span>
              <span className="text-2xl font-bold text-lime-primary">
                {formatPrice(order.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-lime-primary" />
              Thông tin khách hàng
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Khách hàng</p>
                <p className="font-medium text-gray-800">{order.customerName}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Người nhận</p>
                <p className="font-medium text-gray-800">{order.receiverName}</p>
              </div>
              <div className="flex items-start gap-2 pt-2 border-t border-gray-100">
                <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-gray-500 mb-1">Số điện thoại</p>
                  <p className="font-medium text-gray-800">{order.receiverPhone}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 pt-2 border-t border-gray-100">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-gray-500 mb-1">Địa chỉ giao hàng</p>
                  <p className="font-medium text-gray-800">{order.shippingAddress}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              Thanh toán
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Phương thức</p>
                <p className="font-medium text-gray-800">
                  {PAYMENT_METHOD_MAP[order.paymentMethod] || order.paymentMethod}
                </p>
              </div>
              <div className="pt-3 border-t border-gray-100">
                <p className="text-gray-500 mb-1">Trạng thái</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.color} ${statusInfo.bgColor}`}
                >
                  {statusInfo.label}
                </span>
              </div>
            </div>
          </div>

          {/* Update Status Button */}
          <button
            onClick={openStatusModal}
            className="w-full px-6 py-3 bg-lime-primary text-white font-semibold rounded-xl hover:bg-lime-hover transition-colors shadow-md"
          >
            Cập nhật trạng thái
          </button>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">Cập nhật trạng thái</h3>
              <p className="text-sm text-gray-500 mt-1">Đơn hàng #{order.id}</p>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Chọn trạng thái mới
              </label>
              <div className="space-y-2">
                {Object.entries(ORDER_STATUS_MAP).map(([key, value]) => (
                  <label
                    key={key}
                    className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                      newStatus === key
                        ? "border-lime-primary bg-lime-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={key}
                      checked={newStatus === key}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-4 h-4 text-lime-primary focus:ring-lime-primary"
                    />
                    <span
                      className={`text-sm font-medium ${
                        newStatus === key ? "text-lime-primary" : "text-gray-700"
                      }`}
                    >
                      {value.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setNewStatus("");
                }}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={newStatus === order.orderStatus}
                className="flex-1 px-6 py-3 bg-lime-primary text-white font-semibold rounded-xl hover:bg-lime-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
