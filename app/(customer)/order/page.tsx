// app/(customer)/order/page.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, ShoppingBag, MapPin, Phone, User, CreditCard, Mail, Plus, Trash2 } from "lucide-react";
import { useGetCartItemsQuery } from "@/redux/services/cartApi";
import { useCreateOrderMutation } from "@/redux/services/orderApi";
import { useCreateAddressMutation, useDeleteAddressMutation } from "@/redux/services/addressApi";
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
  const [createAddress, { isLoading: isCreatingAddress }] = useCreateAddressMutation();
  const [deleteAddress] = useDeleteAddressMutation();

  // Form state
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState<number | "manual" | null>(null);
  const [manualCity, setManualCity] = useState("");
  const [manualWard, setManualWard] = useState("");
  const [manualStreet, setManualStreet] = useState("");
  const [manualPersonalAddress, setManualPersonalAddress] = useState("");
  const [email, setEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "QRPAY">("COD");

  // Address selection modal state
  const [showAddressSelectionModal, setShowAddressSelectionModal] = useState(false);

  // Address management modal state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddressCity, setNewAddressCity] = useState("");
  const [newAddressWard, setNewAddressWard] = useState("");
  const [newAddressStreet, setNewAddressStreet] = useState("");
  const [newAddressPersonal, setNewAddressPersonal] = useState("");

  // Update form fields when user data is loaded
  useEffect(() => {
    if (user) {
      setReceiverName(user.fullName || "");
      setReceiverPhone(user.phones?.[0] || "");
      setEmail(user.email || "");

      // Auto-select first address if available
      if (user.addresses && user.addresses.length > 0) {
        setSelectedAddressId(user.addresses[0].id);
      }
    }
  }, [user]);

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

  // Get shipping address string for display
  const getShippingAddress = () => {
    if (selectedAddressId === "manual") {
      const parts = [];
      if (manualPersonalAddress) parts.push(manualPersonalAddress);
      if (manualStreet) parts.push(`Đường ${manualStreet}`);
      if (manualWard) parts.push(`Phường ${manualWard}`);
      if (manualCity) parts.push(`Thành phố ${manualCity}`);
      return parts.join(", ");
    }
    if (selectedAddressId && user?.addresses) {
      const address = user.addresses.find((a) => a.id === selectedAddressId);
      if (address) {
        // Always format with descriptive labels
        const parts = [];
        if (address.personalAddress) parts.push(address.personalAddress);
        if (address.street) parts.push(`Đường ${address.street}`);
        if (address.ward) parts.push(`Phường ${address.ward}`);
        if (address.city) parts.push(`Thành phố ${address.city}`);
        return parts.join(", ");
      }
    }
    return "";
  };

  // Handle select address from selection modal
  const handleSelectAddress = (addressId: number) => {
    setSelectedAddressId(addressId);
    setShowAddressSelectionModal(false);
  };

  // Handle open address management modal from selection modal
  const handleOpenAddressManagement = () => {
    setShowAddressSelectionModal(false);
    setShowAddressModal(true);
  };

  // Handle create new address
  const handleCreateAddress = async () => {
    if (!newAddressCity || !newAddressWard || !newAddressPersonal) {
      alert("Vui lòng điền đầy đủ thông tin địa chỉ (Thành phố, Phường, Địa chỉ cụ thể)!");
      return;
    }

    try {
      const newAddress = await createAddress({
        city: newAddressCity,
        ward: newAddressWard,
        street: newAddressStreet || undefined,
        personalAddress: newAddressPersonal,
      }).unwrap();

      // Reset form
      setNewAddressCity("");
      setNewAddressWard("");
      setNewAddressStreet("");
      setNewAddressPersonal("");

      alert("Thêm địa chỉ thành công!");

      // Close address management modal and open selection modal
      setShowAddressModal(false);

      // Wait a bit for user data to refetch, then select the new address and open modal
      setTimeout(() => {
        if (newAddress.id) {
          setSelectedAddressId(newAddress.id);
        }
        setShowAddressSelectionModal(true);
      }, 300);
    } catch (error: any) {
      console.error("Create address error:", error);
      alert(error?.data?.message || "Có lỗi xảy ra khi thêm địa chỉ");
    }
  };

  // Handle delete address
  const handleDeleteAddress = async (addressId: number) => {
    if (!confirm("Bạn có chắc muốn xóa địa chỉ này?")) {
      return;
    }

    try {
      await deleteAddress(addressId).unwrap();

      // If deleted address was selected, reset selection
      if (selectedAddressId === addressId) {
        setSelectedAddressId(null);
      }

      alert("Xóa địa chỉ thành công!");
    } catch (error: any) {
      console.error("Delete address error:", error);
      alert(error?.data?.message || "Có lỗi xảy ra khi xóa địa chỉ");
    }
  };

  // Handle submit order
  const handleSubmitOrder = async () => {
    // Validate required fields
    if (!receiverName || !receiverPhone) {
      alert("Vui lòng điền đầy đủ thông tin người nhận!");
      return;
    }

    const shippingAddress = getShippingAddress();
    if (!shippingAddress) {
      alert("Vui lòng chọn hoặc nhập địa chỉ giao hàng!");
      return;
    }

    // Validate phone format (10-11 digits)
    if (!/^[0-9]{10,11}$/.test(receiverPhone)) {
      alert("Số điện thoại phải có 10-11 chữ số!");
      return;
    }

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert("Email không hợp lệ!");
      return;
    }

    // Email is required for guest users
    if (!user?.id && !email) {
      alert("Vui lòng nhập email để nhận thông tin đơn hàng!");
      return;
    }

    if (selectedCartItems.length === 0) {
      alert("Không có sản phẩm nào được chọn!");
      return;
    }

    try {
      const orderData: any = {
        receiverName,
        receiverPhone,
        shippingAddress,
        paymentMethod,
        items: selectedCartItems.map((item) => ({
          cartItemId: item.id,
          quantity: item.quantity,
        })),
      };

      // Add customerId if user is logged in
      if (user?.id) {
        orderData.customerId = user.id;
      }

      // Add email if provided
      if (email) {
        orderData.email = email;
      }

      const result = await createOrder(orderData).unwrap();

      // For guest users, redirect to success page with email info
      if (!user?.id) {
        router.push(`/order/success?email=${encodeURIComponent(email)}&guest=true`);
        return;
      }

      // For logged-in users, redirect to order detail page
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
                    Địa chỉ giao hàng <span className="text-red-500">*</span>
                  </label>

                  {/* For logged-in users with saved addresses */}
                  {user?.id && user.addresses && user.addresses.length > 0 ? (
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => setShowAddressSelectionModal(true)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl hover:border-lime-primary focus:ring-2 focus:ring-lime-primary focus:border-transparent outline-none transition-all text-left flex items-center justify-between"
                      >
                        <span className={getShippingAddress() ? "text-gray-800" : "text-gray-400"}>
                          {getShippingAddress() || "Chọn địa chỉ giao hàng"}
                        </span>
                        <MapPin className="w-5 h-5 text-lime-primary" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowAddressModal(true)}
                        className="text-sm text-lime-primary hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Quản lý địa chỉ
                      </button>
                    </div>
                  ) : (
                    /* For guests or users without saved addresses */
                    <div className="space-y-3">
                      <div>
                        <input
                          type="text"
                          value={manualCity}
                          onChange={(e) => {
                            setManualCity(e.target.value);
                            setSelectedAddressId("manual");
                          }}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-lime-primary focus:border-transparent outline-none transition-all"
                          placeholder="Tỉnh/Thành phố *"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={manualWard}
                          onChange={(e) => setManualWard(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-lime-primary focus:border-transparent outline-none transition-all"
                          placeholder="Quận/Huyện/Phường *"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={manualStreet}
                          onChange={(e) => setManualStreet(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-lime-primary focus:border-transparent outline-none transition-all"
                          placeholder="Đường/Phố (tùy chọn)"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={manualPersonalAddress}
                          onChange={(e) => setManualPersonalAddress(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-lime-primary focus:border-transparent outline-none transition-all"
                          placeholder="Số nhà, ngõ, ngách *"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email {!user?.id && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-lime-primary focus:border-transparent outline-none transition-all"
                    placeholder={!user?.id ? "Email để nhận thông tin đơn hàng" : "Email (tùy chọn)"}
                    required={!user?.id}
                  />
                  {!user?.id && (
                    <p className="text-xs text-gray-500 mt-1">
                      Email sẽ được sử dụng để gửi thông tin đơn hàng cho bạn
                    </p>
                  )}
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

      {/* Address Selection Modal */}
      {showAddressSelectionModal && user?.id && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-lime-primary" />
                Chọn địa chỉ giao hàng
              </h3>
              <button
                onClick={() => setShowAddressSelectionModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Saved Addresses */}
              <div className="space-y-2">
                {user.addresses.map((addr) => {
                  const formatAddress = (address: typeof addr) => {
                    // Always format with descriptive labels
                    const parts = [];
                    if (address.personalAddress) parts.push(address.personalAddress);
                    if (address.street) parts.push(`Đường ${address.street}`);
                    if (address.ward) parts.push(`Phường ${address.ward}`);
                    if (address.city) parts.push(`Thành phố ${address.city}`);
                    return parts.join(", ");
                  };

                  return (
                    <button
                      key={addr.id}
                      onClick={() => handleSelectAddress(addr.id)}
                      className={`w-full p-4 border-2 rounded-xl text-left transition-colors ${
                        selectedAddressId === addr.id
                          ? "border-lime-primary bg-lime-50"
                          : "border-gray-200 hover:border-lime-primary"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{formatAddress(addr)}</p>
                        </div>
                        {selectedAddressId === addr.id && (
                          <svg
                            className="w-5 h-5 text-lime-primary mt-0.5 shrink-0 ml-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Add New Address Button */}
              <button
                onClick={handleOpenAddressManagement}
                className="w-full mt-3 py-3 border-2 border-dashed border-lime-primary rounded-xl text-lime-primary hover:bg-lime-50 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Thêm địa chỉ mới
              </button>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowAddressSelectionModal(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => setShowAddressSelectionModal(false)}
                className="flex-1 px-6 py-3 bg-lime-primary text-white font-semibold rounded-xl hover:bg-lime-hover transition-colors"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Address Management Modal */}
      {showAddressModal && user?.id && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-lime-primary" />
                Quản lý địa chỉ
              </h3>
              <button
                onClick={() => setShowAddressModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Saved Addresses List */}
              {user.addresses && user.addresses.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-700 mb-3">Địa chỉ đã lưu</h4>
                  <div className="space-y-2">
                    {user.addresses.map((addr) => {
                      const formatAddress = (address: typeof addr) => {
                        // Always format with descriptive labels
                        const parts = [];
                        if (address.personalAddress) parts.push(address.personalAddress);
                        if (address.street) parts.push(`Đường ${address.street}`);
                        if (address.ward) parts.push(`Phường ${address.ward}`);
                        if (address.city) parts.push(`Thành phố ${address.city}`);
                        return parts.join(", ");
                      };

                      return (
                        <div
                          key={addr.id}
                          className="flex items-start justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
                        >
                          <div className="flex-1 pr-3">
                            <p className="font-medium text-gray-800">{formatAddress(addr)}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                            title="Xóa địa chỉ"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Add New Address Form */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-700">Thêm địa chỉ mới</h4>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tỉnh/Thành phố <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newAddressCity}
                    onChange={(e) => setNewAddressCity(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-lime-primary focus:border-transparent outline-none transition-all"
                    placeholder="Ví dụ: Hà Nội, TP. Hồ Chí Minh"
                  />
                </div>

                {/* Ward */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quận/Huyện/Phường <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newAddressWard}
                    onChange={(e) => setNewAddressWard(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-lime-primary focus:border-transparent outline-none transition-all"
                    placeholder="Ví dụ: Quận 1, Huyện Hoàng Mai"
                  />
                </div>

                {/* Street (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Đường/Phố (Tùy chọn)</label>
                  <input
                    type="text"
                    value={newAddressStreet}
                    onChange={(e) => setNewAddressStreet(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-lime-primary focus:border-transparent outline-none transition-all"
                    placeholder="Ví dụ: Đường Lê Lợi, Phố Huế"
                  />
                </div>

                {/* Personal Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số nhà, ngõ, ngách <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newAddressPersonal}
                    onChange={(e) => setNewAddressPersonal(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-lime-primary focus:border-transparent outline-none transition-all"
                    placeholder="Ví dụ: Số 123, Ngõ 45"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowAddressModal(false);
                  // Return to selection modal if user has addresses
                  if (user?.addresses && user.addresses.length > 0) {
                    setShowAddressSelectionModal(true);
                  }
                }}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Đóng
              </button>
              <button
                onClick={handleCreateAddress}
                disabled={isCreatingAddress}
                className="flex-1 px-6 py-3 bg-lime-primary text-white font-semibold rounded-xl hover:bg-lime-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isCreatingAddress ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang thêm...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Thêm địa chỉ
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
