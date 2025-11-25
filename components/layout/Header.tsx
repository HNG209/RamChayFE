// components/layout/Header.tsx
"use client"; // Phải có vì dùng useState

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ShoppingCart, User } from "lucide-react";
import { usePathname } from "next/navigation";
import Image from "next/image";

// Định nghĩa menu để dùng chung cho cả Desktop và Mobile
const NAV_ITEMS = [
  { label: "Trang chủ", href: "/" },
  { label: "Sản phẩm", href: "/products" },
  { label: "Câu chuyện", href: "/about" },
  { label: "Liên hệ", href: "/contact" },
];

export default function Header() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const pathname = usePathname(); // Để highlight menu đang chọn

  // Hàm kiểm tra active link
  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* --- MAIN HEADER --- */}
      <header className="sticky top-0 z-40 w-full bg-cream-light/80 backdrop-blur-md border-b border-lime-accent">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* 1. LOGO */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png" // Next.js tự hiểu bắt đầu từ thư mục public
              alt="RamChay Logo" // Cần thiết cho SEO
              width={150} // Chiều rộng gốc của ảnh (để Next.js tính tỉ lệ)
              height={50} // Chiều cao gốc của ảnh
              quality={100} // Chất lượng ảnh (1-100)
              priority={true} // Quan trọng: Báo Next.js tải ngay lập tức (vì là Logo đầu trang)
              className="h-10 w-auto object-contain" // Tailwind: Cao 40px, rộng tự động co giãn
            />
          </Link>

          {/* 2. DESKTOP NAVBAR (Ẩn trên mobile) */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-lime-primary ${
                  isActive(item.href)
                    ? "text-lime-primary font-bold"
                    : "text-gray-600"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* 3. ACTIONS (Giỏ hàng, User, Mobile Menu Btn) */}
          <div className="flex items-center gap-4">
            {/* Giỏ hàng */}
            <Link
              href="/cart"
              className="relative p-2 hover:bg-lime-accent/20 rounded-full transition-colors"
            >
              <ShoppingCart className="w-5 h-5 text-gray-700" />
              <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                2
              </span>
            </Link>

            {/* Nút Login (Desktop) */}
            <Link
              href="/login"
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-lime-primary text-white rounded-full text-sm font-semibold hover:bg-lime-hover transition-all"
            >
              <User className="w-4 h-4" />
              Đăng nhập
            </Link>

            {/* Nút Hamburger (Chỉ hiện trên Mobile) */}
            <button
              className="md:hidden p-2 text-gray-700 hover:text-lime-primary"
              onClick={() => setIsDrawerOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* --- MOBILE DRAWER (Overlay) --- */}
      {/* Màn hình đen mờ che phía sau */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 transition-opacity"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* Nội dung Drawer trượt từ phải sang */}
      <div
        className={`fixed top-0 right-0 h-full w-[280px] bg-white shadow-2xl z-[60] transform transition-transform duration-300 ease-in-out ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <span className="font-bold text-lg text-lime-primary">Menu</span>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-2 text-gray-500 hover:text-red-500"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Drawer Links */}
          <div className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-4">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`block px-4 py-3 rounded-lg ${
                      isActive(item.href)
                        ? "bg-lime-accent/30 text-lime-primary font-bold"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={() => setIsDrawerOpen(false)} // Đóng drawer khi click
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Drawer Footer (Nút Login Mobile) */}
          <div className="p-4 border-t border-gray-100">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 w-full py-3 bg-lime-primary text-white rounded-xl font-bold shadow-md hover:bg-lime-hover active:scale-95 transition-all"
              onClick={() => setIsDrawerOpen(false)}
            >
              <User className="w-5 h-5" />
              Đăng nhập / Đăng ký
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
