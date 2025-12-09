// components/cart/CartItem.tsx
import Image from "next/image";
import { Minus, Plus, Trash2, Check } from "lucide-react";
import { CartProduct, GetItemsResponse } from "@/types/backend";

interface CartItemProps {
  item: GetItemsResponse;
  isSelected: boolean;
  onToggleSelect: (id: number) => void;
  onUpdateQuantity: (id: number, newQuantity: number) => void;
  onRemove: (id: number) => void;
}

export default function CartItem({
  item,
  isSelected,
  onToggleSelect,
  onUpdateQuantity,
  onRemove,
}: CartItemProps) {
  // Format tiền tệ VNĐ
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  return (
    <div className="bg-green-50 p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 transition-all hover:shadow-md">
      {/* 1. Checkbox & Image */}
      <div className="flex items-center gap-3">
        {/* Custom Checkbox */}
        <button
          onClick={() => onToggleSelect(item.id)}
          className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected
            ? "bg-lime-primary border-lime-primary text-white"
            : "border-gray-300 bg-white"
            }`}
        >
          {isSelected && <Check className="w-3.5 h-3.5" />}
        </button>

        {/* Ảnh sản phẩm */}
        <div className="relative w-20 h-20 shrink-0 bg-cream-dark rounded-lg overflow-hidden border border-lime-accent/30">
          <Image
            src={item.indexImage}
            alt={item.productName}
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* 2. Info & Actions */}
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-gray-800 text-sm md:text-base line-clamp-2">
            {item.productName}
          </h3>
          {/* Nút xóa (Ẩn trên mobile, hiện ở desktop hoặc ngược lại tùy design, ở đây tôi để luôn hiện) */}
          <button
            onClick={() => onRemove(item.id)}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex justify-between items-end mt-2">
          {/* Bộ điều khiển số lượng */}
          <div className="flex items-center border border-gray-200 rounded-lg">
            <button
              onClick={() => {
                if (item.quantity > 1) {
                  onUpdateQuantity(item.id, item.quantity - 1)
                }
              }}
              disabled={item.quantity <= 1}
              className="p-1.5 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 transition-colors"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-8 text-center text-sm font-medium text-gray-700">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              // disabled={item.quantity >= item.stock}
              className="p-1.5 hover:bg-gray-100 disabled:opacity-50 text-gray-600"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Giá tiền */}
          <div className="text-right">
            <p className="font-bold text-lime-primary text-sm md:text-base">
              {formatPrice(item.unitPrice)}
            </p>
            {/* Nếu muốn hiện tổng tiền của riêng item này */}
            {/* <p className="text-xs text-gray-400">Tổng: {formatPrice(item.price * item.quantity)}</p> */}
          </div>
        </div>
      </div>
    </div>
  );
}
