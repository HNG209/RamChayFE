// components/admin/AdminSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Users,
  ShieldCheck,
  ShoppingBag,
  LogOut,
  ChevronRight, // Thêm icon này để trang trí
} from "lucide-react";
import { useSelector } from "react-redux";
import { useLogoutMutation } from "@/redux/services/authApi";
import { useRouter } from "next/navigation";
import { RootState } from "@/redux/store";
import { MyProfile } from "@/types/backend";
import Image from "next/image";
import { useState } from "react";

const ADMIN_MENU = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    items: [
      {
        label: "Trang chủ",
        href: "/admin",
        allowedRoles: ["ROLE_ADMIN", "ROLE_MANAGER"],
      },
    ],
  },
  {
    label: "Sản phẩm",
    icon: Package,
    items: [
      {
        label: "Danh sách",
        href: "/admin/products",
        allowedRoles: ["ROLE_ADMIN", "ROLE_MANAGER"],
      },
      {
        label: "Thêm sản phẩm",
        href: "/admin/products/create",
        allowedRoles: ["ROLE_ADMIN"],
      },
    ],
  },
  {
    label: "Đơn hàng",
    icon: ShoppingBag,
    items: [
      {
        label: "Quản lý đơn hàng",
        href: "/admin/orders",
        allowedRoles: ["ROLE_MANAGER", "ROLE_ADMIN"],
      },
    ],
  },
  {
    label: "Nhân sự",
    icon: Users,
    items: [
      {
        label: "Danh sách nhân viên",
        href: "/admin/managers",
        allowedRoles: ["ROLE_ADMIN"],
      },
    ],
  },
  {
    label: "Quyền hạn",
    icon: ShieldCheck,
    items: [
      {
        label: "Danh sách quyền hạn",
        href: "/admin/roles",
        allowedRoles: ["ROLE_ADMIN"],
      },
    ],
  },
];

const AdminAvatar = ({ fullName }: { fullName?: string }) => {
  const letter = fullName ? fullName.charAt(0).toUpperCase() : "A";
  return (
    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-lime-400 to-lime-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shrink-0">
      {letter}
    </div>
  );
};

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [logout] = useLogoutMutation();
  // Đổi openMenu thành mảng để mở nhiều menu cha
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  const user = useSelector(
    (state: RootState) => state.auth.user
  ) as MyProfile | null;

  const hasPermission = (allowedRoles: string[]) => {
    if (!user || !user.roles) return false;
    return user.roles.some((userRole) => allowedRoles.includes(userRole));
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      router.push("/admin/login");
    } catch (e) {
      console.error(e);
    }
  };

  // Hàm toggle menu cha
  const toggleMenu = (label: string) => {
    setOpenMenus((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#111827] text-white border-r border-gray-800">
      {/* 1. HEADER MỚI: HIỂN THỊ PROFILE THAY VÌ LOGO */}
      <div className="h-20 flex items-center px-6 border-b border-gray-800 bg-[#0f1523]">
        {user && !user.roles.includes("ROLE_CUSTOMER") ? (
          <div className="flex items-center gap-3 w-full group cursor-pointer">
            {/* Avatar */}
            <AdminAvatar fullName={user.fullName} />

            {/* Tên & Role */}
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold text-white truncate group-hover:text-lime-primary transition-colors">
                {user.fullName}
              </h2>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <p className="text-xs text-gray-400 truncate">Administrator</p>
              </div>
            </div>

            {/* Icon nhỏ trang trí */}
            <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-lime-primary transition-colors" />
          </div>
        ) : (
          // Fallback nếu chưa load được user
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
        )}
      </div>

      {/* 2. MENU NAVIGATION */}
      <nav className="flex-1 py-6 space-y-1 px-4">
        <p className="px-2 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Quản lý chung
        </p>

        {ADMIN_MENU.map((menu) => {
          const visibleItems = menu.items.filter((sub) =>
            hasPermission(sub.allowedRoles)
          );
          if (visibleItems.length === 0) return null;

          const isOpen = openMenus.includes(menu.label);

          return (
            <div key={menu.label}>
              {/* MENU CHA */}
              <button
                onClick={() => toggleMenu(menu.label)}
                className="flex items-center justify-between w-full px-3 py-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-xl transition-all"
              >
                <div className="flex items-center gap-3">
                  <menu.icon className="w-5 h-5" />
                  {menu.label}
                </div>
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${
                    isOpen ? "rotate-90" : ""
                  }`}
                />
              </button>

              {/* SUBMENU dạng cây với đường kẻ dọc, padding nhỏ hơn */}
              {isOpen && (
                <div className="relative mt-1 pl-4">
                  {/* Đường kẻ dọc */}
                  <div className="absolute left-1 top-0 bottom-0 w-px bg-gray-700" />
                  <div className="space-y-1">
                    {visibleItems.map((sub) => {
                      const isActive = pathname === sub.href;
                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className={`flex items-center gap-2 px-2 py-2 text-sm rounded-lg relative
                            ${
                              isActive
                                ? "text-lime-400 bg-lime-primary/10 font-semibold"
                                : "text-gray-400 hover:text-white hover:bg-gray-800"
                            }`}
                        >
                          <span className="w-2 h-2 rounded-full bg-lime-400 mr-2 inline-block" />
                          {sub.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* 3. FOOTER: CHỈ CÒN NÚT LOGOUT */}
      <div className="p-4 border-t border-gray-800 bg-[#0f1523]">
        <button
          onClick={handleLogout}
          className="group flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
