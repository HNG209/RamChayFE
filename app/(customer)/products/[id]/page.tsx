"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Heart, Share2, Minus, Plus, ShoppingCart, Star, Package, Clock, Shield, Truck, Sparkles, ChevronLeft, ChevronRight, SquareCheckBig, RotateCcw } from "lucide-react"
import { useGetProductByIdQuery } from "@/redux/services/productApi"
import { useAddItemMutation } from "@/redux/services/cartApi"
import { toast } from "sonner"
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel"
import React from "react"

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params)
    const router = useRouter()
    const productId = Number.parseInt(id)

    const { data: product, isLoading } = useGetProductByIdQuery(productId)
    const [addToCart, { isLoading: isAdding }] = useAddItemMutation()

    const [selectedImage, setSelectedImage] = useState(0)
    const [quantity, setQuantity] = useState(1)
    const [isFavorite, setIsFavorite] = useState(false)
    const [carouselApi, setCarouselApi] = useState<any>(null)

    // Sync carousel current slide with selectedImage
    React.useEffect(() => {
        if (!carouselApi) return

        carouselApi.on("select", () => {
            setSelectedImage(carouselApi.selectedScrollSnap())
        })
    }, [carouselApi])

    const handleAddToCart = async () => {
        if (!product) return

        try {
            await addToCart({
                productId: product.id,
                quantity,
                unitPrice: product.price,
                subtotal: product.price * quantity,
            }).unwrap()

            toast.success(`Đã thêm ${quantity} ${product.name} vào giỏ hàng!`)
        } catch (error) {
            console.error("Failed to add to cart:", error)
            toast.error("Không thể thêm vào giỏ hàng. Vui lòng thử lại!")
        }
    }

    const handleBuyNow = async () => {
        await handleAddToCart()
        router.push("/cart")
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background relative overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0" style={{ zIndex: 0 }}>
                    <Image
                        src="/Background-vegan-product.jpg"
                        alt="Background"
                        fill
                        className="object-cover opacity-30 blur-sm"
                        quality={100}
                    />
                    <div className="absolute inset-0 bg-white/60"></div>
                </div>

                <div className="container mx-auto px-4 py-8 relative" style={{ zIndex: 1 }}>
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="text-center">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-chocolate mb-4"></div>
                            <p className="text-chocolate font-semibold">Đang tải sản phẩm...</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl text-gray-600 mb-4">Không tìm thấy sản phẩm</p>
                    <button
                        onClick={() => router.push("/products")}
                        className="px-6 py-2 bg-chocolate text-white rounded-lg hover:bg-chocolate/90"
                    >
                        Quay lại danh sách
                    </button>
                </div>
            </div>
        )
    }

    // Lấy danh sách ảnh - indexImage thật từ backend + mock images để demo carousel
    const mockImages = [
        "/vegan-food-1.png",
        "/vegan-food-2.png",
        "/vegan-food-3.png",
        "/vegan-food-4.png"
    ]

    // Ưu tiên indexImage từ API, sau đó thêm mock images để có nhiều ảnh cho carousel
    const images: string[] = product.indexImage
        ? [product.indexImage, ...mockImages]
        : mockImages

    const hasDiscount = false // Có thể thêm logic discount sau

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0" style={{ zIndex: 0 }}>
                <Image
                    src="/Background-vegan-product.jpg"
                    alt="Background"
                    fill
                    className="object-cover opacity-30 blur-sm"
                    quality={100}
                />
                <div className="absolute inset-0 bg-white/60"></div>
            </div>

            <div className="container mx-auto px-4 py-8 relative" style={{ zIndex: 1 }}>
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-chocolate hover:text-chocolate/80 mb-6 bg-white/90 px-4 py-2 rounded-full shadow-md transition-all hover:shadow-lg relative overflow-hidden group"
                >
                    {/* Sticker effects on hover */}
                    <span className="absolute -top-2 -left-2 text-xl opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-opacity duration-300">🥬</span>
                    <span className="absolute -bottom-2 -right-2 text-lg opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-opacity duration-300 delay-100">🥕</span>
                    <ArrowLeft className="w-5 h-5 relative z-10" />
                    <span className="font-semibold relative z-10">Quay lại</span>
                </button>

                {/* Product Detail */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-green-200 p-6 lg:p-8">
                    {/* Left: Images */}
                    <div className="space-y-4">
                        {/* Main Image Carousel */}
                        <div className="relative aspect-square rounded-2xl overflow-hidden bg-white border-2 border-green-200 shadow-lg">
                            <Carousel className="w-full h-full" opts={{ loop: true }} setApi={setCarouselApi}>
                                <CarouselContent className="h-full ml-0">
                                    {images.map((img, index) => (
                                        <CarouselItem key={index} className="pl-0 basis-full">
                                            <div className="relative w-full aspect-square">
                                                <Image
                                                    src={img}
                                                    alt={`${product.name} - ảnh ${index + 1}`}
                                                    fill
                                                    className="object-cover"
                                                    quality={100}
                                                    priority={index === 0}
                                                />
                                            </div>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                                {images.length > 1 && (
                                    <>
                                        <CarouselPrevious className="left-4 bg-white/90 hover:bg-white text-chocolate border-2 border-chocolate shadow-lg" />
                                        <CarouselNext className="right-4 bg-white/90 hover:bg-white text-chocolate border-2 border-chocolate shadow-lg" />
                                    </>
                                )}
                            </Carousel>

                            {hasDiscount && (
                                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 z-10">
                                    <Sparkles className="w-4 h-4" />
                                    -20%
                                </div>
                            )}
                            <button
                                onClick={() => setIsFavorite(!isFavorite)}
                                className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:scale-110 transition-transform z-10"
                            >
                                <Heart className={`w-6 h-6 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
                            </button>
                        </div>

                        {/* Thumbnail Images */}
                        {images.length > 1 && (
                            <div className="grid grid-cols-4 gap-3">
                                {images.slice(0, 4).map((img: string, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setSelectedImage(idx)
                                            carouselApi?.scrollTo(idx)
                                        }}
                                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedImage === idx ? "border-chocolate shadow-lg scale-105" : "border-green-200 hover:border-chocolate/50"
                                            }`}
                                    >
                                        <Image src={img} alt={`${product.name} ${idx + 1}`} fill className="object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Info */}
                    <div className="space-y-4">
                        {/* Category */}
                        <div className="inline-block">
                            <span className="px-4 py-1 bg-green-100 text-chocolate text-sm font-semibold rounded-full border border-green-200">
                                {product.category?.categoryName || "Sản phẩm chay"}
                            </span>
                        </div>

                        {/* Name */}
                        <h1 className="text-3xl lg:text-4xl font-bold text-chocolate">{product.name}</h1>

                        {/* Stock */}
                        <div className="flex items-center gap-2">
                            <Package className="w-5 h-5 text-green-600" />
                            <span className={`text-sm font-semibold ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}>
                                {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : "Hết hàng"}
                            </span>
                        </div>

                        {/* Price */}
                        <div className="bg-green-50 p-4 rounded-xl border-2 border-green-200">
                            <div className="flex items-end gap-3">
                                {hasDiscount && (
                                    <span className="text-xl text-gray-400 line-through">{(product.price * 1.2).toLocaleString()}đ</span>
                                )}
                                <span className="text-4xl font-bold text-chocolate">{product.price.toLocaleString()}đ</span>
                            </div>
                            {hasDiscount && <p className="text-sm text-green-600 font-medium mt-1">Tiết kiệm {(product.price * 0.2).toLocaleString()}đ</p>}
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className="font-bold text-lg text-chocolate mb-2">Mô tả sản phẩm</h3>
                            <p className="text-gray-700 leading-relaxed">{product.description || "Sản phẩm chay tươi ngon, đảm bảo chất lượng."}</p>
                        </div>

                        {/* Trust Badges */}
                        <div className="bg-green-50/80 backdrop-blur-sm border border-green-200 rounded-lg p-4">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <SquareCheckBig />
                                    <span className="text-gray-700 font-medium">Cam kết chay 100%</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Truck />
                                    <span className="text-gray-700 font-medium">Giao nhanh 30 phút</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <RotateCcw />
                                    <span className="text-gray-700 font-medium">Đổi trả nếu món ăn có lỗi</span>
                                </div>
                            </div>
                        </div>

                        {/* Quantity Selector */}
                        <div>
                            <h3 className="font-bold text-chocolate mb-3">Số lượng</h3>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    disabled={quantity <= 1}
                                    className="p-2 border-2 border-green-200 rounded-lg hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Minus className="w-5 h-5 text-chocolate" />
                                </button>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="w-20 text-center text-lg font-bold py-2 border-2 border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-chocolate/50"
                                />
                                <button
                                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                    disabled={quantity >= product.stock}
                                    className="p-2 border-2 border-green-200 rounded-lg hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Plus className="w-5 h-5 text-chocolate" />
                                </button>
                                <span className="text-sm text-gray-600 ml-2">
                                    Tổng: <span className="font-bold text-chocolate text-lg">{(product.price * quantity).toLocaleString()}đ</span>
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 flex-col sm:flex-row">
                            <button
                                onClick={handleAddToCart}
                                disabled={isAdding || product.stock <= 0}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-chocolate text-chocolate rounded-xl font-bold hover:bg-chocolate hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                {isAdding ? "Đang thêm..." : "Thêm vào giỏ"}
                            </button>
                            <button
                                onClick={handleBuyNow}
                                disabled={isAdding || product.stock <= 0}
                                className="flex-1 px-6 py-4 bg-chocolate text-white rounded-xl font-bold hover:bg-chocolate/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105"
                            >
                                Mua ngay
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
