// app/cart/page.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Check, Loader2, ShoppingBag, Trash2 } from "lucide-react";
import CartItem from "@/components/CartItem";
import { useDeleteCartItemMutation, useGetCartItemsQuery, useUpdateCartItemMutation } from "@/redux/services/cartApi";
import { GetItemsResponse } from "@/types/backend";
import { useInView } from "react-intersection-observer";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { toggleItemSelected } from "@/redux/slices/cartSlice";

export default function CartPage() {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true); // Kiểm tra còn dữ liệu để tải không
  const [cartItems, setCartItems] = useState<GetItemsResponse[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isSelectedAll, setIsSelectedAll] = useState<boolean>(false);
  const dispatch = useDispatch<AppDispatch>();

  const { data, isFetching } = useGetCartItemsQuery({ page, size: 10 });
  const [updateCartItem] = useUpdateCartItemMutation();
  const [deleteCartItem] = useDeleteCartItemMutation();

  // Watch scroll bottom
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "100px",
  });

  // Gộp dữ liệu phân trang
  useEffect(() => {
    if (!data) return;

    const newContent = data.content ?? [];

    // --- Fix gộp dữ liệu ---
    setCartItems((prev) => {
      // Nếu page = 0, reset lại (refetch từ đầu)
      if (page === 0) {
        return newContent;
      }

      // Nếu page > 0, gộp dữ liệu
      const merged = [...prev, ...newContent];
      return Array.from(
        new Map(merged.map((item) => [item.id, item])).values()
      );
    });

    // --- Fix append selected ids ---
    if (isSelectedAll) {
      setSelectedIds((prev) => {
        const merged = [...prev, ...newContent.map((i) => i.id)];
        return Array.from(new Set(merged));
      });
    }

    // Check end page
    if (data.page.totalPages === page + 1 || newContent.length < 10) {
      setHasMore(false);
    }
  }, [data]);

  // Tự tăng page khi scroll đáy
  useEffect(() => {
    if (inView && hasMore && !isFetching) {
      setPage((prev) => prev + 1);
    }
  }, [inView, hasMore, isFetching]);

  // --- LOGIC XỬ LÝ ---

  // Format tiền
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  // Chọn 1 sản phẩm
  const toggleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((itemId) => itemId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Chọn tất cả
  const toggleSelectAll = () => {
    if (selectedIds.length === cartItems.length) {
      setSelectedIds([]);
      setIsSelectedAll(false);
    } else {
      setSelectedIds(cartItems.map((item) => item.id));
      setIsSelectedAll(true);
    }
  };

  // Cập nhật sản phẩm được chọn trong Redux
  useEffect(() => {
    dispatch(toggleItemSelected(selectedIds));
  }, [selectedIds, dispatch]);

  // Cập nhật số lượng
  const updateQuantity = async (id: number, newQuantity: number) => {
    if (newQuantity < 1) {
      return;
    }

    // Cập nhật UI ngay lập tức (optimistic update)
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );

    // Gửi request lên server
    try {
      await updateCartItem({ itemId: id, quantity: newQuantity }).unwrap();
    } catch (error) {
      console.error("Failed to update quantity:", error);
      // Rollback nếu API thất bại
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === id
            ? { ...item, quantity: cartItems.find((i) => i.id === id)?.quantity || 1 }
            : item
        )
      );
      alert("Không thể cập nhật số lượng. Vui lòng thử lại!");
    }
  };

  // Xóa sản phẩm
  const removeItem = async (id: number) => {
    try {
      await deleteCartItem({ itemId: id }).unwrap();
      // Reset page về 0 để refetch từ đầu
      setPage(0);
      setHasMore(true);
      setSelectedIds(selectedIds.filter((itemId) => itemId !== id));
    } catch (error) {
      console.error("Failed to remove item:", error);
    }
  };

  // Tính toán tổng tiền
  const totalAmount = useMemo(() => {
    return cartItems
      .filter((item) => selectedIds.includes(item.id))
      .reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  }, [cartItems, selectedIds]);

  const isAllSelected = cartItems.length > 0 && selectedIds.length === cartItems.length;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-32 md:pb-10">
      {/* Background Image */}
      <div className="absolute inset-0" style={{ zIndex: 0 }}>
        <Image
          src="/Background-vegan-product.jpg"
          alt="Cart Background"
          fill
          className="object-cover opacity-80 blur-sm"
          quality={100}
        />
        <div className="absolute inset-0 bg-green/80"></div>
      </div>

      <div className="container mx-auto px-4 pt-8 relative" style={{ zIndex: 1 }}>
        {/* Header Trang */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/products"
            className="p-3 bg-green-100 hover:bg-green-50 rounded-full transition-all shadow-md hover:shadow-lg border-2 border-green-200"
          >
            <ArrowLeft className="w-6 h-6 text-chocolate" />
          </Link>
          <div className="bg-green-100 px-6 py-4 rounded-xl shadow-lg border-2 border-green-200 flex items-center gap-3">
            <ShoppingBag className="w-7 h-7 text-chocolate" />
            <div>
              <h1 className="text-2xl font-bold text-chocolate">Giỏ hàng của bạn</h1>
              <span className="text-sm text-gray-600">
                {data?.page.totalElements || 0} sản phẩm
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- CỘT TRÁI: DANH SÁCH SẢN PHẨM --- */}
          <div className="lg:col-span-2 space-y-4">
            {/* Desktop: Header List (Chọn tất cả) */}
            <div className="hidden md:flex items-center justify-between bg-green-50/80 backdrop-blur-sm p-5 rounded-xl border-2 border-green-200 shadow-lg">
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleSelectAll}
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isAllSelected
                    ? "bg-chocolate border-chocolate text-white scale-110"
                    : "border-green-300 bg-green-400 hover:border-chocolate"
                    }`}
                >
                  {isAllSelected && <Check className="w-4 h-4" />}
                </button>
                <span className="font-bold text-chocolate">
                  Chọn tất cả ({data?.page.totalElements})
                </span>
              </div>
              <button
                onClick={() => setSelectedIds([])}
                className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 font-semibold hover:underline transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Bỏ chọn
              </button>
            </div>
            {/* List Items */}
            {/* {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  isSelected={selectedIds.includes(item.id)}
                  onToggleSelect={toggleSelect}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                />
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">Giỏ hàng trống trơn...</p>
                <Link
                  href="/products"
                  className="text-lime-primary font-bold hover:underline"
                >
                  Đi chợ ngay
                </Link>
              </div>
            )} */}

            {cartItems.length > 0 ? (
              <>
                {cartItems.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    isSelected={selectedIds.includes(item.id)}
                    onToggleSelect={toggleSelect}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                  />
                ))}

                {/* --- 6. PHẦN TẢI THÊM (INFINITE SCROLL) --- */}
                {hasMore && (
                  <div
                    ref={ref}
                    className="flex justify-center py-6"
                  >
                    <div className="flex items-center gap-3 text-chocolate text-sm bg-green-100 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border-2 border-green-200 font-semibold">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Đang tải thêm sản phẩm...
                    </div>
                  </div>
                )}

                {!hasMore && cartItems.length > 5 && (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm bg-green-100 inline-block px-4 py-2 rounded-full">
                      Đã hiển thị tất cả sản phẩm
                    </p>
                  </div>
                )}
              </>
            ) : (
              !isFetching && (
                <div className="text-center py-16 bg-green-100 backdrop-blur-sm rounded-2xl border-2 border-green-200 shadow-lg">
                  <div className="mb-4 text-6xl">🛒</div>
                  <p className="text-xl font-bold text-chocolate mb-2">Giỏ hàng trống trơn...</p>
                  <p className="text-gray-600 mb-6">Thêm sản phẩm vào giỏ hàng để bắt đầu mua sắm!</p>
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 bg-chocolate text-white px-8 py-3 rounded-xl font-bold hover:bg-chocolate/90 transition-all shadow-lg hover:scale-105"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    Đi chợ ngay
                  </Link>
                </div>
              )
            )}

            {/* Skeleton Loading lần đầu tiên vào trang (Page 0) */}
            {isFetching && page === 0 && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-green-100 backdrop-blur-sm p-5 rounded-xl shadow-lg border-2 border-green-200 h-32 animate-pulse flex gap-4"
                  >
                    <div className="w-24 h-24 bg-green-200 rounded-xl shrink-0"></div>
                    <div className="flex-1 space-y-3 py-2">
                      <div className="h-5 bg-green-200 rounded-lg w-3/4"></div>
                      <div className="h-4 bg-green-100 rounded-lg w-1/2"></div>
                      <div className="h-4 bg-green-100 rounded-lg w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* --- CỘT PHẢI: SUMMARY (DESKTOP STICKY) --- */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-green-50/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border-2 border-green-200 sticky top-24">
              <h3 className="font-bold text-xl text-chocolate mb-6 flex items-center gap-2">
                <ShoppingBag className="w-6 h-6" />
                Thông tin đơn hàng
              </h3>

              <div className="space-y-4 text-sm mb-6 pb-6 border-b-2 border-green-100">
                <div className="flex justify-between items-center bg-green-100 p-3 rounded-lg shadow-sm">
                  <span className="text-gray-700">
                    Tạm tính ({selectedIds.length}/{data?.page.totalElements} món)
                  </span>
                  <span className="font-medium">{formatPrice(totalAmount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Giảm giá</span>
                  <span className="text-green-600 font-semibold">-0đ</span>
                </div>
              </div>

              <div className="flex justify-between items-end mb-6 bg-linear-to-r from-green-50 to-lime-50 p-4 rounded-xl border-2 border-green-100">
                <span className="font-bold text-gray-800 text-lg">Tổng tiền</span>
                <div className="text-right">
                  <span className="block text-3xl font-bold text-chocolate">
                    {formatPrice(totalAmount)}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    (Đã bao gồm VAT)
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (selectedIds.length === 0) {
                    alert("Vui lòng chọn ít nhất một sản phẩm để thanh toán!");
                    return;
                  }
                  router.push(`/order?items=${selectedIds.join(",")}`);
                }}
                disabled={selectedIds.length === 0}
                className="
    w-full bg-chocolate hover:bg-chocolate/90 text-white font-bold 
    py-4 rounded-xl shadow-lg shadow-chocolate/30 transition-all 
    hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2
    disabled:opacity-50 disabled:cursor-not-allowed
  "
              >
                <ShoppingBag className="w-5 h-5" />
                Thanh toán ngay
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- MOBILE BOTTOM BAR (FIXED) --- */}
      <div className="fixed bottom-0 left-0 w-full bg-green-100 backdrop-blur-sm border-t-2 border-green-200 p-4 z-50 lg:hidden shadow-[0_-8px_16px_-4px_rgba(0,0,0,0.1)]">
        {/* Dòng 1: Chọn tất cả (Mobile) */}
        <div className="flex items-center justify-between mb-3 pb-3 border-b-2 border-green-100">
          <div className="flex items-center gap-3" onClick={toggleSelectAll}>
            <button
              className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isAllSelected
                ? "bg-chocolate border-chocolate text-white shadow-lg shadow-chocolate/30"
                : "border-gray-300 bg-green-100 hover:border-chocolate/50"
                }`}
            >
              {isAllSelected && <Check className="w-4 h-4" />}
            </button>
            <span className="text-sm font-medium text-gray-700">Chọn tất cả</span>
          </div>
          <span className="text-sm font-semibold text-chocolate bg-green-100 px-3 py-1 rounded-full">
            {selectedIds.length} sản phẩm
          </span>
        </div>

        {/* Dòng 2: Tổng tiền & Nút thanh toán */}
        <div className="flex items-center gap-4 justify-between">
          <div className="bg-green-400 px-4 py-2 rounded-xl border border-green-200">
            <p className="text-xs text-gray-600 font-medium mb-0.5">Tổng thanh toán</p>
            <p className="text-xl font-bold text-chocolate">
              {formatPrice(totalAmount)}
            </p>
          </div>

          <button
            onClick={() => {
              if (selectedIds.length === 0) {
                alert("Vui lòng chọn ít nhất một sản phẩm để thanh toán!");
                return;
              }
              router.push(`/order?items=${selectedIds.join(",")}`);
            }}
            disabled={selectedIds.length === 0}
            className="
    flex-1 bg-chocolate hover:bg-chocolate/90 text-white font-bold 
    py-4 rounded-xl shadow-lg shadow-chocolate/30 
    transition-all hover:scale-[1.02] active:scale-[0.98] 
    flex items-center justify-center gap-2 
    disabled:opacity-50 disabled:cursor-not-allowed
  "
          >
            <ShoppingBag className="w-5 h-5" />
            Thanh toán ({selectedIds.length})
          </button>
        </div>
      </div>
    </div>
  );
}
