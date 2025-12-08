"use client"

import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ShoppingCart } from "lucide-react"
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel"
import type { Product } from "@/types/backend"
import React from "react"

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params)
    console.log("Received ID:", id)

    // Mock product with multiple images
    const product: Product = {
        id: Number.parseInt(id),
        name: `Sản phẩm chay mẫu #${id}`,
        price: 85000,
        stock: 12,
        description:
            "Sản phẩm chay cao cấp được chế biến từ các nguyên liệu tự nhiên, không chứa động vật. Đảm bảo chất lượng tươi ngon, an toàn cho sức khỏe. Hoàn hảo cho những ai theo chế độ ăn chay hoặc tìm kiếm lựa chọn thực phẩm lành mạnh.",
        category: {
            categoryName: "Đồ ăn chay",
            description: "Các sản phẩm ăn chay chế biến từ nguồn tự nhiên",
        },
        images: ["/vegan-food-1.png", "/vegan-food-2.png", "/vegan-food-3.png", "/vegan-food-4.png"],
    }

    const [currentImageIndex, setCurrentImageIndex] = React.useState(0)

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="container mx-auto px-4 py-4 border-b border-border">
                <Link
                    href="/products"
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                    Quay lại
                </Link>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Image Carousel Section */}
                    <div className="flex flex-col gap-4">
                        <div className="relative bg-card rounded-lg border border-border overflow-hidden aspect-square">
                            <Carousel className="w-full h-full" opts={{ loop: true }}>
                                <CarouselContent className="h-full">
                                    {product.images?.map((image, index) => (
                                        <CarouselItem key={index} className="h-full">
                                            <div className="relative w-full h-full flex items-center justify-center bg-muted">
                                                <img
                                                    src={image || "/placeholder.svg"}
                                                    alt={`${product.name} - ảnh ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                                <CarouselPrevious className="left-4 bg-primary/80 hover:bg-primary text-primary-foreground border-0 shadow-md" />
                                <CarouselNext className="right-4 bg-primary/80 hover:bg-primary text-primary-foreground border-0 shadow-md" />
                            </Carousel>
                        </div>

                        {/* Thumbnail Gallery */}
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {product.images?.map((image, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentImageIndex(index)}
                                    className={`h-20 w-20 shrink-0 rounded-md border-2 overflow-hidden transition-all ${currentImageIndex === index ? "border-primary" : "border-border hover:border-muted-foreground"
                                        }`}
                                >
                                    <Image
                                        src={image || "/placeholder.svg?height=80&width=80&query=thumbnail"}
                                        alt={`Thumbnail ${index + 1}`}
                                        width={80}
                                        height={80}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Info Section */}
                    <div className="flex flex-col gap-6">
                        {/* Category */}
                        <div>
                            <span className="inline-block px-3 py-1 bg-amber-300 text-amber-900 text-xs font-semibold rounded-full">
                                {product.category.categoryName}
                            </span>
                        </div>

                        {/* Title */}
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{product.name}</h1>
                            <p className="text-muted-foreground">Sản phẩm đồ ăn chay chất lượng cao</p>
                        </div>

                        {/* Price */}
                        <div className="bg-card border border-border rounded-lg p-4">
                            <p className="text-sm text-muted-foreground mb-1">Giá</p>
                            <p className="text-3xl font-bold text-primary">{product.price?.toLocaleString?.()} đ</p>
                        </div>

                        {/* Stock */}
                        <div>
                            <p className="text-sm text-muted-foreground mb-2">Tồn kho</p>
                            <div className="flex items-center gap-2">
                                <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary"
                                        style={{ width: `${Math.min(((product.stock || 0) / 20) * 100, 100)}%` }}
                                    />
                                </div>
                                <p className="text-sm font-medium text-foreground">{product.stock} sản phẩm</p>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h2 className="text-lg font-semibold text-foreground mb-2">Mô tả sản phẩm</h2>
                            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
                            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg text-base font-semibold hover:bg-primary/90 active:scale-95 transition-all">
                                <ShoppingCart className="w-5 h-5" />
                                Thêm vào giỏ
                            </button>
                            <button className="flex-1 px-4 py-3 border border-primary text-primary rounded-lg text-base font-semibold hover:bg-primary/5 transition-colors">
                                Mua ngay
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
