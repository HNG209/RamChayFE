// app/(customer)/order/page.tsx
"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, ShoppingBag, MapPin, Phone, User, CreditCard } from "lucide-react";
import { useGetCartItemsQuery } from "@/redux/services/cartApi";
import { useCreateOrderMutation } from "@/redux/services/orderApi";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import Image from "next/image";

export default function OrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useSelector((state: RootState) => state.auth.user);

  // Get selected item IDs from URL query params
  const selectedIdsParam = searchParams.get("items");
  const selectedIds = selectedIdsParam ? selectedIdsParam.split(",").map(Number) : [];

  const { data: cartData, isLoading: isLoadingCart } = useGetCartItemsQuery({
    page: 0,
    size: 100,
  });
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();

  // Form state
  const [receiverName, setReceiverName] = useState(user?.fullName || "");
  const [receiverPhone, setReceiverPhone] = useState(user?.phones?.[0] || "");
  const [shippingAddress, setShippingAddress] = useState(user?.addresses?.[0] || "");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "QRPAY">("COD");

  // Filter selected items from cart
  const selectedCartItems = useMemo(() => {
    if (!cartData?.content) return [];
    return cartData.content.filter((item) => selectedIds.includes(item.id));
  }, [cartData, selectedIds]);

  // Calculate total
  const totalAmount = useMemo(() => {
    return selectedCartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  }, [selectedCartItems]);

  // Format price
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  // Handle submit order
  const handleSubmitOrder = async () => {
    if (!user?.id) {
      alert("Vui lòng đăng nhập để đặt hàng!");
      router.push("/login");
      return;
    }

    if (!receiverName || !receiverPhone || !shippingAddress) {
      alert("Vui lòng điền đầy đủ thông tin giao hàng!");
      return;
    }

    if (selectedCartItems.length === 0) {
      alert("Không có sản phẩm nào được chọn!");
      return;
    }

    try {
      const orderData = {
        customerId: user.id,
        receiverName,
        receiverPhone,
        shippingAddress,
        paymentMethod,
        items: selectedCartItems.map((item) => ({
          cartItemId: item.id,
          quantity: item.quantity,
        })),
      };

      const result = await createOrder(orderData).unwrap();
      console.log("Order creation result:", result); // Debug log

      // Get orderId from result - backend returns the full order object with id field
      const orderId = result?.id || result?.orderId || (typeof result === "number" ? result : null);

      if (orderId) {
        router.push(`/order/${orderId}`);
      } else {
        alert(`Đặt hàng thành công nhưng không thể chuyển trang. Response: ${JSON.stringify(result)}`);
        router.push("/products");
      }
    } catch (error: any) {
      console.error("Order creation failed:", error);
      alert(`Đặt hàng thất bại: ${error?.data?.message || "Vui lòng thử lại sau"}`);
    }
  };

  if (isLoadingCart) {
    return (
      <div className="min-h-screen bg-cream-light flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-lime-primary" />
          <span className="text-gray-600">Đang tải thông tin đơn hàng...</span>
        </div>
      </div>
    );
  }

  if (selectedCartItems.length === 0) {
    return (
      <div className="min-h-screen bg-cream-light">
        <div className="container mx-auto px-4 pt-6">
          <div className="flex items-center gap-2 mb-6">
            <Link href="/cart" className="p-2 hover:bg-white rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">Đặt hàng</h1>
          </div>
          <div className="bg-white p-8 rounded-xl text-center">
            <p className="text-gray-500 mb-4">Không có sản phẩm nào được chọn để đặt hàng.</p>
            <Link href="/cart" className="text-lime-primary font-bold hover:underline">
              Quay lại giỏ hàng
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-light pb-32 md:pb-10">
      <div className="container mx-auto px-4 pt-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <Link href="/cart" className="p-2 hover:bg-white rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Đặt hàng</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Order Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Information */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-lime-primary" />
                Thông tin giao hàng
              </h3>

              <div className="space-y-4">
                {/* Receiver Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Tên người nhận
                  </label>
                  <input
                    type="text"
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-lime-primary focus:border-transparent outline-none transition-all"
                    placeholder="Nhập tên người nhận"
                  />
                </div>

                {/* Receiver Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={receiverPhone}
                    onChange={(e) => setReceiverPhone(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-lime-primary focus:border-transparent outline-none transition-all"
                    placeholder="Nhập số điện thoại"
                  />
                </div>

                {/* Shipping Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Địa chỉ giao hàng
                  </label>
                  <textarea
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-lime-primary focus:border-transparent outline-none transition-all resize-none"
                    placeholder="Nhập địa chỉ giao hàng chi tiết"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-lime-primary" />
                Phương thức thanh toán
              </h3>

              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-lime-primary transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={() => setPaymentMethod("COD")}
                    className="w-4 h-4 text-lime-primary focus:ring-lime-primary"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">Thanh toán khi nhận hàng (COD)</p>
                    <p className="text-sm text-gray-500">Thanh toán bằng tiền mặt khi nhận hàng</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-lime-primary transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="QRPAY"
                    checked={paymentMethod === "QRPAY"}
                    onChange={() => setPaymentMethod("QRPAY")}
                    className="w-4 h-4 text-lime-primary focus:ring-lime-primary"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">Thanh toán QR Code</p>
                    <p className="text-sm text-gray-500">Quét mã QR để thanh toán qua ví điện tử</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Order Items Preview */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-lime-primary" />
                Sản phẩm đã chọn ({selectedCartItems.length})
              </h3>

              <div className="space-y-3">
                {selectedCartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-3 border border-gray-100 rounded-xl">
                    <div className="relative w-16 h-16 shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                      {item.indexImage ? (
                        <Image src={item.indexImage} alt={item.productName} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ShoppingBag className="w-6 h-6" />
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
                      <p className="font-bold text-lime-primary">{formatPrice(item.unitPrice * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Order Summary (Desktop) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-lime-accent/50 sticky top-24">
              <h3 className="font-bold text-lg text-gray-800 mb-4">Tóm tắt đơn hàng</h3>

              <div className="space-y-3 text-sm text-gray-600 mb-6 border-b border-gray-100 pb-6">
                <div className="flex justify-between">
                  <span>Tạm tính ({selectedCartItems.length} món)</span>
                  <span className="font-medium">{formatPrice(totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển</span>
                  <span className="text-gray-400">Miễn phí</span>
                </div>
                <div className="flex justify-between">
                  <span>Giảm giá</span>
                  <span className="text-lime-primary">-0đ</span>
                </div>
              </div>

              <div className="flex justify-between items-end mb-6">
                <span className="font-bold text-gray-800">Tổng cộng</span>
                <div className="text-right">
                  <span className="block text-2xl font-bold text-lime-primary">{formatPrice(totalAmount)}</span>
                  <span className="text-xs text-gray-400">(Đã bao gồm VAT)</span>
                </div>
              </div>

              <button
                onClick={handleSubmitOrder}
                disabled={isCreatingOrder}
                className="w-full bg-lime-primary hover:bg-lime-hover text-white font-bold py-3.5 rounded-xl shadow-lg shadow-lime-primary/30 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isCreatingOrder ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  "Đặt hàng"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 z-50 lg:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-4 justify-between mb-3">
          <div>
            <p className="text-xs text-gray-500">Tổng thanh toán:</p>
            <p className="text-lg font-bold text-lime-primary">{formatPrice(totalAmount)}</p>
          </div>
        </div>
        <button
          onClick={handleSubmitOrder}
          disabled={isCreatingOrder}
          className="w-full bg-lime-primary hover:bg-lime-hover text-white font-bold py-3 rounded-xl shadow-md transition-all active:scale-[0.95] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isCreatingOrder ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Đang xử lý...
            </>
          ) : (
            `Đặt hàng (${selectedCartItems.length})`
          )}
        </button>
      </div>
    </div>
  );
}
