// app/admin/dashboard/orders/page.tsx
"use client";

import { useState } from "react";
import { useGetAllOrdersQuery, useUpdateOrderStatusMutation } from "@/redux/services/orderApi";
import { OrderDetailBackendResponse } from "@/types/backend";
import { Loader2, Package, X, User, Phone, MapPin, CreditCard, ShoppingBag } from "lucide-react";

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

export default function AdminOrdersPage() {
  const { data: orders, isLoading, error } = useGetAllOrdersQuery();
  const [updateOrderStatus] = useUpdateOrderStatusMutation();

  const [selectedOrder, setSelectedOrder] = useState<OrderDetailBackendResponse | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [searchId, setSearchId] = useState("");
  const [showStatusSection, setShowStatusSection] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

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

  const handleConfirmUpdate = () => {
    if (newStatus === selectedOrder?.orderStatus) {
      return;
    }
    setShowConfirmModal(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;

    try {
      await updateOrderStatus({
        orderId: selectedOrder.id,
        orderStatus: newStatus,
      }).unwrap();

      alert("Cập nhật trạng thái thành công!");
      setShowConfirmModal(false);
      setShowDetailModal(false);
      setSelectedOrder(null);
      setNewStatus("");
      setShowStatusSection(false);
    } catch (error: any) {
      console.error("Update status error:", error);
      alert(error?.data?.message || "Có lỗi xảy ra khi cập nhật trạng thái");
    }
  };

  const openDetailModal = (order: OrderDetailBackendResponse) => {
    setSelectedOrder(order);
    setNewStatus(order.orderStatus);
    setShowDetailModal(true);
    setShowStatusSection(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-lime-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500">Có lỗi xảy ra khi tải danh sách đơn hàng</p>
      </div>
    );
  }

  // Filter orders by search ID
  const filteredOrders = orders?.filter((order) => {
    if (!searchId) return true;
    return order.id.toString().includes(searchId);
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Quản lý đơn hàng</h1>
        <p className="text-gray-600">Tổng {orders?.length || 0} đơn hàng</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="Tìm kiếm theo mã đơn hàng..."
            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-lime-primary focus:border-transparent outline-none transition-all"
          />
          <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          {searchId && (
            <button
              onClick={() => setSearchId("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
        {searchId && <p className="text-sm text-gray-500 mt-2">Tìm thấy {filteredOrders?.length || 0} đơn hàng</p>}
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOrders && filteredOrders.length > 0 ? (
          filteredOrders.map((order) => {
            const statusInfo = ORDER_STATUS_MAP[order.orderStatus] || {
              label: order.orderStatus,
              color: "text-gray-700",
              bgColor: "bg-gray-100",
            };

            return (
              <div
                key={order.id}
                onClick={() => openDetailModal(order)}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-lime-primary transition-all cursor-pointer"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="font-mono text-lg font-bold text-gray-800">#{order.id}</span>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(order.orderDate)}</p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusInfo.color} ${statusInfo.bgColor}`}
                  >
                    {statusInfo.label}
                  </span>
                </div>

                {/* Customer Info */}
                <div className="mb-3 pb-3 border-b border-gray-100">
                  {/* <p className="text-sm font-medium text-gray-800">{order.customer.fullName || order.customer.username}</p> */}
                  <p className="text-sm font-medium text-gray-800">{order.receiverName}</p>
                  <p className="text-xs text-gray-500">{order.receiverPhone}</p>
                </div>

                {/* Order Summary */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ShoppingBag className="w-4 h-4" />
                    <span>{order.orderDetails.length} món</span>
                  </div>
                  <span className="text-lg font-bold text-lime-primary">{formatPrice(order.total)}</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-20">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">{searchId ? "Không tìm thấy đơn hàng nào" : "Không có đơn hàng nào"}</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col my-8">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Đơn hàng #{selectedOrder.id}</h3>
                <p className="text-sm text-gray-500 mt-1">{formatDate(selectedOrder.orderDate)}</p>
              </div>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedOrder(null);
                  setShowStatusSection(false);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Customer Info Section */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <User className="w-5 h-5 text-lime-primary" />
                  Thông tin khách hàng
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500 w-28 shrink-0">Khách hàng:</span>
                    <span className="font-medium text-gray-800">
                      {selectedOrder.customer ? selectedOrder.customer.fullName : "Vãng lai"}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500 w-28 shrink-0">Người nhận:</span>
                    <span className="font-medium text-gray-800">{selectedOrder.receiverName}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                    <span className="text-gray-500 w-24 shrink-0">SĐT:</span>
                    <span className="font-medium text-gray-800">{selectedOrder.receiverPhone}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <span className="text-gray-500 w-24 shrink-0">Địa chỉ:</span>
                    <span className="font-medium text-gray-800">{selectedOrder.shippingAddress}</span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-blue-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  Thanh toán
                </h4>
                <p className="text-sm text-gray-700">
                  {PAYMENT_METHOD_MAP[selectedOrder.paymentMethod] || selectedOrder.paymentMethod}
                </p>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-lime-primary" />
                  Chi tiết đơn hàng
                </h4>
                <div className="space-y-3">
                  {selectedOrder.orderDetails.map((detail) => (
                    <div key={detail.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{detail.product.name}</p>
                        <p className="text-sm text-gray-500">
                          {formatPrice(detail.unitPrice)} x {detail.quantity}
                        </p>
                      </div>
                      <span className="font-bold text-lime-primary">{formatPrice(detail.subtotal)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between pt-4 border-t-2 border-gray-200">
                <span className="text-lg font-bold text-gray-800">Tổng cộng</span>
                <span className="text-2xl font-bold text-lime-primary">{formatPrice(selectedOrder.total)}</span>
              </div>

              {/* Status Update Section - Collapsible */}
              {!showStatusSection ? (
                <button
                  onClick={() => setShowStatusSection(true)}
                  className="w-full py-3 border-2 border-lime-primary text-lime-primary font-semibold rounded-xl hover:bg-lime-50 transition-colors"
                >
                  Cập nhật trạng thái đơn hàng
                </button>
              ) : (
                <div className="bg-yellow-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-800">Chọn trạng thái mới</h4>
                    <button
                      onClick={() => {
                        setShowStatusSection(false);
                        setNewStatus(selectedOrder.orderStatus);
                      }}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Hủy
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(ORDER_STATUS_MAP).map(([key, value]) => (
                      <label
                        key={key}
                        className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                          newStatus === key
                            ? "border-lime-primary bg-white"
                            : "border-gray-200 bg-white hover:border-gray-300"
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
                        <span className="text-sm font-medium text-gray-700">{value.label}</span>
                      </label>
                    ))}
                  </div>
                  <button
                    onClick={handleConfirmUpdate}
                    disabled={newStatus === selectedOrder.orderStatus}
                    className="w-full py-3 bg-lime-primary text-white font-semibold rounded-xl hover:bg-lime-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Xác nhận thay đổi
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedOrder(null);
                  setShowStatusSection(false);
                }}
                className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Xác nhận thay đổi trạng thái</h3>
              <p className="text-gray-600 mb-4">
                Bạn có chắc chắn muốn thay đổi trạng thái đơn hàng #{selectedOrder.id} từ{" "}
                <span className="font-semibold text-gray-800">
                  {ORDER_STATUS_MAP[selectedOrder.orderStatus]?.label}
                </span>{" "}
                sang <span className="font-semibold text-lime-primary">{ORDER_STATUS_MAP[newStatus]?.label}</span>?
              </p>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleUpdateStatus}
                  className="flex-1 px-6 py-3 bg-lime-primary text-white font-semibold rounded-xl hover:bg-lime-hover transition-colors"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
