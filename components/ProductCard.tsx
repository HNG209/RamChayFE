"use client"
import { useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { ShoppingCart, ChevronRight } from "lucide-react"
import type { Product } from "@/types/backend"

// import { addToCart } from "@/redux/slices/cartSlice"

export default function ProductCard({ product }: { product: Product }) {
    const [addItem] = useAddItemMutation()
    const buttonRef = useRef<HTMLButtonElement>(null)

    if (!product) {
        return (
            <div className="h-full rounded-xl bg-card border border-border flex items-center justify-center">
                <p className="text-muted-foreground">Product not available</p>
            </div>
        )
    }

    const categoryName = product.category?.categoryName || "Uncategorized"
    const firstImage = product.images?.[0]

    const handleAddToCart = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        // Add to cart
        // dispatch(addToCart(product))
        // Get button position
        const button = buttonRef.current
        if (!button) return

        const buttonRect = button.getBoundingClientRect()

        // Create flying circle animation
        const flyingCircle = document.createElement('div')
        flyingCircle.className = 'flying-cart-item'
        flyingCircle.style.left = `${buttonRect.left + buttonRect.width / 2}px`
        flyingCircle.style.top = `${buttonRect.top + buttonRect.height / 2}px`

        // Add image to circle if available
        if (firstImage) {
            flyingCircle.style.backgroundImage = `url(${firstImage})`
            flyingCircle.style.backgroundSize = 'cover'
            flyingCircle.style.backgroundPosition = 'center'
        }

        document.body.appendChild(flyingCircle)

        // Get cart icon position (top right of header)
        const cartIcon = document.querySelector('[data-cart-icon]')
        const cartRect = cartIcon?.getBoundingClientRect()

        if (cartRect) {
            // Trigger animation
            requestAnimationFrame(() => {
                flyingCircle.style.left = `${cartRect.left + cartRect.width / 2}px`
                flyingCircle.style.top = `${cartRect.top + cartRect.height / 2}px`
                flyingCircle.style.transform = 'scale(0.2)'
                flyingCircle.style.opacity = '0'
            })
        }

        // Remove element after animation
        setTimeout(() => {
            flyingCircle.remove()
        }, 800)
    }

    return (
        <div className="group h-full flex flex-col overflow-hidden rounded-xl bg-card border border-border shadow-sm hover:shadow-lg transition-all duration-300 ease-out hover:border-chocolate/20">
            {/* Image Container */}
            <div className="relative h-52 w-full bg-linear-to-br from-chocolate to-chocolate/50 overflow-hidden">
                {firstImage ? (
                    <Image
                        src={firstImage}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="text-6xl mb-2 group-hover:scale-110 transition-transform duration-300">📦</div>
                            <p className="text-xs text-muted-foreground">{categoryName}</p>
                        </div>
                    </div>
                )}

                {/* Category Badge */}
                <div className="absolute top-3 right-3">
                    <span className="inline-block px-3 py-1 bg-chocolate/90 text-white text-xs font-semibold rounded-full">
                        {categoryName}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex-1 flex flex-col">
                {/* Product Name */}
                <h3 className="text-sm font-semibold text-foreground mb-1 line-clamp-2 group-hover:text-chocolate transition-colors">
                    {product.name || "Product Name"}
                </h3>

                {/* Description */}
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{categoryName}</p>

                {/* Price Section */}
                <div className="mt-auto mb-3">
                    <p className="text-lg font-bold text-foreground">
                        {product.price?.toLocaleString?.() ?? product.price ?? "N/A"}
                        <span className="text-sm font-medium text-muted-foreground"> đ</span>
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <Link
                        href={`/products/${product.id}`}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-chocolate/20 text-chocolate rounded-lg text-sm font-medium hover:bg-chocolate/30 transition-colors group/link"
                    >
                        Xem
                        <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                    </Link>

                    <button
                        ref={buttonRef}
                        onClick={handleAddToCart}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-chocolate text-white rounded-lg text-sm font-semibold hover:bg-chocolate/90 active:scale-95 transition-all"
                    >
                        <ShoppingCart className="w-4 h-4" />
                        Thêm
                    </button>
                </div>
            </div>
        </div>
    )
}
