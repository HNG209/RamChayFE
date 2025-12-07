"use client"

import { useState } from "react"
import ProductCard from "@/components/ProductCard"
import { Search, SlidersHorizontal, X } from "lucide-react"

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
    const [searchTerm, setSearchTerm] = useState("")
    const [isFilterOpen, setIsFilterOpen] = useState(false)

    // Price range constants
    const MIN_PRICE = 0
    const MAX_PRICE = 100000

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

    // Lấy danh sách categories
    const categories = ["all", ...new Set(mockProducts.map(p => p.category.categoryName))]

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
    }

    // Lọc sản phẩm
    let filteredProducts = mockProducts

    // Lọc theo tìm kiếm
    if (searchTerm) {
        filteredProducts = filteredProducts.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }

    // Lọc theo category
    if (selectedCategory !== "all") {
        filteredProducts = filteredProducts.filter(p => p.category.categoryName === selectedCategory)
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

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Sản phẩm</h1>

                {/* Filter Toggle Button */}
                <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="flex items-center gap-2 px-4 py-2 bg-chocolate text-white rounded-lg hover:bg-chocolate/90 transition-colors"
                >
                    <SlidersHorizontal className="w-5 h-5" />
                    Bộ lọc
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-chocolate/50"
                />
            </div>

            {/* Active Filters Display */}
            {(selectedCategory !== "all" || minPrice !== MIN_PRICE || maxPrice !== MAX_PRICE || sortBy !== "default") && (
                <div className="mb-4 flex flex-wrap gap-2 items-center">
                    <span className="text-sm text-muted-foreground">Đang lọc:</span>
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
                        className="text-sm text-chocolate hover:underline"
                    >
                        Xóa tất cả
                    </button>
                </div>
            )}

            {/* Result Count */}
            <p className="text-sm text-muted-foreground mb-4">
                Tìm thấy {filteredProducts.length} sản phẩm
            </p>

            {/* Filter Sidebar */}
            <div className={`fixed top-0 right-0 h-full w-80 bg-card border-l border-border shadow-2xl transform transition-transform duration-300 z-50 ${isFilterOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-border">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <SlidersHorizontal className="w-5 h-5" />
                            Bộ lọc
                        </h2>
                        <button
                            onClick={() => setIsFilterOpen(false)}
                            className="p-1 hover:bg-muted rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Filter Options */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                        {/* Category Filter */}
                        <div>
                            <label className="block text-sm font-semibold mb-3">Danh mục</label>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="category"
                                        value="all"
                                        checked={tempCategory === "all"}
                                        onChange={(e) => setTempCategory(e.target.value)}
                                        className="w-4 h-4 text-chocolate focus:ring-chocolate"
                                    />
                                    <span className="text-sm">Tất cả</span>
                                </label>
                                {categories.filter(c => c !== "all").map(cat => (
                                    <label key={cat} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="category"
                                            value={cat}
                                            checked={tempCategory === cat}
                                            onChange={(e) => setTempCategory(e.target.value)}
                                            className="w-4 h-4 text-chocolate focus:ring-chocolate"
                                        />
                                        <span className="text-sm">{cat}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Price Range Filter */}
                        <div>
                            <label className="block text-sm font-semibold mb-3">Khoảng giá</label>
                            <div className="space-y-4">
                                {/* Price Display */}
                                <div className="flex items-center justify-between text-sm">
                                    <input
                                        type="number"
                                        value={tempMinPrice}
                                        onChange={(e) => setTempMinPrice(Math.min(Number(e.target.value), tempMaxPrice))}
                                        className="w-24 px-2 py-1 border border-border rounded text-center focus:outline-none focus:ring-2 focus:ring-chocolate/50"
                                    />
                                    <span className="text-muted-foreground">—</span>
                                    <input
                                        type="number"
                                        value={tempMaxPrice}
                                        onChange={(e) => setTempMaxPrice(Math.max(Number(e.target.value), tempMinPrice))}
                                        className="w-24 px-2 py-1 border border-border rounded text-center focus:outline-none focus:ring-2 focus:ring-chocolate/50"
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
                        <div>
                            <label className="block text-sm font-semibold mb-3">Sắp xếp</label>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="sort"
                                        value="default"
                                        checked={tempSortBy === "default"}
                                        onChange={(e) => setTempSortBy(e.target.value)}
                                        className="w-4 h-4 text-chocolate focus:ring-chocolate"
                                    />
                                    <span className="text-sm">Mặc định</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="sort"
                                        value="price-asc"
                                        checked={tempSortBy === "price-asc"}
                                        onChange={(e) => setTempSortBy(e.target.value)}
                                        className="w-4 h-4 text-chocolate focus:ring-chocolate"
                                    />
                                    <span className="text-sm">Giá: Thấp đến cao</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="sort"
                                        value="price-desc"
                                        checked={tempSortBy === "price-desc"}
                                        onChange={(e) => setTempSortBy(e.target.value)}
                                        className="w-4 h-4 text-chocolate focus:ring-chocolate"
                                    />
                                    <span className="text-sm">Giá: Cao đến thấp</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="sort"
                                        value="name"
                                        checked={tempSortBy === "name"}
                                        onChange={(e) => setTempSortBy(e.target.value)}
                                        className="w-4 h-4 text-chocolate focus:ring-chocolate"
                                    />
                                    <span className="text-sm">Tên: A-Z</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 border-t border-border space-y-2">
                        <button
                            onClick={handleApplyFilters}
                            className="w-full py-2 bg-chocolate text-white rounded-lg hover:bg-chocolate/90 transition-colors font-semibold"
                        >
                            Áp dụng
                        </button>
                        <button
                            onClick={handleResetFilters}
                            className="w-full py-2 border border-border rounded-lg hover:bg-muted transition-colors"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts && filteredProducts.length > 0 ? (
                    filteredProducts.map((p) => <ProductCard key={p.id} product={p} />)
                ) : (
                    <div className="col-span-full text-center text-muted-foreground py-12">
                        Không tìm thấy sản phẩm nào.
                    </div>
                )}
            </div>
        </div>
    );
}
