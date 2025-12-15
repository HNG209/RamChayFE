"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import ProductCard from "@/components/ProductCard";
import {
  SlidersHorizontal,
  X,
  Grid3x3,
  LayoutGrid,
  Sparkles,
} from "lucide-react";
import {
  useGetProductsQuery,
  useSearchProductsAIQuery,
} from "@/redux/services/productApi";
import { useSearchParams, useRouter } from "next/navigation";
import { useInView } from "react-intersection-observer";

export default function CustomerProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchFromUrl = searchParams.get("search") || "";
  const aiSearchFromUrl = searchParams.get("aiSearch") === "true";
  const [searchTerm, setSearchTerm] = useState(searchFromUrl);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAISearch, setIsAISearch] = useState(false); // Toggle AI search

  // Sync AI search from URL or localStorage
  useEffect(() => {
    // Prioritize URL param, then localStorage
    if (searchParams.get("aiSearch") !== null) {
      setIsAISearch(aiSearchFromUrl);
    } else {
      const saved = localStorage.getItem("aiSearchEnabled");
      if (saved !== null) {
        setIsAISearch(saved === "true");
      }
    }
  }, [aiSearchFromUrl, searchParams]); // Re-sync when URL changes

  // Infinite scroll state
  const [displayedCount, setDisplayedCount] = useState(12); // Hiển thị 12 sản phẩm ban đầu
  const ITEMS_PER_PAGE = 8; // Load thêm 8 sản phẩm mỗi lần

  // Intersection observer for infinite scroll
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: "200px",
  });

  // Sync searchTerm với URL khi searchParams thay đổi
  useEffect(() => {
    setSearchTerm(searchFromUrl);
  }, [searchFromUrl]);

  // Fetch products từ API
  const { data: regularProductsData, isLoading: isLoadingRegular } =
    useGetProductsQuery();

  // AI Search - chỉ gọi khi bật AI và có search term
  const {
    data: aiSearchData,
    isLoading: isLoadingAI,
    error: aiSearchError,
  } = useSearchProductsAIQuery(searchTerm, {
    skip: !searchTerm || !isAISearch,
  });

  // Debug logs
  useEffect(() => {
    console.log("🔍 Products Page Debug:", {
      searchTerm,
      isAISearch,
      searchFromUrl,
      aiSearchFromUrl,
      willSkipAI: !searchTerm || !isAISearch,
      aiSearchData,
      aiSearchDataLength: aiSearchData?.length,
      aiSearchError,
      regularProductsData: regularProductsData?.length,
      isLoadingAI,
      isLoadingRegular,
    });
  }, [
    searchTerm,
    isAISearch,
    searchFromUrl,
    aiSearchFromUrl,
    aiSearchData,
    aiSearchError,
    regularProductsData,
    isLoadingAI,
    isLoadingRegular,
  ]);

  // Xác định data nào được sử dụng
  // Nếu AI Search lỗi, fallback về regular products và filter bằng tìm kiếm thông thường
  const apiProducts =
    searchTerm && isAISearch && !aiSearchError
      ? aiSearchData || []
      : regularProductsData || [];

  console.log("📦 API Products Selected:", {
    source: searchTerm && isAISearch ? "AI Search" : "Regular",
    count: apiProducts.length,
    data: apiProducts,
  });

  const isLoading = searchTerm && isAISearch ? isLoadingAI : isLoadingRegular;

  // Tính price range động từ danh sách sản phẩm
  const MIN_PRICE = 0;
  const MAX_PRICE =
    apiProducts.length > 0
      ? Math.max(...apiProducts.map((p) => p.price))
      : 100000;

  // Temporary filter states (chưa apply)
  const [tempCategory, setTempCategory] = useState("all");
  const [tempMinPrice, setTempMinPrice] = useState(MIN_PRICE);
  const [tempMaxPrice, setTempMaxPrice] = useState(MAX_PRICE);
  const [tempSortBy, setTempSortBy] = useState("default");

  // Applied filter states (đã apply)
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [minPrice, setMinPrice] = useState(MIN_PRICE);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [sortBy, setSortBy] = useState("default");

  // Grid columns state (chỉ áp dụng cho màn hình lớn)
  const [gridCols, setGridCols] = useState<3 | 4>(4);

  // Floating stickers state
  const [floatingStickers, setFloatingStickers] = useState<
    Array<{ id: number; emoji: string; side: "left" | "right"; delay: number }>
  >([]);

  const veganEmojis = [
    "🥬",
    "🥦",
    "🥕",
    "🍄",
    "🌽",
    "🫑",
    "🥒",
    "🍅",
    "🥑",
    "🫛",
  ];

  // Lấy danh sách categories
  const categories = [
    "all",
    ...new Set(
      apiProducts.map((p) => p.category?.categoryName).filter(Boolean)
    ),
  ];

  // Update price range khi data thay đổi
  useEffect(() => {
    if (apiProducts.length > 0) {
      const maxProductPrice = Math.max(...apiProducts.map((p) => p.price));
      setTempMaxPrice(maxProductPrice);
      setMaxPrice(maxProductPrice);
    }
  }, [apiProducts.length]);

  // Floating stickers effect khi mở filter
  useEffect(() => {
    if (!isFilterOpen) {
      setFloatingStickers([]);
      return;
    }

    const interval = setInterval(() => {
      // Random chance to spawn a sticker (80% chance every interval)
      if (Math.random() > 0.2) {
        const newSticker = {
          id: Date.now() + Math.random(),
          emoji: veganEmojis[Math.floor(Math.random() * veganEmojis.length)],
          side: Math.random() > 0.5 ? "left" : ("right" as "left" | "right"),
          delay: 0,
        };

        setFloatingStickers((prev) => [...prev, newSticker]);

        // Remove sticker after animation completes (4 seconds)
        setTimeout(() => {
          setFloatingStickers((prev) =>
            prev.filter((s) => s.id !== newSticker.id)
          );
        }, 4000);
      }
    }, 4000); // Check every 4 seconds

    return () => clearInterval(interval);
  }, [isFilterOpen]);

  // Apply filters
  const handleApplyFilters = () => {
    setSelectedCategory(tempCategory);
    setMinPrice(tempMinPrice);
    setMaxPrice(tempMaxPrice);
    setSortBy(tempSortBy);
    setIsFilterOpen(false);
  };

  // Reset filters
  const handleResetFilters = () => {
    setTempCategory("all");
    setTempMinPrice(MIN_PRICE);
    setTempMaxPrice(MAX_PRICE);
    setTempSortBy("default");
    setSelectedCategory("all");
    setMinPrice(MIN_PRICE);
    setMaxPrice(MAX_PRICE);
    setSortBy("default");
    setSearchTerm("");
    // Xóa search param khỏi URL
    router.push("/products");
  };

  // Lọc sản phẩm
  let filteredProducts = apiProducts;

  // Lọc theo tìm kiếm (chỉ áp dụng cho search thường, AI search đã xử lý trên server)
  if (searchTerm && !isAISearch) {
    filteredProducts = filteredProducts.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Lọc theo category
  if (selectedCategory !== "all") {
    filteredProducts = filteredProducts.filter(
      (p) => p.category?.categoryName === selectedCategory
    );
  }

  // Lọc theo giá
  filteredProducts = filteredProducts.filter(
    (p) => p.price >= minPrice && p.price <= maxPrice
  );

  // Sắp xếp
  if (sortBy === "price-asc") {
    filteredProducts = [...filteredProducts].sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-desc") {
    filteredProducts = [...filteredProducts].sort((a, b) => b.price - a.price);
  } else if (sortBy === "name") {
    filteredProducts = [...filteredProducts].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }

  console.log("🎯 Filtered Products:", {
    totalApiProducts: apiProducts.length,
    afterFiltering: filteredProducts.length,
    filters: {
      selectedCategory,
      minPrice,
      maxPrice,
      sortBy,
      searchTerm,
      isAISearch,
    },
  });

  // Infinite scroll: Lấy sản phẩm để hiển thị
  const displayedProducts = filteredProducts.slice(0, displayedCount);
  const hasMore = displayedCount < filteredProducts.length;

  // Load more khi scroll đến cuối
  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      setDisplayedCount((prev) => prev + ITEMS_PER_PAGE);
    }
  }, [inView, hasMore, isLoading]);

  // Reset displayed count khi filter thay đổi
  useEffect(() => {
    setDisplayedCount(12);
  }, [searchTerm, selectedCategory, minPrice, maxPrice, sortBy]);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-green-50/30 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-linear-to-r from-chocolate to-amber-700 bg-clip-text text-transparent mb-2">
            Sản phẩm
          </h1>
          <p className="text-gray-600">
            Khám phá các sản phẩm tươi ngon, thuần chay
          </p>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {/* Grid Columns Toggle (Desktop only) */}
            <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
              <span className="text-sm text-muted-foreground">Hiển thị:</span>
              <button
                onClick={() => setGridCols(3)}
                className={`p-2 rounded transition-colors ${
                  gridCols === 3
                    ? "bg-chocolate text-white"
                    : "bg-background hover:bg-muted-foreground/10"
                }`}
                title="3 cột"
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setGridCols(4)}
                className={`p-2 rounded transition-colors ${
                  gridCols === 4
                    ? "bg-chocolate text-white"
                    : "bg-background hover:bg-muted-foreground/10"
                }`}
                title="4 cột"
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filter Toggle Button - Right side */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-chocolate text-white rounded-lg hover:bg-chocolate/90 transition-colors"
          >
            <SlidersHorizontal className="w-5 h-5" />
            Bộ lọc
          </button>
        </div>

        {/* Active Filters Display */}
        {(selectedCategory !== "all" ||
          minPrice !== MIN_PRICE ||
          maxPrice !== MAX_PRICE ||
          sortBy !== "default" ||
          searchTerm) && (
          <div className="mb-4 flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground">Đang lọc:</span>
            {searchTerm && (
              <>
                <span className="px-3 py-1 bg-green-100 text-amber-950 text-sm rounded-full flex items-center gap-1">
                  {isAISearch && <Sparkles className="w-3 h-3" />}
                  Tìm kiếm {isAISearch && "AI"}: "{searchTerm}"
                </span>
                {isAISearch && !aiSearchError && (
                  <span className="px-3 py-1 bg-linear-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full font-semibold shadow-md">
                    🤖 AI Semantic Search
                  </span>
                )}
                {isAISearch && aiSearchError && (
                  <span className="px-3 py-1 bg-linear-to-r from-orange-500 to-red-500 text-white text-xs rounded-full font-semibold shadow-md animate-pulse">
                    ⚠️ AI Search lỗi - Dùng tìm kiếm thường
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
            Tìm thấy{" "}
            <span className="text-lg font-bold">{filteredProducts.length}</span>{" "}
            sản phẩm
          </p>
        </div>

        {/* Filter Sidebar giữ nguyên code cũ, chỉ cần đổi className nếu muốn đồng bộ hơn */}

        {/* Products Grid */}
        {isLoading ? (
          <div className="col-span-full text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-chocolate"></div>
            <p className="mt-4 text-muted-foreground">Đang tải sản phẩm...</p>
          </div>
        ) : (
          <>
            <div
              className={`grid grid-cols-2 sm:grid-cols-2 gap-4 ${
                gridCols === 3
                  ? "md:grid-cols-3"
                  : "md:grid-cols-3 lg:grid-cols-4"
              }`}
            >
              {displayedProducts && displayedProducts.length > 0 ? (
                displayedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))
              ) : (
                <div className="col-span-full text-center text-muted-foreground py-12">
                  Không tìm thấy sản phẩm nào.
                </div>
              )}
            </div>

            {/* Load More Trigger */}
            {hasMore && (
              <div
                ref={loadMoreRef}
                className="col-span-full flex justify-center py-8"
              >
                <div className="flex items-center gap-2 text-chocolate bg-white/90 px-6 py-3 rounded-full shadow-md border border-green-200">
                  <div className="w-5 h-5 border-3 border-chocolate border-t-transparent rounded-full animate-spin"></div>
                  <span className="font-semibold">
                    Đang tải thêm sản phẩm...
                  </span>
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
