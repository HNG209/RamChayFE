"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import ProductCard from "@/components/ProductCard"
import { SlidersHorizontal, X, Grid3x3, LayoutGrid, Sparkles } from "lucide-react"
import { useGetProductsQuery, useSearchProductsAIQuery } from "@/redux/services/productApi"
import { useSearchParams, useRouter } from "next/navigation"
import { useInView } from "react-intersection-observer"

const mockProducts = [
    {
        id: 1,
        name: "Đậu hũ chiên giòn",
        price: 45000,
        stock: 20,
        description: "Đậu hũ chiên giòn, thơm ngon",
        category: { categoryName: "Món chiên", description: "Các món chiên giòn" },
        images: ["/vegan-food-1.png", "/vegan-food-2.png", "/vegan-food-3.png", "/vegan-food-4.png"],
    },
    {
        id: 2,
        name: "Chả chay",
        price: 38000,
        stock: 10,
        description: "Chả chay đặc biệt",
        category: { categoryName: "Món chay", description: "Món chay truyền thống" },
        images: ["/vegan-food-1.png", "/vegan-food-2.png", "/vegan-food-3.png", "/vegan-food-4.png"],
    },
    {
        id: 3,
        name: "Cơm cuộn chay",
        price: 55000,
        stock: 15,
        description: "Cơm cuộn chay ngon miệng",
        category: { categoryName: "Món cuộn", description: "Các món cuộn" },
        images: ["/vegan-food-1.png", "/vegan-food-2.png", "/vegan-food-3.png", "/vegan-food-4.png"],

    },
    {
        id: 4,
        name: "Gỏi cuốn chay",
        price: 30000,
        stock: 25,
        description: "Gỏi cuốn tươi mát",
        category: { categoryName: "Món cuộn", description: "Các món cuốn" },
        images: ["/vegan-food-1.png", "/vegan-food-2.png", "/vegan-food-3.png", "/vegan-food-4.png"],
    },
];

