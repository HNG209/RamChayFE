"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSelector, useDispatch } from "react-redux"
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Package } from "lucide-react"
import { RootState } from "@/redux/store"
import { removeFromCart, updateQuantity, clearCart } from "@/redux/slices/cartSlice"

export default function CartPage() {
    const dispatch = useDispatch()
    const { items, total } = useSelector((state: RootState) => state.cart)
    const [isCheckingOut, setIsCheckingOut] = useState(false)

    const handleQuantityChange = (id: number, newQuantity: number) => {
        if (newQuantity < 1) return
        dispatch(updateQuantity({ id, quantity: newQuantity }))
    }

    const handleRemoveItem = (id: number) => {
        dispatch(removeFromCart(id))
    }

    const handleClearCart = () => {
        if (confirm("Bạn có chắc muốn xóa tất cả sản phẩm?")) {
            dispatch(clearCart())
        }
    }

    const handleCheckout = () => {
        setIsCheckingOut(true)
        // TODO: Navigate to checkout page
        setTimeout(() => setIsCheckingOut(false), 1000)
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-16">
                    <div className="max-w-md mx-auto text-center">
                        <div className="mb-6 flex justify-center">
                            <div className="w-32 h-32 bg-muted rounded-full flex items-center justify-center">
                                <ShoppingBag className="w-16 h-16 text-muted-foreground" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold mb-3">Giỏ hàng trống</h2>
                        <p className="text-muted-foreground mb-6">
                            Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá các sản phẩm của chúng tôi!
                        </p>
                        <Link
                            href="/products"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-chocolate text-white rounded-lg hover:bg-chocolate/90 transition-colors font-semibold"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            Mua sắm ngay
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/products"
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Tiếp tục mua sắm
                    </Link>
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold">Giỏ hàng của bạn</h1>
                        <button
                            onClick={handleClearCart}
                            className="text-sm text-red-600 hover:text-red-700 transition-colors"
                        >
                            Xóa tất cả
                        </button>
                    </div>
                    <p className="text-muted-foreground mt-2">{items.length} sản phẩm</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="flex gap-4">
                                    {/* Product Image */}
                                    <div className="relative w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                                        {item.images?.[0] ? (
                                            <Image
                                                src={item.images[0]}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="w-8 h-8 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between gap-4">
                                            <div className="flex-1">
                                                <Link
                                                    href={`/products/${item.id}`}
                                                    className="font-semibold hover:text-chocolate transition-colors line-clamp-2"
                                                >
                                                    {item.name}
                                                </Link>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {item.category?.categoryName}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveItem(item.id!)}
                                                className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors h-fit"
                                                title="Xóa sản phẩm"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Quantity and Price */}
                                        <div className="flex items-center justify-between mt-4">
                                            {/* Quantity Controls */}
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => handleQuantityChange(item.id!, item.quantity - 1)}
                                                    className="p-1.5 border border-border rounded-md hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="text-sm font-medium w-8 text-center">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => handleQuantityChange(item.id!, item.quantity + 1)}
                                                    className="p-1.5 border border-border rounded-md hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    disabled={item.quantity >= item.stock}
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                                {item.quantity >= item.stock && (
                                                    <span className="text-xs text-orange-600">Hết hàng</span>
                                                )}
                                            </div>

                                            {/* Price */}
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-chocolate">
                                                    {(item.price * item.quantity).toLocaleString()}đ
                                                </p>
                                                {item.quantity > 1 && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {item.price.toLocaleString()}đ / sản phẩm
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-card border border-border rounded-lg p-6 sticky top-4">
                            <h2 className="text-xl font-bold mb-4">Tóm tắt đơn hàng</h2>

                            <div className="space-y-3 mb-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Tạm tính</span>
                                    <span className="font-medium">{total.toLocaleString()}đ</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Phí vận chuyển</span>
                                    <span className="font-medium text-green-600">Miễn phí</span>
                                </div>
                                <div className="border-t border-border pt-3">
                                    <div className="flex justify-between">
                                        <span className="font-semibold">Tổng cộng</span>
                                        <span className="text-2xl font-bold text-chocolate">
                                            {total.toLocaleString()}đ
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                disabled={isCheckingOut}
                                className="w-full py-3 bg-chocolate text-white rounded-lg font-semibold hover:bg-chocolate/90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isCheckingOut ? "Đang xử lý..." : "Thanh toán"}
                            </button>

                            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                                <p className="text-xs text-muted-foreground text-center">
                                    🎉 Miễn phí vận chuyển cho đơn hàng trên 100.000đ
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
