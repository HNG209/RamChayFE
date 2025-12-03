// app/cart/page.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import CartItem from "@/components/CartItem";
import { useGetCartItemsQuery } from "@/redux/services/cartApi";
import { GetItemsResponse } from "@/types/backend";
import { useInView } from "react-intersection-observer";

export default function CartPage() {
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true); // Kiểm tra còn dữ liệu để tải không
  const [cartItems, setCartItems] = useState<GetItemsResponse[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isSelectedAll, setIsSelectedAll] = useState<boolean>(false);

  const { data, isFetching } = useGetCartItemsQuery({ page, size: 10 });

  // Watch scroll bottom
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "100px",
  });

  // Gộp dữ liệu phân trang
  useEffect(() => {
    if (!data) return;

    const newContent = data.content ?? [];

    setCartItems((prev) => {
      const appended = newContent.filter(
        (item) => !prev.some((p) => p.id === item.id)
      );
      return [...prev, ...appended];
    });

    if (isSelectedAll) {
      setSelectedIds((prev) => {
        const appended = newContent.filter(
          (item) => !prev.some((p) => p === item.id)
        );
        return [...prev, ...appended.map((i) => i.id)];
      });
    }

    // Trang cuối
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

  // Cập nhật số lượng
  const updateQuantity = (id: number, newQuantity: number) => {
    setCartItems(
      cartItems.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, newQuantity) } : item
      )
    );
  };

  // Xóa sản phẩm
  const removeItem = (id: number) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
    setSelectedIds(selectedIds.filter((itemId) => itemId !== id));
  };

  // Tính toán tổng tiền
  const totalAmount = useMemo(() => {
    return cartItems
      .filter((item) => selectedIds.includes(item.id))
      .reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  }, [cartItems, selectedIds]);

  const isAllSelected =
    cartItems.length > 0 && selectedIds.length === cartItems.length;

  return (
    <div className="min-h-screen bg-cream-light pb-32 md:pb-10">
      <div className="container mx-auto px-4 pt-6">
        {/* Header Trang */}
        <div className="flex items-center gap-2 mb-6">
          <Link
            href="/products"
            className="p-2 hover:bg-white rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Giỏ hàng của bạn</h1>
          <span className="text-sm text-gray-500 mt-1">
            ({data?.page.totalElements} sản phẩm)
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- CỘT TRÁI: DANH SÁCH SẢN PHẨM --- */}
          <div className="lg:col-span-2 space-y-4">
            {/* Desktop: Header List (Chọn tất cả) */}
            <div className="hidden md:flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleSelectAll}
                  className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                    isAllSelected
                      ? "bg-lime-primary border-lime-primary text-white"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {isAllSelected && <Check className="w-3.5 h-3.5" />}
                </button>
                <span className="font-medium text-gray-700">
                  Chọn tất cả ({data?.page.totalElements})
                </span>
              </div>
              <button
                onClick={() => setSelectedIds([])}
                className="text-sm text-red-500 hover:underline"
              >
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
                    ref={ref} // Gắn cảm biến vào đây
                    className="flex justify-center py-6"
                  >
                    <div className="flex items-center gap-2 text-gray-500 text-sm bg-white px-4 py-2 rounded-full shadow-sm">
                      <Loader2 className="w-4 h-4 animate-spin text-lime-primary" />
                      Đang tải thêm sản phẩm...
                    </div>
                  </div>
                )}

                {!hasMore && cartItems.length > 5 && (
                  <p className="text-center text-gray-400 text-xs py-4">
                    Đã hiển thị tất cả sản phẩm
                  </p>
                )}
              </>
            ) : (
              !isFetching && ( // Chỉ hiện trống khi không đang tải
                <div className="text-center py-10">
                  <p className="text-gray-500">Giỏ hàng trống trơn...</p>
                  <Link
                    href="/products"
                    className="text-lime-primary font-bold hover:underline"
                  >
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
                    className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-28 animate-pulse flex gap-4"
                  >
                    <div className="w-20 h-20 bg-gray-200 rounded-lg shrink-0"></div>
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* --- CỘT PHẢI: SUMMARY (DESKTOP STICKY) --- */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-lime-accent/50 sticky top-24">
              <h3 className="font-bold text-lg text-gray-800 mb-4">
                Thông tin đơn hàng
              </h3>

              <div className="space-y-3 text-sm text-gray-600 mb-6 border-b border-gray-100 pb-6">
                <div className="flex justify-between">
                  <span>
                    Tạm tính ({selectedIds.length}/{data?.page.totalElements}{" "}
                    món)
                  </span>
                  <span className="font-medium">
                    {formatPrice(totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Giảm giá</span>
                  <span className="text-lime-primary">-0đ</span>
                </div>
              </div>

              <div className="flex justify-between items-end mb-6">
                <span className="font-bold text-gray-800">Tổng tiền</span>
                <div className="text-right">
                  <span className="block text-2xl font-bold text-lime-primary">
                    {formatPrice(totalAmount)}
                  </span>
                  <span className="text-xs text-gray-400">
                    (Đã bao gồm VAT)
                  </span>
                </div>
              </div>

              <button className="w-full bg-lime-primary hover:bg-lime-hover text-white font-bold py-3.5 rounded-xl shadow-lg shadow-lime-primary/30 transition-all active:scale-[0.98]">
                Thanh toán ngay
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- MOBILE BOTTOM BAR (FIXED) --- */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 z-50 lg:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {/* Dòng 1: Chọn tất cả (Mobile) */}
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2" onClick={toggleSelectAll}>
            <button
              className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                isAllSelected
                  ? "bg-lime-primary border-lime-primary text-white"
                  : "border-gray-300 bg-white"
              }`}
            >
              {isAllSelected && <Check className="w-3.5 h-3.5" />}
            </button>
            <span className="text-sm text-gray-600">Chọn tất cả</span>
          </div>
          <span className="text-sm text-gray-500">
            Đã chọn: {selectedIds.length}
          </span>
        </div>

        {/* Dòng 2: Tổng tiền & Nút thanh toán */}
        <div className="flex items-center gap-4 justify-between">
          <div>
            <p className="text-xs text-gray-500">Tổng thanh toán:</p>
            <p className="text-lg font-bold text-lime-primary">
              {formatPrice(totalAmount)}
            </p>
          </div>
          <button className="flex-1 bg-lime-primary hover:bg-lime-hover text-white font-bold py-3 rounded-xl shadow-md transition-all active:scale-[0.95]">
            Thanh toán ({selectedIds.length})
          </button>
        </div>
      </div>
    </div>
  );
}