export default function CustomerProductsPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const searchFromUrl = searchParams.get("search") || ""
    const aiSearchFromUrl = searchParams.get("aiSearch") === "true"
    const [searchTerm, setSearchTerm] = useState(searchFromUrl)
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [isAISearch, setIsAISearch] = useState(false) // Toggle AI search

    // Sync AI search from URL or localStorage
    useEffect(() => {
        // Prioritize URL param, then localStorage
        if (searchParams.get("aiSearch") !== null) {
            setIsAISearch(aiSearchFromUrl)
        } else {
            const saved = localStorage.getItem('aiSearchEnabled')
            if (saved !== null) {
                setIsAISearch(saved === 'true')
            }
        }
    }, [])

    // Infinite scroll state
    const [displayedCount, setDisplayedCount] = useState(12) // Hiển thị 12 sản phẩm ban đầu
    const ITEMS_PER_PAGE = 8 // Load thêm 8 sản phẩm mỗi lần

    // Intersection observer for infinite scroll
    const { ref: loadMoreRef, inView } = useInView({
        threshold: 0,
        rootMargin: "200px",
    })

    // Sync searchTerm với URL khi searchParams thay đổi
    useEffect(() => {
        setSearchTerm(searchFromUrl)
    }, [searchFromUrl])

    // Fetch products từ API
    const { data: regularProductsData, isLoading: isLoadingRegular } = useGetProductsQuery()

    // AI Search - chỉ gọi khi bật AI và có search term
    const { data: aiSearchData, isLoading: isLoadingAI } = useSearchProductsAIQuery(searchTerm, {
        skip: !searchTerm || !isAISearch
    })

    // Xác định data nào được sử dụng
    const apiProducts = (searchTerm && isAISearch)
        ? (aiSearchData || [])
        : (regularProductsData || [])

    const isLoading = (searchTerm && isAISearch) ? isLoadingAI : isLoadingRegular

    // Tính price range động từ danh sách sản phẩm
    const MIN_PRICE = 0
    const MAX_PRICE = apiProducts.length > 0
        ? Math.max(...apiProducts.map(p => p.price))
        : 100000

    // Temporary filter states (chưa apply)
    const [tempCategory, setTempCategory] = useState("all")
    const [tempMinPrice, setTempMinPrice] = useState(MIN_PRICE)
    const [tempMaxPrice, setTempMaxPrice] = useState(MAX_PRICE)
    const [tempSortBy, setTempSortBy] = useState("default")

    // Applied filter states (đã apply)
    const [selectedCategory, setSelectedCategory] = useState("all")
    const [minPrice, setMinPrice] = useState(MIN_PRICE)
    const [maxPrice, setMaxPrice] = useState(MAX_PRICE)
    const [sortBy, setSortBy] = useState("default")

    // Grid columns state (chỉ áp dụng cho màn hình lớn)
    const [gridCols, setGridCols] = useState<3 | 4>(4)

    // Floating stickers state
    const [floatingStickers, setFloatingStickers] = useState<Array<{ id: number; emoji: string; side: 'left' | 'right'; delay: number }>>([])

    const veganEmojis = ['🥬', '🥦', '🥕', '🍄', '🌽', '🫑', '🥒', '🍅', '🥑', '🫛']

    // Lấy danh sách categories
    const categories = ["all", ...new Set(apiProducts.map(p => p.category?.categoryName).filter(Boolean))]

    // Update price range khi data thay đổi
    useEffect(() => {
        if (apiProducts.length > 0) {
            const maxProductPrice = Math.max(...apiProducts.map(p => p.price))
            setTempMaxPrice(maxProductPrice)
            setMaxPrice(maxProductPrice)
        }
    }, [apiProducts.length])

    // Floating stickers effect khi mở filter
    useEffect(() => {
        if (!isFilterOpen) {
            setFloatingStickers([])
            return
        }

        const interval = setInterval(() => {
            // Random chance to spawn a sticker (80% chance every interval)
            if (Math.random() > 0.2) {
                const newSticker = {
                    id: Date.now() + Math.random(),
                    emoji: veganEmojis[Math.floor(Math.random() * veganEmojis.length)],
                    side: Math.random() > 0.5 ? 'left' : 'right' as 'left' | 'right',
                    delay: 0
                }

                setFloatingStickers(prev => [...prev, newSticker])

                // Remove sticker after animation completes (4 seconds)
                setTimeout(() => {
                    setFloatingStickers(prev => prev.filter(s => s.id !== newSticker.id))
                }, 4000)
            }
        }, 4000) // Check every 4 seconds

        return () => clearInterval(interval)
    }, [isFilterOpen])

    // Apply filters
    const handleApplyFilters = () => {
        setSelectedCategory(tempCategory)
        setMinPrice(tempMinPrice)
        setMaxPrice(tempMaxPrice)
        setSortBy(tempSortBy)
        setIsFilterOpen(false)
    }

    // Reset filters
    const handleResetFilters = () => {
        setTempCategory("all")
        setTempMinPrice(MIN_PRICE)
        setTempMaxPrice(MAX_PRICE)
        setTempSortBy("default")
        setSelectedCategory("all")
        setMinPrice(MIN_PRICE)
        setMaxPrice(MAX_PRICE)
        setSortBy("default")
        setSearchTerm("")
        // Xóa search param khỏi URL
        router.push("/products")
    }

    // Lọc sản phẩm
    let filteredProducts = apiProducts

    // Lọc theo tìm kiếm (chỉ áp dụng cho search thường, AI search đã xử lý trên server)
    if (searchTerm && !isAISearch) {
        filteredProducts = filteredProducts.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }

    // Lọc theo category
    if (selectedCategory !== "all") {
        filteredProducts = filteredProducts.filter(p => p.category?.categoryName === selectedCategory)
    }

    // Lọc theo giá
    filteredProducts = filteredProducts.filter(p => p.price >= minPrice && p.price <= maxPrice)

    // Sắp xếp
    if (sortBy === "price-asc") {
        filteredProducts = [...filteredProducts].sort((a, b) => a.price - b.price)
    } else if (sortBy === "price-desc") {
        filteredProducts = [...filteredProducts].sort((a, b) => b.price - a.price)
    } else if (sortBy === "name") {
        filteredProducts = [...filteredProducts].sort((a, b) => a.name.localeCompare(b.name))
    }

    // Infinite scroll: Lấy sản phẩm để hiển thị
    const displayedProducts = filteredProducts.slice(0, displayedCount)
    const hasMore = displayedCount < filteredProducts.length

    // Load more khi scroll đến cuối
    useEffect(() => {
        if (inView && hasMore && !isLoading) {
            setDisplayedCount(prev => prev + ITEMS_PER_PAGE)
        }
    }, [inView, hasMore, isLoading])

    // Reset displayed count khi filter thay đổi
    useEffect(() => {
        setDisplayedCount(12)
    }, [searchTerm, selectedCategory, minPrice, maxPrice, sortBy])

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Floating Stickers */}
            {floatingStickers.map(sticker => (
                <div
                    key={sticker.id}
                    className={`fixed ${sticker.side === 'left' ? 'left-4 md:left-8' : 'right-4 md:right-8'} text-4xl md:text-6xl pointer-events-none z-40 animate-float-up opacity-0`}
                    style={{
                        bottom: '-100px',
                        animation: 'float-up 4s ease-in-out forwards',
                        animationDelay: `${sticker.delay}s`
                    }}
                >
                    {sticker.emoji}
                </div>
            ))}

            <style jsx>{`
                @keyframes float-up {
                    0% {
                        bottom: -100px;
                        opacity: 0;
                        transform: translateX(0) rotate(0deg);
                    }
                    10% {
                        opacity: 1;
                    }
                    50% {
                        transform: translateX(${Math.random() > 0.5 ? '20px' : '-20px'}) rotate(${Math.random() * 360}deg);
                    }
                    90% {
                        opacity: 1;
                    }
                    100% {
                        bottom: 100vh;
                        opacity: 0;
                        transform: translateX(0) rotate(360deg);
                    }
                }
            `}</style>

            {/* Background Image */}
            <div className="absolute inset-0" style={{ zIndex: 0 }}>
                <Image
                    src="/Background-vegan-product.jpg"
                    alt="Products Background"
                    fill
                    className="object-cover opacity-80 blur-sm"
                    quality={100}
                />
                <div className="absolute inset-0 bg-green/80"></div>
            </div>

            <div className="container mx-auto px-4 py-8 relative" style={{ zIndex: 1 }}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        {/* Grid Columns Toggle (Desktop only) */}
                        <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
                            <span className="text-sm text-muted-foreground">Hiển thị:</span>
                            <button
                                onClick={() => setGridCols(3)}
                                className={`p-2 rounded transition-colors ${gridCols === 3 ? 'bg-chocolate text-white' : 'bg-background hover:bg-muted-foreground/10'
                                    }`}
                                title="3 cột"
                            >
                                <Grid3x3 className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setGridCols(4)}
                                className={`p-2 rounded transition-colors ${gridCols === 4 ? 'bg-chocolate text-white' : 'bg-background hover:bg-muted-foreground/10'
                                    }`}
                                title="4 cột"
                            >
                                <LayoutGrid className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Filter Toggle Button */}
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="flex items-center gap-2 px-4 py-2 bg-chocolate text-white rounded-lg hover:bg-chocolate/90 transition-colors"
                        >
                            <SlidersHorizontal className="w-5 h-5" />
                            Bộ lọc
                        </button>
                    </div>
                </div>

                {/* Active Filters Display */}
                {(selectedCategory !== "all" || minPrice !== MIN_PRICE || maxPrice !== MAX_PRICE || sortBy !== "default" || searchTerm) && (
                    <div className="mb-4 flex flex-wrap gap-2 items-center">
                        <span className="text-sm text-muted-foreground">Đang lọc:</span>
                        {searchTerm && (
                            <>
                                <span className="px-3 py-1 bg-green-100 text-amber-950 text-sm rounded-full flex items-center gap-1">
                                    {isAISearch && <Sparkles className="w-3 h-3" />}
                                    Tìm kiếm {isAISearch && 'AI'}: "{searchTerm}"
                                </span>
                                {isAISearch && (
                                    <span className="px-3 py-1 bg-linear-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full font-semibold shadow-md">
                                        🤖 AI Semantic Search
                                    </span>
                                )}
                            </>
                        )}
                        {selectedCategory !== "all" && (
                            <span className="px-3 py-1 bg-chocolate/10 text-chocolate text-sm rounded-full">
                                {selectedCategory}
                            </span>
                        )}
                        {(minPrice !== MIN_PRICE || maxPrice !== MAX_PRICE) && (
                            <span className="px-3 py-1 bg-chocolate/10 text-chocolate text-sm rounded-full">
                                {minPrice.toLocaleString()}đ - {maxPrice.toLocaleString()}đ
                            </span>
                        )}
                        {sortBy !== "default" && (
                            <span className="px-3 py-1 bg-chocolate/10 text-chocolate text-sm rounded-full">
                                {sortBy === "price-asc" && "Giá tăng dần"}
                                {sortBy === "price-desc" && "Giá giảm dần"}
                                {sortBy === "name" && "A-Z"}
                            </span>
                        )}
                        <button
                            onClick={handleResetFilters}
                            className="text-sm rounded-full bg-green-100 text-amber-950 hover:underline"
                        >
                            Xóa tất cả
                        </button>
                    </div>
                )}

                {/* Result Count */}
                <div className="inline-block bg-white/90 px-4 py-2 rounded-lg shadow-md border border-green-200 mb-4">
                    <p className="text-sm font-semibold text-chocolate">
                        Tìm thấy <span className="text-lg font-bold">{filteredProducts.length}</span> sản phẩm
                    </p>
                </div>

                {/* Filter Sidebar */}
                <div className={`fixed top-0 right-0 h-full w-96 bg-linear-to-br from-white to-green-50/30 backdrop-blur-sm border-l border-green-200 shadow-2xl transform transition-transform duration-300 z-50 ${isFilterOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="flex flex-col h-full">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-green-100 bg-white/80">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-chocolate">
                                <SlidersHorizontal className="w-6 h-6" />
                                Bộ lọc
                            </h2>
                            <button
                                onClick={() => setIsFilterOpen(false)}
                                className="p-2 hover:bg-green-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-chocolate" />
                            </button>
                        </div>

                        {/* Filter Options */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Category Filter */}
                            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-green-100 shadow-sm">
                                <label className="flex items-center gap-2 text-sm font-bold mb-4 text-chocolate">
                                    <span className="w-1 h-5 bg-chocolate rounded-full"></span>
                                    Danh mục
                                </label>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-green-50 transition-colors group">
                                        <div className="relative">
                                            <input
                                                type="radio"
                                                name="category"
                                                value="all"
                                                checked={tempCategory === "all"}
                                                onChange={(e) => setTempCategory(e.target.value)}
                                                className="w-5 h-5 text-chocolate focus:ring-2 focus:ring-chocolate/50 cursor-pointer"
                                            />
                                        </div>
                                        <span className="text-sm font-medium group-hover:text-chocolate transition-colors">Tất cả</span>
                                    </label>
                                    {categories.filter(c => c !== "all").map(cat => (
                                        <label key={cat} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-green-50 transition-colors group">
                                            <div className="relative">
                                                <input
                                                    type="radio"
                                                    name="category"
                                                    value={cat}
                                                    checked={tempCategory === cat}
                                                    onChange={(e) => setTempCategory(e.target.value)}
                                                    className="w-5 h-5 text-chocolate focus:ring-2 focus:ring-chocolate/50 cursor-pointer"
                                                />
                                            </div>
                                            <span className="text-sm font-medium group-hover:text-chocolate transition-colors">{cat}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range Filter */}
                            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-green-100 shadow-sm">
                                <label className="flex items-center gap-2 text-sm font-bold mb-4 text-chocolate">
                                    <span className="w-1 h-5 bg-chocolate rounded-full"></span>
                                    Khoảng giá
                                </label>
                                <div className="space-y-4">
                                    {/* Price Display */}
                                    <div className="flex items-center justify-between text-sm gap-2">
                                        <input
                                            type="number"
                                            value={tempMinPrice}
                                            onChange={(e) => setTempMinPrice(Math.min(Number(e.target.value), tempMaxPrice))}
                                            className="w-28 px-3 py-2 border-2 border-green-200 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-chocolate/50 focus:border-chocolate font-medium"
                                        />
                                        <span className="text-chocolate font-bold">—</span>
                                        <input
                                            type="number"
                                            value={tempMaxPrice}
                                            onChange={(e) => setTempMaxPrice(Math.max(Number(e.target.value), tempMinPrice))}
                                            className="w-28 px-3 py-2 border-2 border-green-200 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-chocolate/50 focus:border-chocolate font-medium"
                                        />
                                    </div>

                                    {/* Dual Range Slider */}
                                    <div className="relative pt-2 pb-6">
                                        {/* Track */}
                                        <div className="absolute top-1/2 -translate-y-1/2 w-full h-1 bg-muted rounded-full">
                                            {/* Active Track */}
                                            <div
                                                className="absolute h-full bg-chocolate rounded-full"
                                                style={{
                                                    left: `${(tempMinPrice / MAX_PRICE) * 100}%`,
                                                    right: `${100 - (tempMaxPrice / MAX_PRICE) * 100}%`
                                                }}
                                            />
                                        </div>

                                        {/* Min Slider */}
                                        <input
                                            type="range"
                                            min={MIN_PRICE}
                                            max={MAX_PRICE}
                                            step={1000}
                                            value={tempMinPrice}
                                            onChange={(e) => setTempMinPrice(Math.min(Number(e.target.value), tempMaxPrice))}
                                            className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-chocolate [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-chocolate [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md"
                                        />

                                        {/* Max Slider */}
                                        <input
                                            type="range"
                                            min={MIN_PRICE}
                                            max={MAX_PRICE}
                                            step={1000}
                                            value={tempMaxPrice}
                                            onChange={(e) => setTempMaxPrice(Math.max(Number(e.target.value), tempMinPrice))}
                                            className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-chocolate [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-chocolate [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md"
                                        />
                                    </div>

                                    {/* Price Labels */}
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>{MIN_PRICE.toLocaleString()}đ</span>
                                        <span>{MAX_PRICE.toLocaleString()}đ</span>
                                    </div>
                                </div>
                            </div>

                            {/* Sort By */}
                            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-green-100 shadow-sm">
                                <label className="flex items-center gap-2 text-sm font-bold mb-4 text-chocolate">
                                    <span className="w-1 h-5 bg-chocolate rounded-full"></span>
                                    Sắp xếp
                                </label>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-green-50 transition-colors group">
                                        <input
                                            type="radio"
                                            name="sort"
                                            value="default"
                                            checked={tempSortBy === "default"}
                                            onChange={(e) => setTempSortBy(e.target.value)}
                                            className="w-5 h-5 text-chocolate focus:ring-2 focus:ring-chocolate/50 cursor-pointer"
                                        />
                                        <span className="text-sm font-medium group-hover:text-chocolate transition-colors">Mặc định</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-green-50 transition-colors group">
                                        <input
                                            type="radio"
                                            name="sort"
                                            value="price-asc"
                                            checked={tempSortBy === "price-asc"}
                                            onChange={(e) => setTempSortBy(e.target.value)}
                                            className="w-5 h-5 text-chocolate focus:ring-2 focus:ring-chocolate/50 cursor-pointer"
                                        />
                                        <span className="text-sm font-medium group-hover:text-chocolate transition-colors">Giá: Thấp đến cao</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-green-50 transition-colors group">
                                        <input
                                            type="radio"
                                            name="sort"
                                            value="price-desc"
                                            checked={tempSortBy === "price-desc"}
                                            onChange={(e) => setTempSortBy(e.target.value)}
                                            className="w-5 h-5 text-chocolate focus:ring-2 focus:ring-chocolate/50 cursor-pointer"
                                        />
                                        <span className="text-sm font-medium group-hover:text-chocolate transition-colors">Giá: Cao đến thấp</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-green-50 transition-colors group">
                                        <input
                                            type="radio"
                                            name="sort"
                                            value="name"
                                            checked={tempSortBy === "name"}
                                            onChange={(e) => setTempSortBy(e.target.value)}
                                            className="w-5 h-5 text-chocolate focus:ring-2 focus:ring-chocolate/50 cursor-pointer"
                                        />
                                        <span className="text-sm font-medium group-hover:text-chocolate transition-colors">Tên: A-Z</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 border-t border-green-100 bg-white/80 space-y-3">
                            <button
                                onClick={handleApplyFilters}
                                className="w-full py-3 bg-chocolate text-white rounded-xl hover:bg-chocolate/90 transition-all font-bold shadow-lg shadow-chocolate/20 hover:shadow-xl hover:scale-[1.02] active:scale-95"
                            >
                                Áp dụng bộ lọc
                            </button>
                            <button
                                onClick={handleResetFilters}
                                className="w-full py-3 border-2 border-green-200 rounded-xl hover:bg-green-50 transition-all font-semibold text-chocolate hover:border-chocolate"
                            >
                                Đặt lại
                            </button>
                        </div>
                    </div>
                </div>

                {/* Overlay */}
                {isFilterOpen && (
                    <div
                        onClick={() => setIsFilterOpen(false)}
                        className="fixed inset-0 bg-black/50 z-40"
                    />
                )}

                {/* Products Grid */}
                {isLoading ? (
                    <div className="col-span-full text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-chocolate"></div>
                        <p className="mt-4 text-muted-foreground">Đang tải sản phẩm...</p>
                    </div>
                ) : (
                    <>
                        <div className={`grid grid-cols-2 sm:grid-cols-2 gap-4 ${gridCols === 3 ? 'md:grid-cols-3' : 'md:grid-cols-3 lg:grid-cols-4'
                            }`}>
                            {displayedProducts && displayedProducts.length > 0 ? (
                                displayedProducts.map((p) => <ProductCard key={p.id} product={p} />)
                            ) : (
                                <div className="col-span-full text-center text-muted-foreground py-12">
                                    Không tìm thấy sản phẩm nào.
                                </div>
                            )}
                        </div>

                        {/* Load More Trigger */}
                        {hasMore && (
                            <div ref={loadMoreRef} className="col-span-full flex justify-center py-8">
                                <div className="flex items-center gap-2 text-chocolate bg-white/90 px-6 py-3 rounded-full shadow-md border border-green-200">
                                    <div className="w-5 h-5 border-3 border-chocolate border-t-transparent rounded-full animate-spin"></div>
                                    <span className="font-semibold">Đang tải thêm sản phẩm...</span>
                                </div>
                            </div>
                        )}

                        {/* End Message */}
                        {!hasMore && displayedProducts.length > 12 && (
                            <div className="col-span-full text-center py-6">
                                <p className="text-sm text-muted-foreground bg-white/80 inline-block px-4 py-2 rounded-full">
                                    Đã hiển thị tất cả {filteredProducts.length} sản phẩm
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
