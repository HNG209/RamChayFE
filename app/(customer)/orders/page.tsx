// app/(customer)/orders/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Package, Loader2, ShoppingBag, Clock, CheckCircle, XCircle, Truck } from "lucide-react";
import { useGetMyOrdersQuery } from "@/redux/services/orderApi";
import { useInView } from "react-intersection-observer";
import { OrderListItem } from "@/types/backend";
import type { RootState } from "@/redux/store";

export default function MyOrdersPage() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [orders, setOrders] = useState<OrderListItem[]>([]);

  const { data, isFetching } = useGetMyOrdersQuery({ page, size: 10 });

  // Watch scroll bottom
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "100px",
  });

  // Reset orders when user changes (fixes cache issue between different users)
  useEffect(() => {
    if (!user?.id) return; // Skip if no user
    setOrders([]);
    setPage(0);
    setHasMore(true);
  }, [user?.id]);

  // Merge paginated data
  useEffect(() => {
    if (!data) return;

    console.log("📦 Orders API Response:", data);

    // Backend returns array directly or paginated object
    const newContent = Array.isArray(data) ? data : data.content ?? [];
    console.log("✅ New orders to add:", newContent.length);

    setOrders((prev) => {
      const merged = [...prev, ...newContent];
      const unique = Array.from(new Map(merged.map((item) => [item.id, item])).values());
      console.log("📊 Total orders after merge:", unique.length);
      return unique;
    });

    // Check end page - if array directly, no more pages
    if (Array.isArray(data)) {
      setHasMore(false);
    } else if (data.page?.totalPages === page + 1 || newContent.length < 10) {
      setHasMore(false);
    }
  }, [data, page]);

  // Auto increase page when scrolling to bottom
  useEffect(() => {
    if (inView && hasMore && !isFetching) {
      setPage((prev) => prev + 1);
    }
  }, [inView, hasMore, isFetching]);

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
    if (isNaN(date.getTime())) return dateString;

    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
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

  return (
    <div className="min-h-screen bg-cream-light pb-10">
      <div className="container mx-auto px-4 pt-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <Link href="/products" className="p-2 hover:bg-white rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Đơn hàng của tôi</h1>
          {orders.length > 0 && <span className="text-sm text-gray-500 mt-1">({orders.length} đơn hàng)</span>}
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {orders.length > 0 ? (
            <>
              {orders.map((order) => {
                const statusDisplay = getStatusDisplay(order.orderStatus);
                const StatusIcon = statusDisplay.icon;

                return (
                  <div
                    key={order.id}
                    onClick={() => router.push(`/order/${order.id}`)}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all cursor-pointer"
                  >
                    {/* Order Header */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <Package className="w-5 h-5 text-lime-primary" />
                        <div>
                          <p className="font-bold text-gray-800">Đơn hàng #{order.id}</p>
                          <p className="text-sm text-gray-500">{formatDate(order.orderDate)}</p>
                        </div>
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${statusDisplay.bg}`}>
                        <StatusIcon className={`w-4 h-4 ${statusDisplay.color}`} />
                        <span className={`text-sm font-medium ${statusDisplay.color}`}>{statusDisplay.text}</span>
                      </div>
                    </div>

                    {/* Order Info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <ShoppingBag className="w-4 h-4" />
                        <span>{(order as any).orderDetails?.length || order.itemCount || 0} sản phẩm</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Tổng tiền</p>
                        <p className="text-lg font-bold text-lime-primary">{formatPrice(order.total)}</p>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-sm text-gray-500">
                        Thanh toán:{" "}
                        <span className="font-medium text-gray-700">
                          {order.paymentMethod === "COD" ? "COD" : "QR Code"}
                        </span>
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Loading more */}
              {hasMore && (
                <div ref={ref} className="flex justify-center py-6">
                  <div className="flex items-center gap-2 text-gray-500 text-sm bg-white px-4 py-2 rounded-full shadow-sm">
                    <Loader2 className="w-4 h-4 animate-spin text-lime-primary" />
                    Đang tải thêm đơn hàng...
                  </div>
                </div>
              )}

              {!hasMore && orders.length > 5 && (
                <p className="text-center text-gray-400 text-xs py-4">Đã hiển thị tất cả đơn hàng</p>
              )}
            </>
          ) : !isFetching ? (
            <div className="bg-white p-8 rounded-xl text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Bạn chưa có đơn hàng nào</p>
              <Link href="/products" className="text-lime-primary font-bold hover:underline">
                Bắt đầu mua sắm
              </Link>
            </div>
          ) : null}

          {/* Skeleton Loading */}
          {isFetching && page === 0 && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 animate-pulse">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-gray-200 rounded"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-6 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
