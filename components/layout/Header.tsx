// components/layout/Header.tsx
"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import {
  Menu,
  X,
  ShoppingCart,
  User,
  LogOut,
  Settings,
  FileText,
  ChevronDown,
  Search,
  Sparkles,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
// import { logout } from "@/redux/slices/authSlice"; // Nhớ import action logout
import { UserAvatar } from "../UserAvatar";
import { useLogoutMutation } from "@/redux/services/authApi";
import { useGetCartItemsQuery } from "@/redux/services/cartApi";

const NAV_ITEMS = [
  { label: "Trang chủ", href: "/" },
  { label: "Sản phẩm", href: "/products" },
  { label: "Câu chuyện", href: "/about" },
  { label: "Liên hệ", href: "/contact" },
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  // State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false); // Menu dropdown desktop
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isAISearch, setIsAISearch] = useState(false);
  const [logout] = useLogoutMutation();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load AI search preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('aiSearchEnabled');
    if (saved !== null) {
      setIsAISearch(saved === 'true');
    }
  }, []);

  // Toggle AI search and save to localStorage
  const toggleAISearch = () => {
    const newValue = !isAISearch;
    setIsAISearch(newValue);
    localStorage.setItem('aiSearchEnabled', String(newValue));
  };

  // Debounced search effect
  useEffect(() => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Only trigger if searchTerm has value and on products page
    if (searchTerm.trim() && pathname === '/products') {
      debounceTimerRef.current = setTimeout(() => {
        const searchUrl = `/products?search=${encodeURIComponent(searchTerm.trim())}&aiSearch=${isAISearch}`;
        router.push(searchUrl);
      }, 500); // 500ms debounce
    }

    // Cleanup on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchTerm, isAISearch, router, pathname]);

  // Lấy user từ Redux (ép kiểu MyProfile để gợi ý code)
  const user = useSelector((state: RootState) => state.auth.user);

  // Fetch cart items để lấy số lượng
  const { data: cartData } = useGetCartItemsQuery(
    { page: 0, size: 100 },
    {
      // Refetch khi mount component hoặc khi argument thay đổi
      refetchOnMountOrArgChange: true,
      // Refetch khi window được focus lại
      refetchOnFocus: true,
      // Poll mỗi 3 giây (optional, có thể bỏ nếu không cần)
      // pollingInterval: 3000,
    }
  );
  const cartItemsCount = cartData?.content.reduce((total, item) => total + item.quantity, 0) || 0;

  console.log('Cart data in Header:', cartData, 'Count:', cartItemsCount);

  const isActive = (path: string) => pathname === path;

  // Xử lý search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      const searchUrl = `/products?search=${encodeURIComponent(searchTerm.trim())}&aiSearch=${isAISearch}`;
      router.push(searchUrl);
      setSearchTerm("");
    }
  };

  // Xử lý đăng xuất
  const handleLogout = async () => {
    try {
      await logout().unwrap();
      setIsUserMenuOpen(false);
      setIsDrawerOpen(false);
      router.push("/login");
    } catch (error) {
      console.error("Logout", error);
    }
  };

  return (
    <>
      {/* --- MAIN HEADER --- */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md border-b border-white/20 overflow-visible">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-linear-to-r from-emerald-100 via-green-100 to-lime-100 animate-gradient-shift -z-10"></div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-green-300/30 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-lime-300/30 rounded-full blur-3xl -z-10"></div>

        {/* Grass/Plant Stickers at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none flex items-end justify-between px-4 opacity-40 -z-10">
          <span className="text-2xl">🌿</span>
          <span className="text-xl">🌱</span>
          <span className="text-2xl">🍃</span>
          <span className="text-xl">🌿</span>
          <span className="text-2xl">🌱</span>
          <span className="text-xl">🍃</span>
          <span className="text-2xl">🌿</span>
          <span className="text-xl">🌱</span>
          <span className="text-2xl">🍃</span>
          <span className="text-xl">🌿</span>
        </div>

        <div className="container mx-auto px-4 h-16 flex items-center justify-between relative z-10">
          {/* 1. LOGO */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="RamChay Logo"
              width={150}
              height={50}
              quality={100}
              priority={true}
              className="h-10 w-auto object-contain"
            />
          </Link>

          {/* 2. DESKTOP NAVBAR */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-lime-primary ${isActive(item.href)
                  ? "text-lime-primary font-bold"
                  : "text-gray-600"
                  }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* 2.5 SEARCH BAR - Desktop */}
          <form onSubmit={handleSearch} className="hidden lg:flex items-center flex-1 max-w-md mx-8 gap-2">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
              <input
                type="text"
                placeholder={isAISearch ? "Tìm kiếm thông minh với AI..." : "Tìm kiếm sản phẩm..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-lime-primary/50 focus:border-lime-primary relative z-10 bg-white"
              />
              {/* Sparkle Effect */}
              {isSearchFocused && (
                <div className="absolute inset-0 -z-10 pointer-events-none">
                  <span className="absolute -top-2 left-8 text-xl animate-sparkle-1">🥬</span>
                  <span className="absolute -top-3 left-20 text-lg animate-sparkle-2">🥕</span>
                  <span className="absolute -bottom-2 left-16 text-xl animate-sparkle-3">🥦</span>
                  <span className="absolute -top-2 right-12 text-lg animate-sparkle-4">🍄</span>
                  <span className="absolute -bottom-3 right-8 text-xl animate-sparkle-5">🌽</span>
                  <span className="absolute -top-1 right-24 text-lg animate-sparkle-1">🫑</span>
                </div>
              )}
            </div>
            {/* AI Search Toggle */}
            <button
              type="button"
              onClick={toggleAISearch}
              className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${isAISearch
                ? 'bg-linear-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              title={isAISearch ? "Sử dụng AI Semantic Search" : "Sử dụng tìm kiếm thường"}
            >
              <Sparkles className={`w-4 h-4 ${isAISearch ? 'animate-pulse' : ''}`} />
              {isAISearch ? 'AI' : 'ABC'}
            </button>
          </form>

          {/* 3. ACTIONS */}
          <div className="flex items-center gap-4">
            {/* Giỏ hàng */}
            <Link
              href="/cart"
              className="relative p-2 hover:bg-lime-accent/20 rounded-full transition-colors"
              data-cart-icon
            >
              <ShoppingCart className="w-5 h-5 text-gray-700" />
              {cartItemsCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {/* --- USER SECTION (DESKTOP) --- */}
            <div className="hidden md:block relative">
              {user ? (
                // A. ĐÃ ĐĂNG NHẬP -> Hiện Avatar + Dropdown
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  >
                    <UserAvatar
                      fullName={user.fullName}
                      className="w-8 h-8 text-sm"
                    />
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <>
                      {/* Lớp nền trong suốt để click ra ngoài thì đóng menu */}
                      <div
                        className="fixed inset-0 z-60 cursor-default"
                        onClick={() => setIsUserMenuOpen(false)}
                      />

                      {/* Menu content */}
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-70 overflow-hidden py-1">
                        {/* Header của menu */}
                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                          <p className="text-sm font-bold text-gray-800 truncate">
                            {user.fullName}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            @{user.username}
                          </p>
                        </div>

                        {/* Các mục menu */}
                        <Link
                          href="/account"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-lime-50 hover:text-lime-primary transition-colors"
                        >
                          <User className="w-4 h-4" /> Tài khoản của tôi
                        </Link>
                        <Link
                          href="/orders"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-lime-50 hover:text-lime-primary transition-colors"
                        >
                          <FileText className="w-4 h-4" /> Đơn mua
                        </Link>
                        <Link
                          href="/settings"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-lime-50 hover:text-lime-primary transition-colors"
                        >
                          <Settings className="w-4 h-4" /> Cài đặt
                        </Link>

                        {/* Nút Đăng xuất */}
                        <div className="border-t border-gray-100 mt-1">
                          <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                          >
                            <LogOut className="w-4 h-4" /> Đăng xuất
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                // B. CHƯA ĐĂNG NHẬP -> Hiện nút Login cũ
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-4 py-2 bg-lime-primary text-white rounded-full text-sm font-semibold hover:bg-lime-hover transition-all"
                >
                  <User className="w-4 h-4" />
                  Đăng nhập
                </Link>
              )}
            </div>

            {/* Nút Hamburger (Mobile) */}
            <button
              className="md:hidden p-2 text-gray-700 hover:text-lime-primary"
              onClick={() => setIsDrawerOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* --- MOBILE DRAWER --- */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 transition-opacity"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-[280px] bg-white shadow-2xl z-60 transform transition-transform duration-300 ease-in-out ${isDrawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Drawer Header: Hiển thị User nếu đã login */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-cream-light/50">
            {user ? (
              <div className="flex items-center gap-3">
                <UserAvatar
                  fullName={user.fullName}
                  className="w-10 h-10 text-lg shadow-sm"
                />
                <div className="overflow-hidden">
                  <p className="font-bold text-gray-800 text-sm truncate w-32">
                    {user.fullName}
                  </p>
                  <p className="text-xs text-lime-primary font-medium">
                    Thành viên
                  </p>
                </div>
              </div>
            ) : (
              <span className="font-bold text-lg text-lime-primary">Menu</span>
            )}

            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-2 text-gray-500 hover:text-red-500 bg-white rounded-full shadow-sm"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Links */}
          <div className="flex-1 overflow-y-auto py-4">
            {/* Mobile Search Bar */}
            <div className="px-4 mb-4">
              <form onSubmit={handleSearch} className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={isAISearch ? "Tìm kiếm với AI..." : "Tìm kiếm sản phẩm..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-lime-primary/50 focus:border-lime-primary bg-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={toggleAISearch}
                  className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all ${isAISearch
                    ? 'bg-linear-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  <Sparkles className={`w-4 h-4 ${isAISearch ? 'animate-pulse' : ''}`} />
                  {isAISearch ? 'Đang dùng AI Search' : 'Dùng AI Search'}
                </button>
              </form>
              <div className="mt-3 border-t border-gray-100"></div>
            </div>

            <ul className="space-y-1 px-4">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`block px-4 py-3 rounded-lg ${isActive(item.href)
                      ? "bg-lime-accent/30 text-lime-primary font-bold"
                      : "text-gray-700 hover:bg-gray-50"
                      }`}
                    onClick={() => setIsDrawerOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}

              {/* Thêm link quản lý tài khoản cho Mobile */}
              {user && (
                <>
                  <div className="my-2 border-t border-gray-100"></div>
                  <li>
                    <Link
                      href="/profile"
                      className="px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <User className="w-4 h-4" /> Tài khoản của tôi
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/orders"
                      className="px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" /> Đơn mua
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Drawer Footer: Login hoặc Logout */}
          <div className="p-4 border-t border-gray-100">
            {user ? (
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full py-3 bg-red-50 text-red-600 rounded-xl font-bold shadow-sm hover:bg-red-100 active:scale-95 transition-all"
              >
                <LogOut className="w-5 h-5" />
                Đăng xuất
              </button>
            ) : (
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 w-full py-3 bg-lime-primary text-white rounded-xl font-bold shadow-md hover:bg-lime-hover active:scale-95 transition-all"
                onClick={() => setIsDrawerOpen(false)}
              >
                <User className="w-5 h-5" />
                Đăng nhập / Đăng ký
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
